/**
 * api/paddle-checkout.js — Music Universe · Vercel Serverless
 *
 * POST /api/paddle-checkout
 * Body: { idToken: string, uid: string, email: string }
 *
 * Paddle Checkout session yaradır, URL qaytarır.
 * İstifadəçi həmin URL-ə yönləndirilir → Visa/Mastercard/Google Pay/Apple Pay ilə ödəyir.
 *
 * Env vars (Vercel Dashboard → Settings → Environment Variables):
 *   PADDLE_API_KEY          — Paddle Dashboard → Developer Tools → Authentication → API key
 *   PADDLE_PRICE_ID         — Paddle Dashboard → Catalog → Prices → price_XXXXXXXX
 *   PADDLE_WEBHOOK_SECRET   — Paddle Dashboard → Developer Tools → Notifications → secret
 *   FIREBASE_SERVICE_ACCOUNT — Firebase service account JSON string
 *   APP_URL                 — https://cahsmusic.vercel.app
 */

const admin = require("firebase-admin");

function getFirebaseAdmin(){
  if(admin.apps.length) return admin.app();
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential:  admin.credential.cert(sa),
    databaseURL: "https://lifecanvas12-default-rtdb.firebaseio.com",
  });
  return admin.app();
}

module.exports = async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin",  process.env.APP_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if(req.method === "OPTIONS") return res.status(200).end();
  if(req.method !== "POST")   return res.status(405).json({ error: "POST only" });

  const { idToken, uid, email } = req.body || {};
  if(!idToken || !uid) return res.status(400).json({ error: "idToken and uid required" });

  // 1. Verify Firebase token
  let decoded;
  try{
    getFirebaseAdmin();
    decoded = await admin.auth().verifyIdToken(idToken);
    if(decoded.uid !== uid) throw new Error("UID mismatch");
  }catch(e){
    return res.status(401).json({ error: "Invalid token: " + e.message });
  }

  // 2. Check if already VIP
  const db = admin.database();
  const vipSnap = await db.ref(`users/${uid}/vip`).get().catch(()=>null);
  if(vipSnap?.val() === true){
    return res.status(400).json({ error: "already_vip" });
  }

  const appUrl     = process.env.APP_URL || "https://cahsmusic.vercel.app";
  const PADDLE_KEY = process.env.PADDLE_API_KEY;
  const PRICE_ID   = process.env.PADDLE_PRICE_ID;

  if(!PADDLE_KEY || !PRICE_ID){
    return res.status(500).json({ error: "Paddle env vars missing" });
  }

  // 3. Create Paddle Checkout session via Paddle API v2
  // Paddle Billing API: https://developer.paddle.com/api-reference/transactions/create-transaction
  const paddleRes = await fetch("https://api.paddle.com/transactions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PADDLE_KEY}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      items: [{
        price_id:  PRICE_ID,
        quantity:  1,
      }],
      customer: {
        email: email || decoded.email || "",
      },
      custom_data: {
        firebase_uid: uid,
      },
      checkout: {
        url: `${appUrl}/?vip=success`,
      },
      success_url: `${appUrl}/?vip=success`,
      // Paddle handles cancel — user just closes the tab
    }),
  });

  const paddleData = await paddleRes.json();

  if(!paddleRes.ok || !paddleData.data){
    console.error("[Paddle] API error:", JSON.stringify(paddleData));
    return res.status(500).json({
      error: paddleData?.error?.detail || "Paddle checkout yaradılmadı"
    });
  }

  // The checkout URL is in paddleData.data.checkout.url
  const checkoutUrl = paddleData.data?.checkout?.url;
  if(!checkoutUrl){
    console.error("[Paddle] No checkout URL in response:", JSON.stringify(paddleData));
    return res.status(500).json({ error: "Checkout URL alınmadı" });
  }

  // Save pending transaction reference
  await db.ref(`users/${uid}/paddlePendingTxn`).set(paddleData.data.id);

  return res.status(200).json({ url: checkoutUrl });
};

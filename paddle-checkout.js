/**
 * api/paddle-checkout.js — Music Universe · Vercel Serverless
 *
 * POST /api/paddle-checkout
 * Body: { idToken: string, uid: string, email: string }
 *
 * Env vars:
 *   PADDLE_API_KEY           — pro_... (live) or ctm_... (sandbox)
 *   PADDLE_PRICE_ID          — pri_...
 *   PADDLE_SANDBOX           — "true" for sandbox, omit for live
 *   FIREBASE_SERVICE_ACCOUNT — Firebase service account JSON string
 *   APP_URL                  — https://cahsmusic.vercel.app
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
    return res.status(400).json({ error: "already_vip", message: "Artıq VIP-siniz" });
  }

  const appUrl     = process.env.APP_URL || "https://cahsmusic.vercel.app";
  const PADDLE_KEY = (process.env.PADDLE_API_KEY || "").trim();
  const PRICE_ID   = (process.env.PADDLE_PRICE_ID || "").trim();
  const isSandbox  = process.env.PADDLE_SANDBOX === "true";

  if(!PADDLE_KEY || !PRICE_ID){
    return res.status(500).json({ error: "Paddle env vars missing" });
  }

  // Paddle API base URL — sandbox vs live
  const PADDLE_BASE = isSandbox
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";

  const customerEmail = email || decoded.email || "";

  // 3. Create Paddle transaction (Paddle Billing API v1)
  const body = {
    items: [{ price_id: PRICE_ID, quantity: 1 }],
    custom_data: { firebase_uid: uid },
    checkout: { url: `${appUrl}/?vip=success` },
  };

  // Only add customer email if we have one
  if(customerEmail){
    body.customer = { email: customerEmail };
  }

  let paddleData;
  try{
    const paddleRes = await fetch(`${PADDLE_BASE}/transactions`, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${PADDLE_KEY}`,
        "Content-Type":  "application/json",
        "Paddle-Version": "1",
      },
      body: JSON.stringify(body),
    });

    paddleData = await paddleRes.json();

    if(!paddleRes.ok){
      console.error("[Paddle] API error:", JSON.stringify(paddleData));
      const errMsg = paddleData?.error?.detail
                  || paddleData?.error?.code
                  || `HTTP ${paddleRes.status}`;
      return res.status(500).json({ error: errMsg });
    }
  }catch(e){
    console.error("[Paddle] fetch error:", e.message);
    return res.status(500).json({ error: "Paddle API əlaqə xətası: " + e.message });
  }

  const checkoutUrl = paddleData?.data?.checkout?.url;
  if(!checkoutUrl){
    console.error("[Paddle] No checkout URL:", JSON.stringify(paddleData));
    return res.status(500).json({ error: "Checkout URL alınmadı" });
  }

  // Save pending txn reference
  await db.ref(`users/${uid}/paddlePendingTxn`).set(paddleData.data.id).catch(()=>{});

  return res.status(200).json({ url: checkoutUrl });
};

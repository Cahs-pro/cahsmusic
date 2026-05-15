/**
 * api/paddle-webhook.js — Music Universe · Vercel Serverless
 *
 * POST /api/paddle-webhook  (Paddle tərəfindən çağırılır, client yox)
 *
 * Paddle bu eventləri göndərir:
 *   transaction.completed   → VIP aktiv et
 *   subscription.activated  → VIP aktiv et
 *   subscription.canceled   → VIP ləğv et
 *   subscription.past_due   → VIP ləğv et (ödəniş gecikir)
 *
 * Env vars:
 *   PADDLE_WEBHOOK_SECRET   — Paddle Dashboard → Developer Tools → Notifications → secret key
 *   FIREBASE_SERVICE_ACCOUNT
 */

const crypto = require("crypto");
const admin  = require("firebase-admin");

function getFirebaseAdmin(){
  if(admin.apps.length) return admin.app();
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential:  admin.credential.cert(sa),
    databaseURL: "https://lifecanvas12-default-rtdb.firebaseio.com",
  });
  return admin.app();
}

// Paddle webhook signature verification
// https://developer.paddle.com/webhooks/signature-verification
function verifyPaddleSignature(rawBody, signatureHeader, secret){
  try{
    // signature header format: ts=TIMESTAMP;h1=HASH
    const parts     = Object.fromEntries(signatureHeader.split(";").map(p => p.split("=")));
    const timestamp = parts["ts"];
    const hash      = parts["h1"];
    if(!timestamp || !hash) return false;

    const payload   = `${timestamp}:${rawBody}`;
    const expected  = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
  }catch(e){
    console.error("[Paddle] Signature parse error:", e);
    return false;
  }
}

// Extract Firebase UID from Paddle event custom_data
function extractUID(event){
  return event?.data?.custom_data?.firebase_uid
      || event?.data?.subscription?.custom_data?.firebase_uid
      || null;
}

module.exports = async function handler(req, res){
  if(req.method !== "POST") return res.status(405).end();

  const secret    = process.env.PADDLE_WEBHOOK_SECRET;
  const sigHeader = req.headers["paddle-signature"];

  // rawBody must be string — see config below
  const rawBody   = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

  // Verify signature
  if(secret && sigHeader){
    if(!verifyPaddleSignature(rawBody, sigHeader, secret)){
      console.warn("[Paddle Webhook] Signature verification failed");
      return res.status(401).json({ error: "Invalid signature" });
    }
  } else {
    console.warn("[Paddle Webhook] Missing secret or signature header — verify env vars");
  }

  let event;
  try{
    event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }catch(e){
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const eventType = event?.event_type || event?.notification_type;
  console.log("[Paddle Webhook] Event:", eventType);

  getFirebaseAdmin();
  const db = admin.database();

  try{
    switch(eventType){

      // ── Payment completed → activate VIP ──────────────────────────────
      case "transaction.completed": {
        const uid = extractUID(event);
        if(!uid){
          console.warn("[Paddle] UID not found in transaction.completed");
          // Try to find by customer email
          break;
        }
        const txnId = event?.data?.id || "";
        await db.ref(`users/${uid}`).update({
          vip:               true,
          vipSince:          Date.now(),
          vipMethod:         "paddle",
          paddleTxnId:       txnId,
          paddleCustomerId:  event?.data?.customer_id || null,
        });
        // Remove pending flag
        await db.ref(`users/${uid}/paddlePendingTxn`).remove();
        // Send notification
        await db.ref(`notifications/${uid}`).push({
          type:"vip", fromName:"Music Universe",
          text:"👑 VIP aktiv edildi! Visa/Mastercard ilə ödənişiniz alındı. Bütün limitlər açıldı.",
          ts:Date.now(), read:false,
        });
        console.log(`[Paddle] ✅ VIP activated for UID: ${uid}`);
        break;
      }

      // ── Subscription activated (recurring) → keep VIP ─────────────────
      case "subscription.activated": {
        const uid = extractUID(event);
        if(!uid) break;
        await db.ref(`users/${uid}`).update({
          vip:                    true,
          vipSince:               Date.now(),
          vipMethod:              "paddle_subscription",
          paddleSubscriptionId:   event?.data?.id || null,
          paddleCustomerId:       event?.data?.customer_id || null,
        });
        console.log(`[Paddle] ✅ Subscription activated for UID: ${uid}`);
        break;
      }

      // ── Subscription renewed → keep VIP active ─────────────────────────
      case "subscription.updated": {
        const status = event?.data?.status;
        if(status === "active"){
          const uid = extractUID(event);
          if(uid) await db.ref(`users/${uid}`).update({ vip: true, vipRenewed: Date.now() });
        }
        break;
      }

      // ── Subscription cancelled → revoke VIP ───────────────────────────
      case "subscription.canceled": {
        const uid = extractUID(event);
        if(!uid) break;
        await db.ref(`users/${uid}`).update({
          vip:                  false,
          vipRevokedReason:     "subscription_cancelled",
          paddleSubscriptionId: null,
        });
        await db.ref(`notifications/${uid}`).push({
          type:"vip", fromName:"Music Universe",
          text:"ℹ️ VIP abunəliyiniz ləğv edildi.",
          ts:Date.now(), read:false,
        });
        console.log(`[Paddle] VIP cancelled for UID: ${uid}`);
        break;
      }

      // ── Payment past due → warn user ──────────────────────────────────
      case "subscription.past_due": {
        const uid = extractUID(event);
        if(!uid) break;
        await db.ref(`notifications/${uid}`).push({
          type:"vip", fromName:"Music Universe",
          text:"⚠️ VIP ödənişiniz gecikir. Kartınızı yeniləyin ki, VIP davam etsin.",
          ts:Date.now(), read:false,
        });
        break;
      }

      default:
        console.log(`[Paddle] Unhandled event: ${eventType}`);
    }
  }catch(err){
    console.error("[Paddle Webhook] Processing error:", err);
    return res.status(500).json({ error: "Processing failed" });
  }

  return res.status(200).json({ ok: true });
};

// Paddle needs raw body for signature verification
module.exports.config = {
  api: { bodyParser: false },
};

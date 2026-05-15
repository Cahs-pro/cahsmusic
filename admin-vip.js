/**
 * api/admin-vip.js — Music Universe · Vercel Serverless
 *
 * POST /api/admin-vip
 * Body: { idToken: string, targetUid: string, vip: boolean }
 *
 * Yalnız admin (b11lSYWjuGe0Lu3xeNW3YJOMTuI3) istifadə edə bilər.
 * PayPal ödənişi manual yoxladıqdan sonra VIP vermək üçün.
 *
 * Env vars needed:
 *   FIREBASE_SERVICE_ACCOUNT
 */

const admin = require("firebase-admin");

const ADMIN_UID = "b11lSYWjuGe0Lu3xeNW3YJOMTuI3";

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
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if(req.method === "OPTIONS") return res.status(200).end();
  if(req.method !== "POST")   return res.status(405).json({ error: "POST only" });

  const { idToken, targetUid, vip } = req.body || {};
  if(!idToken || !targetUid) return res.status(400).json({ error: "Missing fields" });

  try{
    getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);

    if(decoded.uid !== ADMIN_UID){
      return res.status(403).json({ error: "Yalnız admin istifadə edə bilər" });
    }

    const db = admin.database();
    const userSnap  = await db.ref(`users/${targetUid}`).get().catch(()=>null);
    const userName  = userSnap?.val()?.name  || "Unknown";
    const userEmail = userSnap?.val()?.email || "";

    await db.ref(`users/${targetUid}`).update({
      vip:           vip === true,
      vipSetByAdmin: true,
      vipUpdatedAt:  Date.now(),
      vipMethod:     vip ? "admin_manual" : null,
    });

    if(vip){
      await db.ref(`notifications/${targetUid}`).push({
        type:"vip", fromName:"Music Universe Admin",
        text:"👑 Admin tərəfindən VIP aktiv edildi! Bütün limitlər açıldı.",
        ts:Date.now(), read:false,
      });
    } else {
      await db.ref(`notifications/${targetUid}`).push({
        type:"vip", fromName:"Music Universe Admin",
        text:"ℹ️ VIP statusunuz ləğv edildi.",
        ts:Date.now(), read:false,
      });
    }

    await db.ref("admin_log").push({
      action: vip ? "vip_grant" : "vip_revoke",
      targetUid, userName, userEmail,
      adminUid: ADMIN_UID, ts: Date.now(),
    });

    console.log(`[admin-vip] ${vip?"Granted":"Revoked"} VIP for ${targetUid} (${userName})`);
    return res.status(200).json({ ok:true, targetUid, userName, vip });

  }catch(e){
    console.error("[admin-vip]", e);
    return res.status(500).json({ error: e.message });
  }
};

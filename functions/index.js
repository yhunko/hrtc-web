const functions = require("firebase-functions");
const admin = require("firebase-admin");

serviceAccount = require("./serviceAccount.json");

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = admin.credential.cert(serviceAccount);
admin.initializeApp(adminConfig);

exports.sendMessage = functions.https.onCall(
  async ({ tokens, title, body, link }) => {
    const message = {
      notification: {
        title,
        body,
      },
    };
    if (link) {
      message.webpush = {
        fcm_options: {
          link,
        },
      };
    }
    if (tokens.length) {
      if (tokens.length === 1) {
        [message.token] = tokens;
        return await admin.messaging().send(message);
      } else {
        message.tokens = tokens;
        return await admin.messaging().sendMulticast(message);
      }
    }
    return false;
  }
);

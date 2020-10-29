import { firestore, FieldValue } from "boot/firebase";

// const sendMessageCF = functions.httpsCallable("sendMessage");

export default async ({ users, title, body, to }) => {
  for (const { id } of users) {
    await firestore.collection("notifications").doc(id).collection("list").add({
      title,
      body,
      to,
      seen: false,
      timestamp: FieldValue.serverTimestamp(),
    });
  }
  // await sendMessageCF({
  //   tokens: users.map((user) => user.data.tokenId),
  //   title,
  //   body,
  //   link: `${location.origin}${to}`,
  // });
};

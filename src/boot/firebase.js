import firebase from "firebase/app";
import config from "../firebase.config";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

firebase.initializeApp(config);

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();
const Timestamp = firebase.firestore.Timestamp;
const FieldValue = firebase.firestore.FieldValue;
const FieldPath = firebase.firestore.FieldPath;

export default async ({ store }) => {
  await new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const dataSnapshot = await firestore
          .collection("users")
          .doc(user.uid)
          .get();
        store.commit("user/set", { user, data: dataSnapshot.data() });
        resolve();
      } else {
        resolve();
      }
    });
  });
};

export { auth, firestore, storage, Timestamp, FieldValue, FieldPath };

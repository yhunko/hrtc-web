import firebase from "firebase/app";
import { config } from "../firebase.config";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/messaging";
import "firebase/functions";

firebase.initializeApp(config);

const auth = firebase.auth();

const firestore = firebase.firestore();
const Timestamp = firebase.firestore.Timestamp;
const FieldValue = firebase.firestore.FieldValue;
const FieldPath = firebase.firestore.FieldPath;

const storage = firebase.storage();

const messaging = firebase.messaging();

const functions = firebase.functions();

export default async ({ store }) => {
  await new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const dataRef = firestore.collection("users").doc(user.uid);
        const dataSnapshot = await dataRef.get();
        const data = dataSnapshot.data();
        store.commit("user/set", { user, data });
        resolve();
      } else {
        resolve();
      }
    });
  });
};

export {
  auth,
  firestore,
  storage,
  messaging,
  functions,
  Timestamp,
  FieldValue,
  FieldPath,
};

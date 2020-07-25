import firebase from "firebase/app";
import config from "../firebase.config";

import "firebase/auth";
import "firebase/firestore";

firebase.initializeApp(config);

const auth = firebase.auth();
const firestore = firebase.firestore();
const Timestamp = firebase.firestore.Timestamp;
const FieldValue = firebase.firestore.FieldValue;

export default async ({ store }) => {
  await new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        store.commit("user/set", { user });
        resolve();
      } else {
        resolve();
      }
    });
  });
};

export { auth, firestore, Timestamp, FieldValue };

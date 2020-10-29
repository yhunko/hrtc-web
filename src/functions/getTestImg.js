import { storage } from "boot/firebase";

export default async (imgPath) => {
  return await storage.ref(imgPath).getDownloadURL();
};

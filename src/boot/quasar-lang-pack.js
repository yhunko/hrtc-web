import { Quasar, LocalStorage } from "quasar";
import { i18n } from "boot/i18n";

export default async () => {
  const langIso = LocalStorage.getItem("lang") || "uk";
  try {
    await import(
      /* webpackInclude: /(ru|uk|en-us)\.js$/ */
      "quasar/lang/" + langIso
    ).then((lang) => {
      Quasar.lang.set(lang.default);
      i18n.locale = langIso;
    });
  } catch (err) {
    console.error(err);
  }
};

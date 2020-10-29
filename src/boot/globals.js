import format from "date-fns/format";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { i18n } from "boot/i18n";
import VueKatex from "vue-katex";
import "katex/dist/katex.min.css";

import { enUS, uk, ru } from "date-fns/locale";

const locales = { enUS, uk, ru };

const dateFormat = "DD.MM.YYYY, HH:mm";

export default ({ Vue }) => {
  Vue.use(VueKatex, {
    globalOptions: {
      displayMode: true,
      throwOnError: false,
      strict: false,
    },
  });

  Vue.filter("formatTimestamp", (timestamp) => {
    return format(timestamp.toDate(), "dd.MM.y, HH:mm");
  });
  Vue.filter("formatDueTimestamp", (timestamp) => {
    return format(timestamp.toDate(), "dd.MM.y, HH:mm");
  });
  Vue.filter("formatCommentTimestamp", (timestamp) => {
    return format(timestamp.toDate(), "dd.MM.y, HH:mm");
  });
  Vue.filter("formatNotificationTimestamp", (timestamp) => {
    return formatDistanceToNow(timestamp.toDate(), {
      addSuffix: true,
      locale: locales[i18n.locale],
    });
  });
};

export { dateFormat };

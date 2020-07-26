import { date } from "quasar";

export default ({ Vue }) => {
  Vue.filter("formatTimestamp", (timestamp) => {
    return date.formatDate(timestamp.toDate(), "MMM DD");
  });
  Vue.filter("formatDueTimestamp", (timestamp) => {
    return date.formatDate(timestamp.toDate(), "MMM DD, HH:mm");
  });
  Vue.filter("formatCommentTimestamp", (timestamp) => {
    return date.formatDate(timestamp.toDate(), "MMM DD, HH:mm");
  });
};

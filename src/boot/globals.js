import format from "date-fns/format";

export default ({ Vue }) => {
  Vue.filter("formatTimestamp", (timestamp) => {
    return format(timestamp.toDate(), "MMM dd");
  });
  Vue.filter("formatDueTimestamp", (timestamp) => {
    return format(timestamp.toDate(), "MMM dd, HH:mm");
  });
  Vue.filter("formatCommentTimestamp", (timestamp) => {
    return format(timestamp.toDate(), "MMM dd, HH:mm");
  });
};

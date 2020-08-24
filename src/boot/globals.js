import format from "date-fns/format";

const dateFormat = "DD.MM.YYYY, HH:mm";

export default ({ Vue }) => {
  Vue.filter("formatTimestamp", (timestamp) => {
    return format(timestamp.toDate(), "dd.MM.y");
  });
  Vue.filter("formatDueTimestamp", (timestamp) => {
    return format(timestamp.toDate(), "dd.MM.y, HH:mm");
  });
  Vue.filter("formatCommentTimestamp", (timestamp) => {
    return format(timestamp.toDate(), "dd.MM.y, HH:mm");
  });
};

export { dateFormat };

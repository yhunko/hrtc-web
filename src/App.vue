<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  created() {
    const lang = this.$q.localStorage.getItem("lang") || "ru";
    this.$i18n.locale = lang;
  },
};
</script>

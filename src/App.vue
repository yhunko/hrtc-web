<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { colors } from "quasar";

export default {
  name: "App",
  async created() {
    if (this.$q.localStorage.has("color")) {
      const color = this.$q.localStorage.getItem("color");
      colors.setBrand("primary", color);
    }
    this.$q.dark.set(
      this.$q.localStorage.has("dark")
        ? this.$q.localStorage.getItem("dark")
        : false
    );
  },
};
</script>

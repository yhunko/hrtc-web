<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  created() {
    this.$q.dark.set(
      this.$q.localStorage.has("dark")
        ? this.$q.localStorage.getItem("dark")
        : false
    );
  },
};
</script>

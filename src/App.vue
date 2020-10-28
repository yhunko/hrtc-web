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
    const reg = await navigator.serviceWorker.getRegistration();
    reg.addEventListener("updatefound", () => {
      const newSw = reg.installing;
      newSw.addEventListener("statechange", () => {
        if (newSw.state === "installed") {
          this.$q
            .dialog({
              title: "New version available.",
              message:
                "Would you like to reload the page to install new version?",
              persistent: true,
              cancel: {
                color: "negative",
                label: "Later",
                flat: true,
              },
              ok: {
                color: "primary",
                label: "Reload",
                flat: true,
              },
            })
            .onOk(() => {
              window.location.reload(true);
            });
        }
      });
    });
  },
};
</script>

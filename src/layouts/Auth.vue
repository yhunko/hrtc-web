<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
          </q-avatar> -->
          {{ $t("header") }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page class="flex justify-center" padding>
        <q-form
          class="q-gutter-md"
          style="width: 800px; max-width: 80vw;"
          @submit="logIn"
        >
          <q-input
            v-model="auth.email"
            :label="`${$t('auth.email.label')} *`"
            :rules="[
              (val) => (val !== null && val !== '') || $t('errors.empty'),
              (val) =>
                /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm.test(val) ||
                $t('auth.email.wrong'),
            ]"
            type="email"
            filled
            lazy-rules
          />
          <q-input
            v-model="auth.password"
            :label="`${$t('auth.password')} *`"
            :rules="[
              (val) => (val !== null && val !== '') || $t('errors.empty'),
            ]"
            type="password"
            filled
            lazy-rules
          />
          <div class="flex">
            <q-space></q-space>
            <q-btn :label="$t('auth.login')" type="submit" color="primary" />
          </div>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { auth } from "boot/firebase";

export default {
  name: "Auth",
  data() {
    return {
      auth: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    async logIn() {
      try {
        await auth.signInWithEmailAndPassword(
          this.auth.email,
          this.auth.password
        );
        this.$store.commit("user/set", { user: auth.currentUser });
        window.location.reload();
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
  },
};
</script>

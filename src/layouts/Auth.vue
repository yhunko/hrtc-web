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
            filled
            type="email"
            v-model="auth.email"
            :label="`${$t('auth.form.email.label')} *`"
            lazy-rules
            :rules="[
              (val) =>
                (val !== null && val !== '') ||
                $t('auth.form.email.errors.empty'),
              (val) =>
                /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm.test(val) ||
                $t('auth.form.email.errors.wrong'),
            ]"
          />
          <q-input
            filled
            type="password"
            v-model="auth.password"
            :label="`${$t('auth.form.password.label')} *`"
            lazy-rules
            :rules="[
              (val) =>
                (val !== null && val !== '') ||
                $t('auth.form.password.errors.empty'),
            ]"
          />
          <div class="flex">
            <q-space></q-space>
            <q-btn
              :label="$t('auth.form.login')"
              type="submit"
              color="primary"
            />
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

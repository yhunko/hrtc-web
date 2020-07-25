<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="mdi-menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title>
          {{ $t("header") }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="mdi-home" />
          </q-item-section>
          <q-item-section>
            {{ $t("drawer.home") }}
          </q-item-section>
        </q-item>
        <q-item v-if="$store.state.user.data" to="/profile" exact>
          <q-item-section avatar>
            <q-icon name="mdi-account" />
          </q-item-section>
          <q-item-section>
            {{ $t("drawer.profile") }}
          </q-item-section>
        </q-item>
        <q-item v-else to="/auth" exact>
          <q-item-section avatar>
            <q-icon name="mdi-login"></q-icon>
          </q-item-section>
          <q-item-section>
            {{ $t("drawer.auth") }}
          </q-item-section>
        </q-item>
        <q-item to="/settings" exact>
          <q-item-section avatar>
            <q-icon name="mdi-cog" />
          </q-item-section>
          <q-item-section>
            {{ $t("drawer.settings") }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog
      v-model="authDialog"
      transition-show="scale"
      transition-hide="scale"
      persistent
      maximized
    >
      <q-card>
        <q-card-section>
          <div class="text-h6">Authorization</div>
        </q-card-section>
        <q-card-section class="flex flex-center">
          <q-form style="width: 700px; max-width: 80vw;" @submit="onSubmit">
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
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { auth } from "boot/firebase";

export default {
  name: "MainLayout",
  data() {
    return {
      leftDrawerOpen: false,
      authDialog: null,
      auth: {
        email: "",
        password: "",
      },
    };
  },
  watch: {
    "$store.state.user.data": {
      immediate: true,
      handler(value) {
        this.authDialog = value ? false : true;
      },
    },
  },
  methods: {
    async onSubmit() {
      try {
        await auth.signInWithEmailAndPassword(
          this.auth.email,
          this.auth.password
        );
        this.$store.commit("user/set", { user: auth.currentUser });
        this.authDialog = false;
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
  },
};
</script>

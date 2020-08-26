<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="$store.state.user.auth" elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="mdi-menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title v-if="$q.screen.gt.xs">
          {{ $t("header") }}
        </q-toolbar-title>
        <q-space></q-space>
        <span class="text-subtitle1 q-mr-xs">
          {{ $store.state.user.auth.displayName }}
        </span>
        <q-btn flat round icon="mdi-translate">
          <q-menu auto-close>
            <q-list>
              <q-item
                v-for="({ value, label }, index) in langOptions"
                @click="lang = value"
                :key="index"
                :active="value === lang"
                clickable
              >
                <q-item-section>{{ label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn @click="logOut()" flat round icon="mdi-logout"></q-btn>
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
        <q-item v-if="isTeacher" to="/bill" exact>
          <q-item-section avatar>
            <q-icon name="mdi-file-document" />
          </q-item-section>
          <q-item-section>
            {{ $t("drawer.bill") }}
          </q-item-section>
        </q-item>
        <!-- <q-item to="/profile" exact>
          <q-item-section avatar>
            <q-icon name="mdi-account" />
          </q-item-section>
          <q-item-section>
            {{ $t("drawer.profile") }}
          </q-item-section>
        </q-item> -->
        <!-- <q-item to="/settings" exact>
          <q-item-section avatar>
            <q-icon name="mdi-cog" />
          </q-item-section>
          <q-item-section>
            {{ $t("drawer.settings") }}
          </q-item-section>
        </q-item> -->
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { auth } from "boot/firebase";

export default {
  name: "MainLayout",
  data() {
    return {
      isTeacher: this.$store.state.user.auth.uid.startsWith("t"),
      leftDrawerOpen: false,
      auth: {
        email: "",
        password: "",
      },
      lang: this.$i18n.locale,
      langOptions: [
        { value: "en-us", label: "English" },
        { value: "ru", label: "Русский" },
        { value: "ua", label: "Українська" },
      ],
    };
  },
  watch: {
    lang(lang) {
      this.$q.localStorage.set("lang", lang);
      this.$i18n.locale = lang;
    },
  },
  methods: {
    async logOut() {
      try {
        await auth.signOut();
        this.$store.commit("user/logOut");
        window.location.reload();
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
  },
};
</script>

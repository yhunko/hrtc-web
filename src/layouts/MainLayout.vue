<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="$store.state.user.auth" elevated>
      <q-toolbar>
        <q-btn
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="mdi-menu"
          flat
          dense
          round
        />
        <q-toolbar-title v-if="$q.screen.gt.xs">
          {{ $t("header") }}
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn icon="mdi-translate" round flat>
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
        <q-btn @click="logOut()" icon="mdi-logout" flat round />
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      elevated
      content-class="bg-grey-1"
    >
      <q-list style="height: calc(100% - 150px); margin-top: 150px;" padding>
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
        <q-separator spaced />
        <q-item @click="openGitHub()" clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-github" />
          </q-item-section>
          <q-item-section>Code on GitHub</q-item-section>
        </q-item>
      </q-list>
      <q-img
        class="absolute-top dimmed"
        src="https://cdn.quasar.dev/img/material.png"
        style="height: 150px;"
      >
        <div class="absolute-bottom bg-transparent z-top">
          <div class="text-weight-bold">
            {{ $store.state.user.auth.displayName }}
          </div>
          <div>{{ $store.state.user.auth.email }}</div>
        </div>
      </q-img>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import languages from "quasar/lang/index.json";
const appLanguages = languages.filter((lang) =>
  ["ru", "en-us", "uk"].includes(lang.isoName)
);

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
      lang: this.$q.lang.isoName,
      langOptions: [],
    };
  },
  watch: {
    lang(lang) {
      import(
        /* webpackInclude: /(ru|uk|en-us)\.js$/ */
        "quasar/lang/" + lang
      ).then(({ default: defaultLang }) => {
        this.$q.lang.set(defaultLang);
        this.$q.localStorage.set("lang", lang);
        this.$i18n.locale = lang;
      });
    },
  },
  created() {
    this.langOptions = appLanguages.map(({ nativeName, isoName }) => ({
      label: nativeName,
      value: isoName,
    }));
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
    openGitHub() {
      window.open("https://github.com/yegorgunko/hrtc-web", "_blank");
    },
  },
};
</script>

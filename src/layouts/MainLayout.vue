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
        <!-- <q-avatar>
          <q-img src="../assets/logo.png"></q-img>
        </q-avatar> -->
        <q-toolbar-title v-if="$q.screen.gt.xs" color>
          {{ $t("header") }}
        </q-toolbar-title>
        <q-space />
        <q-btn
          :icon="unreadNotificationsCount > 0 ? 'mdi-bell-ring' : 'mdi-bell'"
          dense
          round
          flat
        >
          <q-menu ref="notificationsMenu" fit>
            <q-toolbar>
              <q-toolbar-title>
                {{ $t("main.toolbar.notifications") }}
              </q-toolbar-title>
              <q-btn
                @click="deleteAllNotifications()"
                :disable="!this.notifications.length"
                icon="mdi-notification-clear-all"
                color="negative"
                flat
                round
                dense
              >
                <q-tooltip>
                  {{ $t("main.toolbar.tooltips.deleteRead") }}
                </q-tooltip>
              </q-btn>
              <q-btn
                @click="markAllNotificationsAsRead()"
                :disable="!this.notifications.length"
                icon="mdi-check-all"
                color="positive"
                flat
                round
                dense
              >
                <q-tooltip>
                  {{ $t("main.toolbar.tooltips.markAllAsRead") }}
                </q-tooltip>
              </q-btn>
            </q-toolbar>

            <q-separator />

            <q-list v-if="notifications.length" separator>
              <q-item
                v-for="({ id, title, body, to, seen, timestamp },
                index) in notifications"
                :key="index"
                :active="!seen"
              >
                <q-item-section>
                  <q-item-label>{{ title }}</q-item-label>
                  <q-item-label caption lines="2">{{ body }}</q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-item-label v-if="timestamp" caption>
                    {{ timestamp | formatNotificationTimestamp }}
                  </q-item-label>
                  <q-btn
                    v-if="seen"
                    @click="markNotificationAsUnread(id)"
                    icon="mdi-eye-off"
                    dense
                    round
                    flat
                  >
                    <q-tooltip>
                      {{ $t("main.toolbar.tooltips.markAsUnread") }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    v-else
                    @click="markNotificationAsRead(id)"
                    icon="mdi-eye"
                    color="primary"
                    dense
                    round
                    flat
                  >
                    <q-tooltip>
                      {{ $t("main.toolbar.tooltips.markAsRead") }}
                    </q-tooltip>
                  </q-btn>
                </q-item-section>
                <q-separator spaced="md" vertical />
                <q-item-section class="no-padding" side>
                  <q-btn
                    :to="to"
                    color="primary"
                    icon="mdi-open-in-new"
                    dense
                    flat
                    round
                  >
                    <q-tooltip>{{ $t("globals.open") }}</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-no-wrap q-pa-md">
              <h6>{{ $t("main.toolbar.notificationsListEmpty") }}</h6>
            </div>
          </q-menu>
          <q-badge
            v-if="unreadNotificationsCount > 0"
            color="red"
            align="bottom"
            floating
          >
            {{ unreadNotificationsCount }}
          </q-badge>
          <q-tooltip>
            {{ $t("main.toolbar.notifications") }}
          </q-tooltip>
        </q-btn>
        <q-btn icon="mdi-translate" dense round flat>
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
          <q-tooltip>
            {{ $t("main.toolbar.tooltips.lang") }}
          </q-tooltip>
        </q-btn>
        <q-btn @click="logOut()" icon="mdi-logout" dense flat round>
          <q-tooltip>
            {{ $t("main.toolbar.tooltips.logout") }}
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list style="height: calc(100% - 150px); margin-top: 150px;" padding>
        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="mdi-home" />
          </q-item-section>
          <q-item-section>
            {{ $t("main.drawer.home") }}
          </q-item-section>
        </q-item>
        <q-item v-if="isStudent" to="/todo" exact>
          <q-item-section avatar>
            <q-icon name="mdi-list-status" />
          </q-item-section>
          <q-item-section>
            {{ $t("main.drawer.todo") }}
          </q-item-section>
        </q-item>
        <q-item v-if="isTeacher" to="/bill" exact>
          <q-item-section avatar>
            <q-icon name="mdi-file-document" />
          </q-item-section>
          <q-item-section>
            {{ $t("main.drawer.bill") }}
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-palette" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("main.drawer.appColor") }}</q-item-label>
            <q-item-label v-if="color !== '#1976d2'" caption lines="1">
              Default:
              <span
                @click="color = '#1976d2'"
                class="cursor-pointer"
                style="color: #1976d2;"
              >
                #1976d2
              </span>
            </q-item-label>
          </q-item-section>
          <q-item-section avatar side>
            <q-avatar color="primary" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-color v-model="color" />
              </q-popup-proxy>
            </q-avatar>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="mdi-theme-light-dark" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("main.drawer.darkTheme") }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              @input="$q.dark.set(!$q.dark.isActive)"
              :value="$q.dark.isActive"
              unchecked-icon="mdi-weather-sunny"
              checked-icon="mdi-weather-night"
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item @click="openGitHub()" clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-github" />
          </q-item-section>
          <q-item-section>{{ $t("main.drawer.github") }}</q-item-section>
        </q-item>
      </q-list>
      <q-img
        class="absolute-top dimmed"
        src="../assets/cover.jpg"
        style="height: 150px;"
      >
        <div class="absolute-bottom bg-transparent z-top">
          <q-avatar size="56px" class="q-mb-sm">
            <q-img src="../assets/logo.png" />
          </q-avatar>
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

import { auth, firestore } from "boot/firebase";
import { colors } from "quasar";

export default {
  name: "MainLayout",
  data() {
    return {
      isTeacher: this.$store.state.user.auth.uid.startsWith("t"),
      isStudent: this.$store.state.user.auth.uid.startsWith("s"),
      leftDrawerOpen: false,
      lang: this.$q.lang.isoName,
      langOptions: [],
      color: null,
      notificationsRef: null,
      notifications: [],
      user: {
        uid: this.$store.state.user.auth.uid,
      },
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
    "$q.dark.isActive"(val) {
      this.$q.localStorage.set("dark", val);
    },
    color(val) {
      colors.setBrand("primary", val);
      this.$q.localStorage.set("color", val);
    },
  },
  computed: {
    unreadNotificationsCount() {
      return this.notifications.filter(
        (notification) => notification.seen === false
      ).length;
    },
  },
  async created() {
    this.langOptions = appLanguages.map(({ nativeName, isoName }) => ({
      label: nativeName,
      value: isoName,
    }));
    if (this.$q.localStorage.has("color")) {
      const color = this.$q.localStorage.getItem("color");
      colors.setBrand("primary", color);
      this.color = color;
    }
    this.notificationsRef = firestore
      .collection("notifications")
      .doc(this.user.uid)
      .collection("list");
    this.$bind(
      "notifications",
      this.notificationsRef.orderBy("timestamp", "desc")
    );
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
    setTheme() {
      this.$q.dark.toggle();
    },
    openGitHub() {
      window.open(
        "https://github.com/yegorgunko/hrtc-web/issues/new",
        "_blank"
      );
    },
    async markNotificationAsRead(id) {
      try {
        await this.notificationsRef.doc(id).update({
          seen: true,
        });
      } catch (err) {
        console.error(err);
      }
    },
    async markNotificationAsUnread(id) {
      try {
        await this.notificationsRef.doc(id).update({
          seen: false,
        });
      } catch (err) {
        console.error(err);
      }
    },
    async markAllNotificationsAsRead() {
      try {
        const promises = [];
        for (const { id } of this.notifications) {
          promises.push(
            this.notificationsRef.doc(id).update({
              seen: true,
            })
          );
        }
        await Promise.all(promises);
      } catch (err) {
        console.error(err);
      }
    },
    async deleteAllNotifications() {
      try {
        const notificationsSnapshot = await this.notificationsRef.get();
        notificationsSnapshot.forEach(async (doc) => {
          if (doc.exists && doc.data().seen === true) {
            await this.notificationsRef.doc(doc.id).delete();
          }
        });
        this.$refs.notificationsMenu.hide();
      } catch (err) {
        console.error(err);
      }
    },
    notificationOpenURL(to) {
      this.$router.go(to);
    },
  },
};
</script>

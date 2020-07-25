<template>
  <q-page class="row justify-center" padding>
    <q-form @submit="onSubmit" class="q-gutter-md" style="min-width: 60vw;">
      <q-input
        filled
        v-model="displayName"
        label="Your display name"
        hint="Name and surname"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />
      <q-input
        filled
        type="email"
        v-model="email"
        label="Your email"
        readonly
      />
      <div>
        <q-btn label="Save" type="submit" color="primary" />
        <q-btn @click="logOut()" label="Log out" color="negative"></q-btn>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { auth } from "boot/firebase";

export default {
  name: "Profile",
  data() {
    return {
      displayName: "",
      email: "",
    };
  },
  created() {
    const userData = this.$store.getters["user/user"];
    this.displayName = userData.displayName;
    this.email = userData.email;
  },
  methods: {
    async onSubmit() {
      try {
        await auth.currentUser.updateProfile({
          displayName: this.displayName,
        });
        this.$store.commit("user/set", { user: auth.currentUser });
      } catch (err) {
        window.alert(err);
      }
    },
    async logOut() {
      try {
        await auth.signOut();
        this.$store.commit("user/logOut");
        this.$router.replace("/");
      } catch (err) {
        window.alert(err);
      }
    },
  },
};
</script>

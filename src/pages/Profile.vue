<template>
  <q-page class="row justify-center" padding>
    <q-form @submit="onSubmit" class="q-gutter-md" style="min-width: 60vw;">
      <q-input
        :value="$store.state.user.auth.displayName"
        label="Your display name"
        filled
        readonly
      />
      <q-input
        :value="$store.state.user.auth.email"
        type="email"
        label="EMail address"
        filled
        readonly
      />
      <div>
        <!-- <q-btn label="Save" type="submit" color="primary" /> -->
        <q-btn @click="logOut()" label="Log out" color="negative"></q-btn>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { auth } from "boot/firebase";

export default {
  name: "Profile",
  methods: {
    async onSubmit() {
      try {
        await auth.currentUser.updateProfile({
          displayName: this.displayName,
        });
        this.$store.commit("user/set", { user: auth.currentUser });
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
  },
};
</script>

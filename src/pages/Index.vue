<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Classes list</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="q-pa-lg row items-start q-gutter-lg">
          <q-card
            v-for="({ id, title, teacher }, index) in courses"
            :key="index"
            bordered
          >
            <q-card-section>
              <div class="text-h4 text-primary">{{ title }}</div>
              <div class="text-h6">{{ teacher.displayName }}</div>
            </q-card-section>
            <q-separator inset />
            <q-card-actions>
              <q-btn :to="`/course/${id}`" flat>{{
                $t("index.course.open")
              }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { firestore } from "boot/firebase";

export default {
  name: "PageIndex",
  data() {
    return {
      courses: [],
      user: {
        uid: this.$store.state.user.auth.uid,
      },
    };
  },
  created() {
    const coursesRef = firestore.collection("courses");
    if (this.user.uid.startsWith("t")) {
      this.$bind(
        "courses",
        coursesRef.where(
          "teacher",
          "==",
          firestore.collection("users").doc(this.user.uid)
        )
      );
    } else if (this.user.uid.startsWith("s")) {
      this.$bind(
        "courses",
        coursesRef.where(
          "groups",
          "array-contains",
          this.$store.state.user.data.group
        )
      );
    }
  },
};
</script>

<template>
  <q-page>
    <div class="q-pa-lg row items-start q-gutter-lg">
      <q-card
        v-for="({ id, title, teacher }, index) in courses"
        :key="index"
        bordered
      >
        <q-card-section>
          <div class="text-h6">{{ title }}</div>
          <div class="text-subtitle2">{{ teacher }}</div>
        </q-card-section>
        <q-separator inset />
        <q-card-actions>
          <q-btn :to="`/course/${id}`" flat>{{
            $t("index.course.open")
          }}</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { firestore } from "boot/firebase";

export default {
  name: "PageIndex",
  data() {
    return {
      courses: [],
    };
  },
  firestore: {
    courses: firestore.collection("courses"),
  },
};
</script>

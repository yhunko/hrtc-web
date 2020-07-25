<template>
  <q-page v-if="assignment" padding>
    <div class="flex flex-center">
      <q-splitter
        v-model="splitterWidth"
        :style="{ width: $q.screen.lt.md ? '90vw' : '70vw' }"
        :limits="[splitterWidth, splitterWidth]"
      >
        <template v-slot:before>
          <q-card>
            <q-card-section>
              <div class="text-h6">{{ assignment.title }}</div>
              <div class="text-subtitle2">
                {{ assignment.timestamp | formatTimestamp }}
              </div>
              <div class="q-mt-md row">
                <span>Test</span>
                <q-space></q-space>
                <span>Due {{ assignment.due | formatDueTimestamp }}</span>
              </div>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-section>
              {{ assignment.description }}
            </q-card-section>
            <q-separator></q-separator>
            <q-card-section>
              Comments here
            </q-card-section>
          </q-card>
        </template>
        <template v-slot:after>
          <q-card>
            <q-card-section class="row flex-center">
              <div class="text-h6">Your work</div>
              <q-space></q-space>
              <div class="text-subtitle2">Assigned</div>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-section class="column flex-center">
              <q-btn color="primary">Add files</q-btn>
            </q-card-section>
          </q-card>
        </template>
      </q-splitter>
    </div>
  </q-page>
</template>

<script>
import { firestore } from "boot/firebase";

export default {
  name: "Assignment",
  data() {
    return {
      id: this.$route.params.assignmentId,
      assignment: null,
      splitterWidth: 70,
    };
  },
  watch: {
    "$route.params.assignmentId": {
      immediate: true,
      handler(id) {
        this.$bind(
          "assignment",
          firestore
            .collection("courses")
            .doc(this.$route.params.courseId)
            .collection("classwork")
            .doc(id)
        );
      },
    },
  },
};
</script>

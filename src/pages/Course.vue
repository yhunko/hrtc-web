<template>
  <q-page v-if="course" class="flex justify-center" padding>
    <q-card :style="{ width: $q.screen.lt.md ? '90vw' : '50vw' }" flat bordered>
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="lection" label="Lections" />
        <q-tab name="practical" label="Practical" />
        <q-tab name="test" label="Tests" />
        <q-tab name="acw" label="Administrative work"></q-tab>
      </q-tabs>
      <q-separator />
      <q-card-section class="q-gutter-md">
        <q-card
          v-for="({ id: assignmentId, title, timestamp, description },
          index) in filteredClasswork"
          :key="index"
        >
          <q-card-section>
            <div class="text-h6">{{ title }}</div>
            <div class="text-subtitle2">
              {{ timestamp | formatTimestamp }}
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-btn :to="`/assignment/${id}/${assignmentId}`" flat>
              Open
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-card-section>
    </q-card>
    <q-page-sticky
      v-if="$store.state.user.auth.uid.startsWith('t')"
      position="bottom-right"
      :offset="[15, 15]"
    >
      <q-fab
        @click="createTaskDialog = true"
        label="Create task"
        color="green"
        hide-icon
      >
      </q-fab>
    </q-page-sticky>
    <TaskDialog
      v-model="createTaskDialog"
      :course-id="id"
      mode="create"
      @visibility="changeVisibility"
    ></TaskDialog>
  </q-page>
</template>

<script>
import { firestore } from "boot/firebase";
import { dateFormat } from "boot/globals";

import TaskDialog from "../components/TaskDialog.vue";

const courses = firestore.collection("courses");

const assignmentTypes = Object.freeze([
  { value: "lection", label: "Lection" },
  { value: "practical", label: "Practical" },
  { value: "test", label: "Test" },
  { value: "acw", label: "Administrative work" },
]);

export default {
  name: "Course",
  components: {
    TaskDialog,
  },
  data() {
    return {
      id: this.$route.params.courseId,
      course: null,
      classwork: null,
      createTaskDialog: false,
      tab: "lection",
      assignment: {
        title: "",
        description: null,
        due: "",
        type: assignmentTypes[0],
        maxMark: 5,
        allowZero: false,
      },
      assignmentTypes,
      dateFormat,
    };
  },
  watch: {
    "$route.params.courseId": {
      immediate: true,
      handler(id) {
        const course = courses.doc(id);
        this.$bind("course", course);
        this.$bind(
          "classwork",
          course.collection("classwork").orderBy("timestamp", "desc")
        );
      },
    },
  },
  computed: {
    filteredClasswork() {
      return this.classwork.filter((item) => item.type === this.tab);
    },
  },
  methods: {
    changeVisibility(visible, tab) {
      this.createTaskDialog = visible;
      this.tab = tab;
    },
    // async onTaskSubmit() {
    //   try {
    //     await courses
    //       .doc(this.id)
    //       .collection("classwork")
    //       .add({
    //         title: this.assignment.title,
    //         description: this.assignment.description,
    //         due: Timestamp.fromDate(
    //           date.extractDate(this.assignment.due, this.dateFormat)
    //         ),
    //         timestamp: Timestamp.now(),
    //         type: this.assignment.type.value,
    //         maxMark: this.assignment.maxMark,
    //       });
    //     this.createTaskModal = false;
    //   } catch (err) {
    //     this.$q.notify({ message: err.message, color: "red" });
    //   }
    // },
  },
};
</script>

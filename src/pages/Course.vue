<template>
  <q-page v-if="course" class="flex justify-center" padding>
    <div
      v-if="classwork"
      class="q-pa-md column q-gutter-md"
      :style="{ width: $q.screen.lt.md ? '90vw' : '50vw' }"
    >
      <q-card
        v-for="({ id: assignmentId, title, timestamp, description },
        index) in classwork"
        :key="index"
      >
        <q-card-section>
          <div class="text-h6">{{ title }}</div>
          <div class="text-subtitle2">
            {{ timestamp | formatTimestamp }}
          </div>
        </q-card-section>

        <q-card-section>
          {{ description }}
        </q-card-section>

        <q-separator dark />

        <q-card-actions>
          <q-btn :to="`/assignment/${id}/${assignmentId}`" flat>
            Open
          </q-btn>
          <q-btn flat>Action 2</q-btn>
        </q-card-actions>
      </q-card>
    </div>
    <div v-else class="column flex-center">
      <h2>No classwork for now</h2>
      <q-btn @click="createTaskModal = true">Click to create a new task</q-btn>
    </div>
    <q-page-sticky position="bottom-right" :offset="[15, 15]">
      <q-fab
        @click="createTaskModal = true"
        label="Create task"
        label-position="left"
        color="green"
        icon="mdi-plus"
        direction="right"
      >
      </q-fab>
    </q-page-sticky>
    <q-dialog v-model="createTaskModal">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <q-form
            @submit="onTaskSubmit"
            @reset="onTaskReset"
            class="q-gutter-md"
          >
            <q-input
              v-model="assignment.title"
              label="Task title *"
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
              lazy-rules
              filled
            />
            <q-input
              v-model="assignment.description"
              type="textarea"
              label="Task description *"
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
              lazy-rules
              filled
            ></q-input>
            <q-input
              v-model="assignment.due"
              :rules="['datetime']"
              readonly
              filled
            >
              <template v-slot:prepend>
                <q-icon name="mdi-calendar" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="assignment.due"
                      @input="() => $refs.qDateProxy.hide()"
                      mask="YYYY-MM-DD HH:mm"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:append>
                <q-icon name="mdi-clock-outline" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qTimeProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="assignment.due"
                      @input="() => $refs.qTimeProxy.hide()"
                      mask="YYYY-MM-DD HH:mm"
                      format24h
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <div>
              <q-btn label="Create" type="submit" color="primary" />
              <q-btn
                label="Reset"
                type="reset"
                color="primary"
                flat
                class="q-ml-sm"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { firestore, Timestamp } from "boot/firebase";

const courses = firestore.collection("courses");

export default {
  name: "Course",
  data() {
    return {
      id: this.$route.params.courseId,
      course: null,
      classwork: null,
      createTaskModal: false,
      assignment: {
        title: "",
        description: "",
        due: null,
      },
    };
  },
  methods: {
    async onTaskSubmit() {
      try {
        await courses
          .doc(this.id)
          .collection("classwork")
          .add({
            title: this.assignment.title,
            description: this.assignment.description,
            due: Timestamp.fromDate(new Date(this.assignment.due)),
            timestamp: Timestamp.now(),
          });
        this.createTaskModal = false;
      } catch (err) {
        window.alert(err);
      }
    },
    onTaskReset() {
      this.assignment.title = "";
      this.assignment.description = "";
      this.assignment.date = null;
      this.assignment.due = null;
    },
  },
  watch: {
    "$route.params.courseId": {
      immediate: true,
      handler(id) {
        const course = courses.doc(id);
        this.$bind("course", course);
        this.$bind("classwork", course.collection("classwork"));
      },
    },
  },
};
</script>

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
      <q-card-section>
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
        @click="openCreateTaskModal()"
        label="Create task"
        color="green"
        hide-icon
      >
      </q-fab>
    </q-page-sticky>
    <q-dialog v-model="createTaskModal">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <q-form @submit="onTaskSubmit" class="q-gutter-md">
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
            <q-select
              v-model="assignment.type"
              :options="assignmentTypes"
              label="Assingment type"
              filled
            />
            <q-input v-model="assignment.due" label="Due" readonly filled>
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
                      :mask="dateFormat"
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
                      :mask="dateFormat"
                      format24h
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <div>
              <q-btn label="Create" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { date } from "quasar";
import { firestore, Timestamp } from "boot/firebase";
import { dateFormat } from "boot/globals";

const courses = firestore.collection("courses");

const assignmentTypes = Object.freeze([
  { value: "lection", label: "Lection" },
  { value: "practical", label: "Practical" },
  { value: "test", label: "Test" },
  { value: "acw", label: "Administrative work" },
]);

export default {
  name: "Course",
  data() {
    return {
      id: this.$route.params.courseId,
      course: null,
      classwork: null,
      createTaskModal: false,
      tab: "lection",
      assignment: {
        title: "",
        description: "",
        due: "",
        type: assignmentTypes[0],
      },
      assignmentTypes,
      dateFormat,
    };
  },
  computed: {
    filteredClasswork() {
      return this.classwork.filter((item) => item.type === this.tab);
    },
  },
  methods: {
    openCreateTaskModal() {
      this.assignment.due = date.formatDate(new Date(), this.dateFormat);
      this.createTaskModal = true;
    },
    async onTaskSubmit() {
      try {
        await courses
          .doc(this.id)
          .collection("classwork")
          .add({
            title: this.assignment.title,
            description: this.assignment.description,
            due: Timestamp.fromDate(
              date.extractDate(this.assignment.due, this.dateFormat)
            ),
            timestamp: Timestamp.now(),
            type: this.assignment.type.value,
          });
        this.createTaskModal = false;
      } catch (err) {
        window.alert(err);
      }
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

<template>
  <q-page v-if="course" class="flex justify-center" padding>
    <q-card style="width: 90vw;" flat bordered>
      <div class="flex items-center q-gutter-sm q-pa-md">
        <span class="text-h5">{{ course.title }}</span>
        <q-separator vertical />
        <span class="text-h6">{{ course.groups.join(", ") }}</span>
        <q-btn-dropdown
          color="primary"
          :label="$t('globals.list')"
          icon="mdi-format-list-bulleted"
          split
        >
          <q-list>
            <q-item v-for="(name, index) in studentsList" :key="index">
              <q-item-section>
                <q-item-label>{{ name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab :label="$t('course.tabs.all')" name="all"></q-tab>
        <q-tab
          v-for="({ value, label }, index) in assignmentTypes"
          :key="index"
          :name="value"
          :label="$t(`course.tabs.${value}`)"
        />
      </q-tabs>
      <q-separator />
      <q-card-section>
        <template v-if="filteredClasswork.length">
          <div class="row items-start q-gutter-md">
            <q-card
              v-for="({ id: assignmentId, title, timestamp, due, edited, type },
              index) in filteredClasswork"
              :key="index"
              bordered
            >
              <q-card-section>
                <div class="text-primary text-h6">{{ title }}</div>
                <div class="text-subtitle2">
                  {{ timestamp | formatTimestamp }}
                  <template v-if="edited">
                    ({{ $t("globals.edited") }} {{ edited | formatTimestamp }})
                  </template>
                </div>
                <q-chip
                  @click="tab = type"
                  icon="mdi-shape"
                  color="secondary"
                  text-color="white"
                  clickable
                >
                  {{ $t(`course.tabs.${type}`) }}
                </q-chip>
              </q-card-section>
              <q-separator />
              <q-card-actions>
                <q-btn
                  :label="$t('course.assignment.open')"
                  :to="`/assignment/${id}/${assignmentId}`"
                  color="primary"
                  icon-right="mdi-open-in-new"
                  flat
                />
              </q-card-actions>
            </q-card>
          </div>
        </template>
        <div v-else class="text-center">
          <h4>{{ $t("globals.listEmpty") }}</h4>
        </div>
      </q-card-section>
    </q-card>
    <template v-if="$store.state.user.auth.uid.startsWith('t')">
      <q-page-sticky position="bottom-right" :offset="[15, 15]">
        <q-btn
          @click="createAssignment()"
          color="primary"
          icon="mdi-plus"
          padding="md"
          :label="$t('course.createTask')"
          no-caps
          rounded
        >
        </q-btn>
      </q-page-sticky>
      <TaskDialog
        v-model="taskDialog"
        @visibility="changeVisibility"
        :course-id="id"
        :tab="tab"
        :mode="taskDialogMode"
        :data="taskDialogData"
        :assignmentId="taskDialogAssignmentId"
      ></TaskDialog>
    </template>
    <q-inner-loading :showing="loading">
      <q-spinner size="5em" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>
import { firestore } from "boot/firebase";
import { dateFormat } from "boot/globals";

import TaskDialog from "../components/TaskDialog.vue";

const courses = firestore.collection("courses");

const assignmentTypes = Object.freeze([
  { value: "message", label: "Message" },
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
      studentsList: [],
      classwork: null,
      taskDialog: false,
      taskDialogMode: "create",
      taskDialogData: null,
      taskDialogAssignmentId: null,
      tab: "all",
      assignment: {
        title: "",
        description: null,
        due: "",
        type: assignmentTypes[0],
        maxMark: 5,
        allowZero: false,
      },
      loading: false,
      assignmentTypes,
      dateFormat,
    };
  },
  watch: {
    "$route.params.courseId": {
      immediate: true,
      async handler(id) {
        this.loading = true;
        const course = courses.doc(id);
        await this.$bind("course", course);
        const { uid } = this.$store.state.user.auth;
        if (
          uid.startsWith("s") &&
          !this.course.groups.includes(this.$store.state.user.data.group)
        ) {
          this.$router.go(-1);
        }
        await this.$bind(
          "classwork",
          course.collection("classwork").orderBy("timestamp", "desc")
        );
        const studentsSnap = await firestore
          .collection("users")
          .where("group", "in", this.course.groups)
          .get();
        studentsSnap.forEach((doc) => {
          this.studentsList.push(doc.data().displayName);
        });
        this.loading = false;
      },
    },
  },
  computed: {
    filteredClasswork() {
      return this.classwork?.length
        ? this.tab === "all"
          ? this.classwork
          : this.classwork.filter((item) => item.type === this.tab)
        : [];
    },
  },
  methods: {
    createAssignment() {
      this.taskDialogData = null;
      this.taskDialogMode = "create";
      this.taskDialog = true;
    },
    changeVisibility(visible, changedType, tab) {
      this.taskDialog = visible;
      this.tab = tab;
    },
  },
};
</script>

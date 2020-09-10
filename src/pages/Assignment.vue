<template>
  <q-page v-if="assignment" padding>
    <q-card>
      <q-tabs
        v-if="isTeacher"
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="assignment" label="Assignment" />
        <q-tab v-if="isTeacher" name="studentsWork" label="Students work" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="assignment">
          <q-card-section>
            <div class="flex flex-center">
              <q-splitter
                v-model="splitterWidth"
                :style="{ width: $q.screen.lt.md ? '90vw' : '70vw' }"
                :limits="[splitterWidth, splitterWidth]"
                :horizontal="$q.screen.lt.md"
              >
                <template v-slot:before>
                  <q-card>
                    <q-card-section>
                      <div v-if="isTeacher" class="flex">
                        <div class="text-h6">{{ assignment.title }}</div>
                        <q-space></q-space>
                        <q-btn
                          @click="editTaskDialog = true"
                          color="primary"
                          icon="mdi-pencil"
                          flat
                          round
                        ></q-btn>
                      </div>
                      <div v-else class="text-h6">{{ assignment.title }}</div>
                      <div class="text-subtitle2">
                        {{ assignment.timestamp | formatTimestamp }}
                      </div>
                      <div class="q-mt-md row">
                        <span>{{ course.teacher.displayName }}</span>
                        <q-space></q-space>
                        <span :class="{ 'text-red': isPast(assignment.due) }">
                          Due {{ assignment.due | formatDueTimestamp }}
                        </span>
                      </div>
                    </q-card-section>
                    <q-separator></q-separator>
                    <q-card-section>
                      <q-markdown :src="assignment.description"></q-markdown>
                    </q-card-section>
                    <q-separator></q-separator>
                    <q-card-section>
                      <q-input
                        v-model="comment"
                        label="Comment"
                        filled
                        autogrow
                      >
                        <template v-slot:append>
                          <q-icon
                            name="mdi-send"
                            @click="sendComment()"
                            class="cursor-pointer"
                          />
                        </template>
                      </q-input>
                      <q-list v-if="comments && comments.length">
                        <q-item
                          v-for="({ text, user: { displayName }, timestamp },
                          index) in comments"
                          :key="index"
                        >
                          <q-item-section>
                            <q-item-label overline>
                              {{ displayName }}
                            </q-item-label>
                            <q-item-label>{{ text }}</q-item-label>
                          </q-item-section>
                          <q-item-section side top>
                            <q-item-label caption>
                              {{ timestamp | formatCommentTimestamp }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </template>
                <template v-if="isStudent" v-slot:after>
                  <q-card>
                    <q-card-section class="row flex-center">
                      <div class="text-h6">Your work</div>
                      <q-space></q-space>
                      <template v-if="turnedIn">
                        <div v-if="typeof turnedIn.mark === 'number'">
                          Оценено: {{ turnedIn.mark }} /
                          {{ assignment.maxMark }}
                        </div>
                        <div
                          v-else-if="turnedIn.submitted"
                          :class="[
                            { 'text-red': isPast(assignment.due) },
                            'text-subtitle2',
                          ]"
                        >
                          {{
                            isPast(turnedIn.timestamp)
                              ? "Turned in late"
                              : "Turned in"
                          }}
                        </div>
                      </template>
                      <div
                        v-else
                        :class="[
                          { 'text-red': isPast(assignment.due) },
                          'text-subtitle2',
                        ]"
                      >
                        {{ isPast(assignment.due) ? "Missing" : "Assigned" }}
                      </div>
                    </q-card-section>
                    <q-separator></q-separator>
                    <q-card-section class="column flex-center">
                      <template v-if="assignment.type === 'test'">
                        <q-btn
                          @click="openTestDialog()"
                          color="primary"
                          :label="
                            isPast(assignment.due)
                              ? 'Test time is over'
                              : turnedIn.submitted
                              ? 'View test answers'
                              : 'Take the test'
                          "
                          :disable="isPast(assignment.due)"
                        />
                      </template>
                      <template v-else>
                        <q-file
                          v-if="!turnedIn || !turnedIn.submitted"
                          v-model="filesToUpload"
                          :loading="loading.fileUpload"
                          label="Pick files"
                          use-chips
                          filled
                          multiple
                          append
                        >
                          <template v-slot:after>
                            <q-btn
                              @click="upload()"
                              round
                              dense
                              flat
                              icon="mdi-upload"
                            />
                          </template>
                        </q-file>
                        <q-list
                          v-if="uploadedFiles"
                          style="width: 100%;"
                          padding
                        >
                          <q-item
                            v-for="(file, index) in uploadedFiles"
                            :key="index"
                          >
                            <q-item-section>{{
                              file.location.path.split("/").pop()
                            }}</q-item-section>
                            <q-item-section side>
                              <div class="text-grey-8 q-gutter-xs">
                                <q-btn
                                  @click="deleteFile(file)"
                                  class="gt-xs"
                                  size="12px"
                                  flat
                                  dense
                                  round
                                  icon="mdi-delete"
                                />
                              </div>
                            </q-item-section>
                          </q-item>
                        </q-list>
                        <q-btn
                          v-if="turnedIn && turnedIn.submitted"
                          @click="unsubmit()"
                        >
                          Unsubmit
                        </q-btn>
                        <q-btn v-else @click="turnIn()">Turn in</q-btn>
                      </template>
                    </q-card-section>
                    <q-separator></q-separator>
                    <q-card-section>
                      <q-input
                        v-model="privateComment"
                        type="text"
                        label="Private comment"
                      >
                        <template v-slot:append>
                          <q-icon
                            name="mdi-send"
                            @click="sendPrivateComment()"
                            class="cursor-pointer"
                          />
                        </template>
                      </q-input>
                      <q-list v-if="privateComments && privateComments.replies">
                        <q-item
                          v-for="({ text, user: { displayName }, timestamp },
                          index) in privateComments.replies.slice().reverse()"
                          :key="index"
                        >
                          <q-item-section>
                            <q-item-label overline>
                              {{ displayName }}
                            </q-item-label>
                            <q-item-label>{{ text }}</q-item-label>
                          </q-item-section>
                          <q-item-section side top>
                            <q-item-label caption>
                              {{ timestamp | formatCommentTimestamp }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </template>
              </q-splitter>
            </div>
          </q-card-section>
        </q-tab-panel>

        <q-tab-panel name="studentsWork">
          <q-card-section>
            <div class="text-h5">{{ assignment.title }}</div>
            <div class="subtitle">
              Сдать до {{ assignment.due | formatDueTimestamp }}
            </div>
          </q-card-section>
          <q-card-section>
            <q-table
              :data="studentsWork"
              :columns="columns"
              :grid="$q.screen.lt.md"
            >
              <template v-slot:body-cell-done="props">
                <q-td :props="props">
                  <q-badge
                    :color="
                      isTurnedInLate(props.row.timestamp)
                        ? 'negative'
                        : 'positive'
                    "
                  >
                    {{ props.value }}
                  </q-badge>
                </q-td>
              </template>
              <template v-slot:body-cell-action="props">
                <q-btn
                  @click="openWorkDialog(props.row.id)"
                  icon="mdi-open-in-new"
                  flat
                  round
                ></q-btn>
              </template>
              <template v-slot:item="props">
                <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <q-card>
                    <q-card-section>
                      <q-btn
                        @click="openWorkDialog(props.row.id)"
                        icon="mdi-open-in-new"
                        flat
                        round
                      ></q-btn>
                      <span>Open work</span>
                    </q-card-section>
                    <q-separator />
                    <q-list>
                      <q-item v-for="col in props.cols" :key="col.name">
                        <q-item-section>
                          <q-item-label>{{ col.label }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-item-label v-if="col.name === 'done'" caption>
                            <q-badge
                              :color="
                                isTurnedInLate(props.row.timestamp)
                                  ? 'negative'
                                  : 'positive'
                              "
                            >
                              {{ col.value }}
                            </q-badge>
                          </q-item-label>
                          <q-item-label v-else caption>
                            {{ col.value }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    <q-dialog v-model="workDialog.visible">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h5">Работа студента</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-list bordered>
            <q-item-label header>Статус</q-item-label>
            <template v-if="workDialog.work">
              <q-item>
                <q-item-section>Просмотрено</q-item-section>
                <q-item-section avatar>
                  <q-avatar
                    :color="workDialog.work.seen ? 'positive' : 'negative'"
                    :icon="workDialog.work.seen ? 'mdi-check' : 'mdi-close'"
                    text-color="white"
                  ></q-avatar>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>Сдано</q-item-section>
                <q-item-section avatar>
                  <q-avatar
                    :color="workDialog.work.submitted ? 'positive' : 'negative'"
                    :icon="
                      workDialog.work.submitted ? 'mdi-check' : 'mdi-close'
                    "
                    text-color="white"
                  ></q-avatar>
                </q-item-section>
              </q-item>
              <template v-if="workDialog.work.submitted">
                <q-item>
                  <q-item-section>Сдано вовремя</q-item-section>
                  <q-item-section avatar>
                    <q-avatar
                      v-if="isTurnedInLate(workDialog.work.timestamp)"
                      color="negative"
                      icon="mdi-close"
                      text-color="white"
                    ></q-avatar>
                    <q-avatar
                      v-else
                      color="positive"
                      icon="mdi-check"
                      text-color="white"
                    ></q-avatar>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Редактировано</q-item-section>
                  <q-item-section avatar>
                    <q-avatar
                      v-if="workDialog.work.edited"
                      color="warning"
                      icon="mdi-check"
                      text-color="black"
                    ></q-avatar>
                    <q-avatar
                      v-else
                      color="positive"
                      icon="mdi-close"
                      text-color="white"
                    ></q-avatar>
                  </q-item-section>
                </q-item>
              </template>
            </template>
            <q-item-label header>Файлы</q-item-label>
            <template v-if="workDialog.files && workDialog.files.length">
              <q-item v-for="(file, index) in workDialog.files" :key="index">
                <q-item-section>
                  {{ file.location.path.split("/").pop() }}
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    @click="downloadFile(file)"
                    icon="mdi-download"
                    flat
                    round
                  />
                </q-item-section>
              </q-item>
            </template>
            <q-item v-else>
              <q-item-section>Файлы отсутствуют</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section v-if="workDialog.work">
          <div class="text-h6 q-mb-md">Оценка</div>
          <q-btn-toggle
            v-model="workDialog.work.mark"
            @input="changeMark"
            toggle-color="primary"
            :options="computedMarks"
            spread
          />
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <q-input
            v-model="privateComment"
            type="text"
            label="Comment"
            filled
            autogrow
          >
            <template v-slot:append>
              <q-icon
                name="mdi-send"
                @click="sendPrivateComment()"
                class="cursor-pointer"
              />
            </template>
          </q-input>
          <q-list v-if="privateComments && privateComments.replies">
            <q-item
              v-for="({ text, user: { displayName }, timestamp },
              index) in privateComments.replies.slice().reverse()"
              :key="index"
            >
              <q-item-section>
                <q-item-label overline>
                  {{ displayName }}
                </q-item-label>
                <q-item-label>{{ text }}</q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-item-label caption>
                  {{ timestamp | formatCommentTimestamp }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
    <TaskDialog
      v-if="isTeacher"
      v-model="editTaskDialog"
      mode="edit"
      :courseId="courseId"
      :assignmentId="id"
      :data="assignment"
      @visibility="changeVisibility"
    ></TaskDialog>
    <q-dialog v-if="isStudent" v-model="testDialog.visible">
      <q-card>
        <q-card-section>
          <div class="text-h5">Тест</div>
        </q-card-section>
        <q-card-section>
          <div class="q-gutter-md">
            <div v-for="(option, index) in testDialog.test" :key="index">
              <q-input
                v-model="option.question"
                type="text"
                label="Question"
                color="negative"
                filled
                readonly
              >
              </q-input>
              <div class="q-px-lg q-py-xs q-gutter-y-md">
                <q-input
                  v-for="(answer, answerIndex) in option.answers"
                  :key="answerIndex"
                  v-model="option.answers[answerIndex].label"
                  color="negative"
                  type="text"
                  filled
                  readonly
                >
                  <template
                    v-if="
                      turnedIn.submitted &&
                      assignment.test[testDialog.variant][index].answers[
                        answerIndex
                      ].value
                    "
                    v-slot:append
                  >
                    <q-icon name="mdi-check" color="positive"></q-icon>
                  </template>
                  <template v-slot:before>
                    <q-checkbox
                      v-model="option.answers[answerIndex].value"
                      :disable="turnedIn.submitted"
                      filled
                    />
                  </template>
                </q-input>
              </div>
            </div>
          </div>
          <q-btn
            v-if="turnedIn.submitted"
            @click="testDialog.visible = false"
            label="Close"
            color="primary"
            class="q-mt-md full-width"
          />
          <q-btn
            v-else
            @click="turnInTest()"
            :disable="
              testDialog.test.some((el, elIndex) =>
                el.answers.every(
                  (answerEl, answerIndex) => answerEl.value === false
                )
              )
            "
            label="Turn in"
            color="primary"
            class="q-mt-md full-width"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { firestore, storage, Timestamp, FieldValue } from "boot/firebase";
import isPast from "date-fns/isPast";
import isAfter from "date-fns/isAfter";
import { date } from "quasar";
import { dateFormat } from "boot/globals";

import TaskDialog from "../components/TaskDialog.vue";

export default {
  name: "Assignment",
  components: {
    TaskDialog,
  },
  data() {
    return {
      id: this.$route.params.assignmentId,
      courseId: this.$route.params.courseId,
      tab: "assignment",
      course: null,
      storageRef: null,
      assignmentRef: null,
      turnInRef: null,
      turnedIn: null,
      assignment: null,
      comments: null,
      privateComments: null,
      columns: [
        {
          name: "student",
          required: true,
          label: "Студент",
          align: "left",
          field: "user",
          format: (val) => val.displayName,
        },
        {
          name: "seen",
          label: "Просмотрено",
          align: "left",
          field: "seen",
          sortable: true,
          format: (val) => (val ? "Да" : "Нет"),
        },
        {
          name: "mark",
          align: "left",
          label: "Оценка",
          field: "mark",
          sortable: true,
          format: (val) =>
            val ? `${val} / ${this.assignment.maxMark}` : "Не выставлена",
        },
        {
          name: "submitted",
          align: "left",
          label: "Сдано",
          field: "submitted",
          sortable: true,
          format: (val) => (val ? "Да" : "Нет"),
        },
        {
          name: "done",
          align: "left",
          label: "Время сдачи",
          field: "timestamp",
          sortable: true,
          format: (timestamp) =>
            timestamp
              ? date.formatDate(timestamp.toDate(), dateFormat)
              : "Не сдано",
        },
        {
          name: "edited",
          align: "left",
          label: "Редактировано в",
          field: "edited",
          format: (timestamp) =>
            timestamp
              ? date.formatDate(timestamp.toDate(), dateFormat)
              : "Не редактировано",
        },
        {
          name: "action",
          align: "left",
        },
      ],
      splitterWidth: this.$store.state.user.auth.uid.startsWith("t") ? 100 : 70,
      comment: null,
      filesToUpload: null,
      uploadedFiles: null,
      uploadPath: null,
      students: null,
      studentsWork: null,
      privateComment: "",
      user: {
        uid: this.$store.state.user.auth.uid,
        displayName: this.$store.state.user.auth.displayName,
      },
      isTeacher: this.$store.state.user.auth.uid.startsWith("t"),
      isStudent: this.$store.state.user.auth.uid.startsWith("s"),
      loading: {
        fileUpload: false,
      },
      workDialog: {
        visible: false,
        uid: null,
        work: null,
        files: null,
      },
      editTaskDialog: false,
      testDialog: {
        visible: false,
        variant: null,
        test: [],
      },
      testQuestionMark: null,
    };
  },
  watch: {
    "$route.params.assignmentId": {
      immediate: true,
      async handler(id) {
        this.$q.loading.show();
        const courseRef = firestore.collection("courses").doc(this.courseId);
        const course = await this.$bind("course", courseRef);
        this.assignmentRef = courseRef.collection("classwork").doc(id);
        const doneRef = this.assignmentRef.collection("done");
        const promises = [
          this.$bind("assignment", this.assignmentRef),
          this.$bind("comments", this.assignmentRef.collection("comments")),
        ];
        if (this.isStudent) {
          promises.push(
            doneRef.doc(this.user.uid).set(
              {
                seen: true,
                user: firestore
                  .collection("users")
                  .doc(this.$store.state.user.auth.uid),
              },
              { merge: true }
            ),
            this.$bind(
              "privateComments",
              this.assignmentRef
                .collection("privateComments")
                .doc(this.user.uid)
            )
          );
        }
        this.turnInRef = doneRef.doc(this.user.uid);
        promises.push(
          this.$bind("studentsWork", doneRef),
          this.$bind(
            "students",
            firestore.collection("users").where("group", "in", course.groups)
          ),
          this.$bind("turnedIn", this.turnInRef),
          this.updateFilesList()
        );
        await Promise.all(promises);
        this.$q.loading.hide();
      },
    },
  },
  computed: {
    computedMarks() {
      const marksArray = [];
      if (this.assignment.allowZero) {
        marksArray.push({ label: "0", value: 0 });
      }
      for (let i = 1; i <= this.assignment.maxMark; i += 1) {
        marksArray.push({ label: i.toString(), value: i });
      }
      return marksArray;
    },
  },
  methods: {
    async updateFilesList() {
      try {
        this.storageRef = storage
          .ref()
          .child(`files/${this.courseId}/${this.id}/${this.user.uid}`);
        const res = await this.storageRef.listAll();
        this.uploadedFiles = res.items;
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
    async sendComment() {
      if (this.comment) {
        try {
          await this.assignmentRef.collection("comments").add({
            text: this.comment,
            user: firestore.collection("users").doc(this.user.uid),
            timestamp: Timestamp.now(),
          });
          this.comment = "";
        } catch (err) {
          this.$q.notify({ message: err.message, color: "red" });
        }
      }
    },
    async sendPrivateComment() {
      if (this.privateComment) {
        try {
          await this.assignmentRef
            .collection("privateComments")
            .doc(this.workDialog.uid || this.user.uid)
            .set(
              {
                replies: FieldValue.arrayUnion({
                  text: this.privateComment,
                  user: firestore.collection("users").doc(this.user.uid),
                  timestamp: Timestamp.now(),
                }),
              },
              { merge: true }
            );
        } catch (err) {
          this.$q.notify({ message: err.message, color: "red" });
        }
      }
    },
    async openWorkDialog(uid) {
      this.workDialog.uid = uid;
      await this.$bind(
        "privateComments",
        this.assignmentRef.collection("privateComments").doc(uid)
      );
      this.workDialog.work = this.studentsWork.find((item) => item.id === uid);
      const res = await storage
        .ref()
        .child(`files/${this.courseId}/${this.id}/${uid}`)
        .listAll();
      this.workDialog.files = res.items;
      this.workDialog.visible = true;
    },
    async changeMark(mark) {
      try {
        await this.assignmentRef
          .collection("done")
          .doc(this.workDialog.uid)
          .update({
            mark,
          });
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
    async upload() {
      try {
        this.loading.fileUpload = true;
        const filesQueue = [];
        this.filesToUpload.forEach((file) => {
          filesQueue.push(this.storageRef.child(file.name).put(file));
        });
        await Promise.all(filesQueue);
        this.filesToUpload = null;
        await this.updateFilesList();
        this.loading.fileUpload = false;
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
        this.loading.fileUpload = false;
      }
    },
    async deleteFile(file) {
      try {
        await file.delete();
        this.updateFilesList();
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
    async unsubmit() {
      try {
        await this.turnInRef.update({
          submitted: false,
          edited: FieldValue.serverTimestamp(),
          timestamp: null,
        });
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
    async turnIn() {
      try {
        await this.turnInRef.set(
          {
            submitted: true,
            user: firestore.collection("users").doc(this.user.uid),
            timestamp: Timestamp.now(),
          },
          { merge: true }
        );
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
    async downloadFile(file) {
      const downloadURL = await storage
        .ref(file.location.path)
        .getDownloadURL();
      window.open(downloadURL, "_blank");
    },
    isPast(timestamp) {
      return isPast(timestamp.toDate());
    },
    isTurnedInLate(turnInTimestamp) {
      return isAfter(
        turnInTimestamp ? turnInTimestamp.toDate() : new Date(),
        this.assignment.due.toDate()
      );
    },
    changeVisibility() {
      this.editTaskDialog = false;
    },
    openTestDialog() {
      if (this.turnedIn.submitted === true) {
        const { test, variant } = JSON.parse(JSON.stringify(this.turnedIn));
        this.testDialog.test = test;
        this.testDialog.variant = variant;
      } else {
        this.testDialog.variant = this.random(
          0,
          Object.keys(this.assignment.test).length - 1
        );
        const test = JSON.parse(JSON.stringify(this.assignment.test))[
          this.testDialog.variant
        ];
        for (const { answers } of test) {
          for (const answer of answers) {
            answer.value = false;
          }
        }
        this.testDialog.test = test;
      }
      this.testQuestionMark =
        this.assignment.maxMark / this.testDialog.test.length;
      this.testDialog.visible = true;
    },
    random(from, to) {
      const min = Math.ceil(from);
      const max = Math.floor(to);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    async turnInTest() {
      try {
        let testMark = 0;
        this.assignment.test[this.testDialog.variant].forEach(
          (value, index) => {
            if (
              value.answers.every(
                ({ value }, elIndex) =>
                  this.testDialog.test[index].answers[elIndex].value === value
              )
            ) {
              testMark += this.testQuestionMark;
            }
          }
        );
        await this.turnInRef.set(
          {
            submitted: true,
            user: firestore.collection("users").doc(this.user.uid),
            timestamp: Timestamp.now(),
            test: this.testDialog.test,
            mark: Math.round(testMark.toFixed(1)),
            variant: this.testDialog.variant,
          },
          { merge: true }
        );
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
  },
};
</script>

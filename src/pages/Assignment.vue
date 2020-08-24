<template>
  <q-page v-if="assignment" padding>
    <q-card>
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="assignment" label="Assignment" />
        <q-tab
          v-if="$store.state.user.auth.uid.startsWith('t')"
          name="studentsWork"
          label="Students work"
        />
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
              >
                <template v-slot:before>
                  <q-card>
                    <q-card-section>
                      <div class="text-h6">{{ assignment.title }}</div>
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
                      <template
                        v-for="(line, index) in assignment.description.split(
                          '\n'
                        )"
                      >
                        {{ line }}
                        <br :key="index" />
                      </template>
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
                          index) in comments.slice().reverse()"
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
                <template
                  v-if="$store.state.user.auth.uid.startsWith('s')"
                  v-slot:after
                >
                  <q-card>
                    <q-card-section class="row flex-center">
                      <div class="text-h6">Your work</div>
                      <q-space></q-space>
                      <template v-if="turnedIn">
                        <div v-if="turnedIn.mark">
                          Оценено: {{ turnedIn.mark }}
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
                      <q-list v-if="uploadedFiles" style="width: 100%;" padding>
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
            <q-table title="Work" :data="studentsWork" :columns="columns">
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
            :options="[
              { label: '1', value: 1 },
              { label: '2', value: 2 },
              { label: '3', value: 3 },
              { label: '4', value: 4 },
              { label: '5', value: 5 },
            ]"
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
        <!-- <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="OK" v-close-popup />
        </q-card-actions> -->
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

export default {
  name: "Assignment",
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
          format: (val) => (val ? "Да" : "Нет"),
        },
        {
          name: "mark",
          align: "left",
          label: "Оценка",
          field: "mark",
          format: (val) => val || "Не выставлена",
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
      splitterWidth: 70,
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
      loading: {
        fileUpload: false,
      },
      workDialog: {
        visible: false,
        uid: null,
        work: null,
        files: null,
      },
    };
  },
  watch: {
    "$route.params.assignmentId": {
      immediate: true,
      async handler(id) {
        const courseRef = firestore.collection("courses").doc(this.courseId);
        const course = await this.$bind("course", courseRef);
        this.assignmentRef = courseRef.collection("classwork").doc(id);
        await this.$bind("assignment", this.assignmentRef);
        await this.$bind("comments", this.assignmentRef.collection("comments"));
        const doneRef = this.assignmentRef.collection("done");
        if (this.user.uid.startsWith("s")) {
          await doneRef.doc(this.user.uid).set(
            {
              seen: true,
              user: firestore
                .collection("users")
                .doc(this.$store.state.user.auth.uid),
            },
            { merge: true }
          );
          await this.$bind(
            "privateComments",
            this.assignmentRef.collection("privateComments").doc(this.user.uid)
          );
        }
        await this.$bind("studentsWork", doneRef);
        await this.$bind(
          "students",
          firestore.collection("users").where("group", "in", course.groups)
        );
        this.turnInRef = doneRef.doc(this.user.uid);
        await this.$bind("turnedIn", this.turnInRef);
        // await this.updateTurnInStatus();
        await this.updateFilesList();
      },
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
            .update({
              replies: FieldValue.arrayUnion({
                text: this.privateComment,
                user: firestore.collection("users").doc(this.user.uid),
                timestamp: Timestamp.now(),
              }),
            });
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
    // async updateTurnInStatus() {
    //   const turnInDoc = await this.turnInRef.get();
    //   if (turnInDoc.exists) {
    //     this.turnedIn = turnInDoc.data();
    //   }
    // },
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
            by: this.user.displayName,
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
      return isAfter(turnInTimestamp.toDate(), this.assignment.due.toDate());
    },
  },
};
</script>

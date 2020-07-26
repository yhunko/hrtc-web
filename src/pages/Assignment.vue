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
              <q-input v-model="comment" label="Comment" filled autogrow>
                <template v-slot:append>
                  <q-icon
                    name="mdi-send"
                    @click="sendComment()"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
              <q-list v-if="comments">
                <q-item
                  v-for="({ text, user: { displayName }, timestamp },
                  index) in comments"
                  :key="index"
                >
                  <q-item-section>
                    <q-item-label overline>{{ displayName }}</q-item-label>
                    <q-item-label>{{ text }}</q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <q-item-label caption>{{
                      timestamp | formatCommentTimestamp
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
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
              <q-file
                v-model="files"
                :loading="loading.fileUpload"
                label="Pick files"
                use-chips
                filled
                multiple
                append
              >
                <template v-slot:after>
                  <q-btn @click="upload()" round dense flat icon="mdi-send" />
                </template>
              </q-file>
            </q-card-section>
          </q-card>
        </template>
      </q-splitter>
    </div>
  </q-page>
</template>

<script>
import { firestore, storage, Timestamp } from "boot/firebase";

export default {
  name: "Assignment",
  data() {
    return {
      id: this.$route.params.assignmentId,
      courseId: this.$route.params.courseId,
      assignment: null,
      comments: null,
      splitterWidth: 70,
      comment: null,
      files: null,
      storageRef: null,
      user: {
        uid: this.$store.state.user.data.uid,
        displayName: this.$store.state.user.data.displayName,
      },
      loading: {
        fileUpload: false,
      },
    };
  },
  async created() {
    const course = await firestore
      .collection("courses")
      .doc(this.courseId)
      .get();
    this.storageRef = storage
      .ref()
      .child(
        `files/${course.data().title}/${this.assignment.title}/${
          this.user.displayName
        }`
      );
  },
  watch: {
    "$route.params.assignmentId": {
      immediate: true,
      handler(id) {
        const assignment = firestore
          .collection("courses")
          .doc(this.courseId)
          .collection("classwork")
          .doc(id);
        this.$bind("assignment", assignment);
        this.$bind("comments", assignment.collection("comments"));
      },
    },
  },
  methods: {
    async sendComment() {
      if (this.comment) {
        try {
          await firestore
            .collection("courses")
            .doc(this.courseId)
            .collection("classwork")
            .doc(this.id)
            .collection("comments")
            .add({
              text: this.comment,
              user: {
                uid: this.user.uid,
                displayName: this.user.displayName,
              },
              timestamp: Timestamp.now(),
            });
          this.comment = "";
        } catch (err) {
          this.$q.notify({ message: err.message, color: "red" });
        }
      }
    },
    async upload() {
      try {
        this.loading.fileUpload = true;
        await this.storageRef.child(this.files[0].name).put(this.files[0]);
        this.files = null;
        this.loading.fileUpload = false;
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
        this.loading.fileUpload = false;
      }
    },
  },
};
</script>

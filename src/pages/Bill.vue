<template>
  <q-page padding>
    <q-list>
      <q-expansion-item
        v-for="({ id, title, groups }, index) in subjects"
        :key="index"
        :label="title"
        popup
      >
        <q-separator />
        <q-card>
          <q-card-section>
            <q-list>
              <q-expansion-item
                v-for="(group, groupIndex) in groups"
                :key="groupIndex"
                @before-show="revealGroup(id, index)"
                :label="group"
                caption="Choose tasks to export"
                :group="`${groupTasks}-${groupIndex}`"
              >
                <q-card>
                  <q-card-section class="flex flex-center">
                    <q-option-group
                      v-if="groupTasks.length"
                      v-model="groupTasksChosen"
                      :options="groupTasks"
                      color="primary"
                      type="checkbox"
                    />
                    <div v-else class="text-h5">No tasks for this group</div>
                  </q-card-section>
                  <q-card-section v-if="groupTasks.length">
                    <q-btn
                      @click="createBill(id, group)"
                      label="Download bill"
                      color="primary"
                      class="full-width"
                    ></q-btn>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </q-page>
</template>

<script>
import { firestore, FieldPath } from "boot/firebase";
import { exportFile } from "quasar";

export default {
  name: "Bill",
  data() {
    return {
      groupExpanded: false,
      currentSubject: null,
      groupTasksChosen: [],
      groupTasks: [],
      subjects: [],
      classwork: [],
    };
  },
  async created() {
    await this.$bind(
      "subjects",
      firestore
        .collection("courses")
        .where(
          "teacher",
          "==",
          firestore.collection("users").doc(this.$store.state.user.auth.uid)
        )
    );
  },
  methods: {
    async revealGroup(id, subjectIndex) {
      if (this.currentSubject !== subjectIndex) {
        this.currentSubject = subjectIndex;
        this.groupTasks = [];
        const classworkSnapshot = await firestore
          .collection("courses")
          .doc(id)
          .collection("classwork")
          .get();
        classworkSnapshot.forEach((doc) => {
          const task = doc.data();
          this.groupTasks.push({
            label: task.title,
            value: doc.id,
          });
        });
      }
    },
    async createBill(subjectId, group) {
      const cols = ["Студент"];
      const rows = [];
      const classworkSnapshot = await firestore
        .collection("courses")
        .doc(subjectId)
        .collection("classwork")
        .where(FieldPath.documentId(), "in", this.groupTasksChosen)
        .get();
      console.log(classworkSnapshot);
      await new Promise((resolve) => {
        classworkSnapshot.forEach(async (doc) => {
          cols.push(`${doc.data().title}`);
          const usersSnapshot = await firestore
            .collection("users")
            .where("group", "==", group)
            .get();
          usersSnapshot.forEach(async (userDoc) => {
            const groupWorkSnapshot = await firestore
              .collection("courses")
              .doc(subjectId)
              .collection("classwork")
              .doc(doc.id)
              .collection("done")
              .where(FieldPath.documentId(), "==", userDoc.id)
              .get();
            groupWorkSnapshot.forEach((workDoc) => {
              rows.push([
                `${userDoc.data().displayName}`,
                `${workDoc.data().mark || ""}`,
              ]);
              resolve();
            });
          });
        });
      });
      let csv = "";
      csv += `${cols.join(",")}\r\n${rows.map(
        (row) => `${row.join(",")}\r\n`
      )}`;
      const exportStatus = exportFile(
        `Ведомость-${group}.csv`,
        csv,
        "text/csv"
      );
      if (exportStatus !== true) {
        this.$q.notify({
          message: "Browser denied file download...",
          color: "negative",
          icon: "warning",
        });
      }
    },
  },
};
</script>

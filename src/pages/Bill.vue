<template>
  <q-page padding>
    <q-list bordered separator>
      <q-expansion-item
        v-for="({ id, title, groups }, index) in subjects"
        @before-show="revealGroup(id, index)"
        :key="index"
        :label="`${title} - ${groups.join(', ')}`"
      >
        <q-separator />
        <q-card>
          <q-card-section>
            <q-btn
              @click="selectAllTasks()"
              :label="$t('bill.selectAll')"
              icon="mdi-select-all"
              flat
            />
            <q-btn
              @click="deselectAllTasks()"
              :label="$t('bill.deselectAll')"
              icon="mdi-select"
              flat
            />
          </q-card-section>
          <q-card-section>
            <q-option-group
              v-if="groupTasks.length"
              v-model="groupTasksChosen"
              :options="groupTasks"
              color="primary"
              type="checkbox"
            />
            <div v-else class="text-h5">{{ $t("bill.noTasks") }}</div>
          </q-card-section>
          <q-card-section v-if="groupTasks.length">
            <q-btn
              @click="createBill(id, groups)"
              :label="`${$t('bill.download')} (.csv)`"
              :disable="!groupTasksChosen.length"
              :loading="loading.bill"
              color="primary"
              class="full-width"
            ></q-btn>
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
      loading: {
        bill: false,
      },
    };
  },
  async created() {
    await this.$bind(
      "subjects",
      firestore
        .collection("courses")
        .where(
          "teachers",
          "array-contains",
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
          this.groupTasksChosen.push(doc.id);
        });
      }
    },
    selectAllTasks() {
      this.groupTasksChosen = this.groupTasks.map(({ value }) => value);
    },
    deselectAllTasks() {
      this.groupTasksChosen = [];
    },
    async createBill(subjectId, groups) {
      this.loading.bill = true;
      const cols = ["Студент"];
      const rows = [];
      const classworkSnapshot = await firestore
        .collection("courses")
        .doc(subjectId)
        .collection("classwork")
        .where(FieldPath.documentId(), "in", this.groupTasksChosen)
        .get();
      let classworkData = null;
      await new Promise((resolve) => {
        classworkSnapshot.forEach(async (doc) => {
          classworkData = doc.data();
          cols.push(`${classworkData.title}`);
          const usersSnapshot = await firestore
            .collection("users")
            .where("group", "in", groups)
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
        `Ведомость-${
          this.subjects.find(({ id }) => id === subjectId).title
        }-${groups.join(",")}.csv`,
        csv,
        "text/csv"
      );
      this.loading.bill = false;
      if (exportStatus !== true) {
        this.$q.notify({
          message: "Browser denied file download...",
          type: "negative",
        });
      }
    },
  },
};
</script>

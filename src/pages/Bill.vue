<template>
  <q-page padding>
    <q-list>
      <q-expansion-item
        v-for="({ id, title, groups }, index) in subjects"
        :key="index"
        popup
        :label="title"
      >
        <q-separator />
        <q-card>
          <q-card-section>
            <q-list>
              <q-item v-for="(group, index) in groups" :key="index">
                <q-item-section>{{ group }}</q-item-section>
                <q-item-section side>
                  <q-btn
                    @click="createBill(id, group)"
                    color="primary"
                    label="Составить ведомость"
                    flat
                  ></q-btn>
                </q-item-section>
              </q-item>
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
      subjects: [],
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
    async createBill(subjectId, group) {
      const cols = ["Студент"];
      const rows = [];
      const classworkSnapshot = await firestore
        .collection("courses")
        .doc(subjectId)
        .collection("classwork")
        .get();
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

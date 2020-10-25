<template>
  <q-page class="flex justify-center" padding>
    <q-list v-if="notDoneAssignments">
      <q-item-label header>Not done assignments</q-item-label>
      <template mplate v-for="key in Object.keys(assignments)">
        <q-item
          v-for="(assignment, assignmentIndex) in notDoneAssignments[key]"
          :key="assignmentIndex"
          :to="`/assignment/${key}/${assignment.id}`"
          clickable
          v-ripple
        >
          <q-item-section>
            <q-item-label>{{ assignment.title }}</q-item-label>
            <q-item-label caption lines="2">
              {{ courses.find((course) => course.id === key).title }}
            </q-item-label>
          </q-item-section>

          <q-item-section v-if="assignment.due" side top>
            <q-item-label caption>
              till {{ assignment.due | formatTimestamp }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-page>
</template>

<script>
import { extend } from "quasar";
import { firestore } from "boot/firebase";

export default {
  name: "Todo",
  data() {
    return {
      courses: [],
      assignments: {},
      coursesRefs: [],
      notDoneAssignments: {},
    };
  },
  async created() {
    const courses = await this.$bind(
      "courses",
      firestore
        .collection("courses")
        .where("groups", "array-contains", this.$store.state.user.data.group)
    );
    for (const { id } of courses) {
      const ref = firestore.collection("courses").doc(id);
      this.$set(this.assignments, id, []);
      this.coursesRefs.push(ref);
      await this.$bind(
        `assignments.${id}`,
        ref.collection("classwork").where("type", "!=", "message")
      );
      this.notDoneAssignments = extend(
        true,
        this.assignments,
        this.notDoneAssignments
      );
      for (const [index, assignment] of this.assignments[id].entries()) {
        const doneSnapshot = await ref
          .collection("classwork")
          .doc(assignment.id)
          .collection("done")
          .doc(this.$store.state.user.auth.uid)
          .get();
        if (doneSnapshot.exists) {
          const data = doneSnapshot.data();
          if (data.submitted) {
            this.notDoneAssignments[id].splice(index, 1);
          }
        }
      }
    }
  },
};
</script>

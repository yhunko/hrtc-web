<template>
  <q-dialog :value="value" @input="$emit('input')">
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
          <div class="q-pa-xs q-gutter-sm">
            <q-input
              v-model="assignment.description"
              type="textarea"
              label="Task description *"
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
              lazy-rules
              filled
              autogrow
            >
              <template v-slot:hint>
                <div>
                  Supports HTML and
                  <a href="https://www.markdownguide.org/cheat-sheet/">
                    Markdown
                  </a>
                </div>
              </template>
            </q-input>
            <q-card flat bordered>
              <q-card-section>
                <q-markdown :src="assignment.description" />
              </q-card-section>
            </q-card>
          </div>
          <q-select
            v-model="selectedType"
            :options="assignmentTypes"
            label="Assingment type"
            filled
          />
          <q-input
            v-model="assignment.maxMark"
            label="Max mark"
            type="number"
            filled
          ></q-input>
          <q-checkbox v-model="assignment.allowZero" label="Allow zero mark" />
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
            <q-btn
              :label="mode === 'create' ? 'Create' : 'Edit'"
              type="submit"
              color="primary"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { date, extend } from "quasar";

import { firestore, Timestamp } from "boot/firebase";
import { dateFormat } from "boot/globals";

const assignmentTypes = Object.freeze([
  { value: "lection", label: "Lection" },
  { value: "practical", label: "Practical" },
  { value: "test", label: "Test" },
  { value: "acw", label: "Administrative work" },
]);

export default {
  name: "TaskDialog",
  props: ["value", "mode", "courseId", "assignmentId", "data"],
  data() {
    return {
      assignment: {
        title: "",
        description: null,
        due: null,
        type: assignmentTypes[0].value,
        maxMark: 5,
        allowZero: false,
      },
      assignmentTypes,
      dateFormat,
    };
  },
  computed: {
    selectedType: {
      get() {
        return assignmentTypes.find(
          (item) => item.value === this.assignment.type
        );
      },
      set(type) {
        this.assignment.type = type.value;
      },
    },
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        if (this.data) {
          this.assignment = extend(true, this.assignment, this.data);
          this.assignment.due = date.formatDate(
            this.assignment.due.toDate(),
            dateFormat
          );
        } else {
          this.assignment.due = date.formatDate(new Date(), dateFormat);
        }
      },
    },
  },
  methods: {
    onInput() {
      if (this.data) {
        console.log(extend(true, this.data));
        this.assignment = extend(true, this.data);
        this.assignment.due = date.formatDate(
          this.assignment.due.toDate(),
          dateFormat
        );
      } else {
        this.assignment.due = date.formatDate(new Date(), dateFormat);
      }
      this.$emit("input");
    },
    async onTaskSubmit() {
      try {
        const classworkRef = firestore
          .collection("courses")
          .doc(this.courseId)
          .collection("classwork");
        const data = {
          title: this.assignment.title,
          description: this.assignment.description,
          due: Timestamp.fromDate(
            date.extractDate(this.assignment.due, dateFormat)
          ),
          type: this.assignment.type,
          maxMark: this.assignment.maxMark,
          allowZero: this.assignment.allowZero,
          edited: Timestamp.now(),
        };
        if (this.assignmentId) {
          await classworkRef.doc(this.assignmentId).set(data, { merge: true });
        } else {
          await classworkRef.add(data);
        }
        this.$emit("visibility", false);
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
  },
};
</script>

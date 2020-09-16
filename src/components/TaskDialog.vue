<template>
  <q-dialog :value="value" @input="$emit('input')">
    <q-card style="min-width: 700px; max-width: 90vw;">
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
          <div class="q-pa-xs">
            <q-file
              v-model="assignmentFiles"
              label="Add files"
              filled
              use-chips
              multiple
              counter
            />
          </div>
          <q-list v-if="uploadedFiles && uploadedFiles.length" bordered padding>
            <q-item-label header>Uploaded files</q-item-label>
            <q-item v-for="(file, index) in uploadedFiles" :key="index">
              <q-item-section>
                {{ file.location.path.split("/").pop() }}
              </q-item-section>
              <q-item-section side>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn
                    @click="deleteUploadedFile(file, index)"
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
          <q-select
            v-model="selectedType"
            :options="assignmentTypes"
            label="Assignment type"
            filled
          />
          <template v-if="selectedType.value === 'test'">
            <div class="q-px-lg q-py-xs q-gutter-sm">
              <div class="row q-gutter-md">
                <q-btn
                  @click="addTestVariant()"
                  color="primary"
                  label="Add variant"
                  class="col"
                  style="width: 100%;"
                />
                <q-btn
                  @click="deleteTestVariant()"
                  :label="
                    testVariantTab < 0
                      ? 'No variant to delete'
                      : `Delete variant ${testVariantTab + 1}`
                  "
                  :disable="testVariantTab < 0"
                  color="negative"
                  class="col"
                  style="width: 100%;"
                />
              </div>
              <q-tabs
                v-model="testVariantTab"
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                otuside-arrows
              >
                <q-tab
                  v-for="(variant, variantIndex) in assignment.test"
                  :key="variantIndex"
                  :name="variantIndex"
                  :label="`Variant ${variantIndex + 1}`"
                ></q-tab>
              </q-tabs>
              <q-separator />
              <q-tab-panels v-model="testVariantTab" animated>
                <q-tab-panel
                  v-for="(variant, variantIndex) in assignment.test"
                  :key="variantIndex"
                  :name="variantIndex"
                >
                  <div v-for="(option, index) in variant" :key="index">
                    <div class="q-mb-md">
                      <q-img v-if="option.image" :src="option.image">
                        <div class="absolute-top-right">
                          <q-btn
                            @click="option.image = null"
                            icon="mdi-close"
                            dense
                            round
                            flat
                          />
                        </div>
                      </q-img>
                      <q-file
                        v-else
                        @input="onTestImageInput($event, variantIndex, index)"
                        :label="`Attach image for question ${index + 1}`"
                        accept="image/*"
                        filled
                      >
                        <template v-slot:prepend>
                          <q-icon name="mdi-image" />
                        </template>
                      </q-file>
                    </div>

                    <q-input
                      v-model="option.question"
                      :label="`Input question ${index + 1}`"
                      type="text"
                      filled
                    >
                      <template v-slot:after>
                        <q-btn
                          @click="deleteTestQuestion(variantIndex, index)"
                          dense
                          flat
                          round
                          icon="mdi-delete"
                        />
                      </template>
                    </q-input>
                    <div class="q-px-lg q-py-xs">
                      <q-input
                        v-for="(answer, answerIndex) in option.answers"
                        :key="answerIndex"
                        v-model="option.answers[answerIndex].label"
                        :label="`Input answer ${answerIndex + 1}`"
                        type="text"
                      >
                        <template v-slot:after>
                          <q-btn
                            @click="
                              deleteTestAnswer(variantIndex, index, answerIndex)
                            "
                            icon="mdi-delete"
                            dense
                            flat
                            round
                          ></q-btn>
                        </template>
                        <template v-slot:before>
                          <q-checkbox
                            v-model="option.answers[answerIndex].value"
                            filled
                          />
                        </template>
                      </q-input>
                      <q-btn
                        @click="addTestAnswer(variantIndex, index)"
                        label="Add answer"
                        class="q-mt-md full-width"
                        color="primary"
                      />
                    </div>
                  </div>
                  <div>
                    <q-btn
                      @click="addTestQuestion(variantIndex)"
                      label="Add question"
                      class="q-mt-xs full-width"
                      color="primary"
                    />
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </template>
          <q-checkbox
            v-model="assignment.conferenceEnabled"
            label="Add conference link?"
          />
          <q-input
            v-if="assignment.conferenceEnabled"
            v-model="assignment.conferenceURL"
            type="url"
            label="Conference link"
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
              :label="mode === 'create' ? 'Create' : 'Update'"
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

import { firestore, storage, Timestamp } from "boot/firebase";
import { dateFormat } from "boot/globals";

const assignmentTypes = Object.freeze([
  { value: "lection", label: "Lection" },
  { value: "practical", label: "Practical" },
  { value: "test", label: "Test" },
  { value: "acw", label: "Administrative work" },
]);

export default {
  name: "TaskDialog",
  props: ["value", "mode", "courseId", "assignmentId", "data", "uploadedFiles"],
  data() {
    return {
      testVariantTab: 0,
      assignmentFiles: [],
      assignment: {
        title: "",
        description: null,
        due: null,
        type: assignmentTypes[0].value,
        conferenceEnabled: false,
        conferenceURL: "",
        test: [
          [
            {
              image: null,
              question: "",
              answers: [
                {
                  label: "",
                  value: false,
                },
              ],
            },
          ],
        ],
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
      immediate: false,
      async handler() {
        if (this.data) {
          this.assignment = extend(true, this.assignment, this.data);
          if (this.assignment.test) {
            this.assignment.test = Object.values(this.assignment.test);
          }
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
    onTestImageInput(file, variantIndex, questionIndex) {
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.onloadend = () => {
        this.$set(
          this.assignment.test[variantIndex][questionIndex],
          "image",
          fr.result
        );
      };
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
          conferenceEnabled: this.assignment.conferenceEnabled,
          maxMark: this.assignment.maxMark,
          allowZero: this.assignment.allowZero,
        };
        const assignmentRef = this.assignmentId
          ? classworkRef.doc(this.assignmentId)
          : classworkRef.doc();
        if (this.selectedType.value === "test") {
          const res = {};
          this.assignment.test.forEach(async (variant, index) => {
            res[index] = variant;
          });
          data.test = res;
        }
        if (this.assignment.conferenceEnabled) {
          data.conferenceURL = this.assignment.conferenceURL;
        }
        if (this.assignmentId) {
          data.edited = Timestamp.now();
          await assignmentRef.set(data, { merge: true });
        } else {
          data.timestamp = Timestamp.now();
          await assignmentRef.set(data);
        }
        const filesQueue = [];
        this.assignmentFiles.forEach((file) => {
          filesQueue.push(
            storage
              .ref()
              .child(`files/${this.courseId}/${assignmentRef.id}`)
              .child(file.name)
              .put(file)
          );
        });
        const res = await Promise.all(filesQueue);
        for (const { ref } of res) {
          this.uploadedFiles.push(ref);
        }
        this.$emit("visibility", false, this.selectedType.value);
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
    async deleteUploadedFile(file, index) {
      try {
        await file.delete();
        this.uploadedFiles.splice(index, 1);
      } catch (err) {
        this.$q.notify({ message: err.message, color: "red" });
      }
    },
    addTestQuestion(variantIndex) {
      this.assignment.test[variantIndex].push({
        image: null,
        question: "",
        answers: [
          {
            label: "",
            value: false,
          },
        ],
      });
    },
    deleteTestQuestion(variantIndex, index) {
      this.assignment.test[variantIndex].splice(index, 1);
    },
    addTestAnswer(variantIndex, index) {
      this.assignment.test[variantIndex][index].answers.push({
        label: "",
        value: false,
      });
    },
    deleteTestAnswer(variantIndex, questionIndex, answerIndex) {
      this.assignment.test[variantIndex][questionIndex].answers.splice(
        answerIndex,
        1
      );
    },
    addTestVariant() {
      const newIndex = this.assignment.test.length;
      this.assignment.test.push([]);
      this.addTestQuestion(newIndex);
      this.testVariantTab = newIndex;
    },
    deleteTestVariant() {
      this.assignment.test.splice(this.testVariantTab, 1);
      this.testVariantTab = this.testVariantTab - 1;
    },
  },
};
</script>

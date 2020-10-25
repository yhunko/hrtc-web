<template>
  <q-dialog :value="value" @input="$emit('input')">
    <q-card style="min-width: 40vw; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">
          {{ isCreate ? $t("taskDialog.creating") : $t("taskDialog.editing") }}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit="onTaskSubmit" class="q-gutter-md">
          <q-input
            v-model="assignment.title"
            :label="`${$t('taskDialog.title')} *`"
            :rules="[(val) => (val && val.length > 0) || $t('errors.empty')]"
            lazy-rules
            filled
          >
            <template v-slot:prepend>
              <q-icon name="mdi-format-title" />
            </template>
          </q-input>

          <q-input
            v-model="assignment.description"
            type="textarea"
            :label="`${$t('taskDialog.description.label')} *`"
            :rules="[(val) => (val && val.length > 0) || $t('errors.empty')]"
            lazy-rules
            filled
            autogrow
          >
            <template v-slot:prepend>
              <q-icon name="mdi-language-markdown" />
            </template>
            <template v-slot:hint>
              <div>
                {{ $t("taskDialog.description.hint", ["HTML", "Markdown"]) }}
              </div>
            </template>
          </q-input>

          <q-card v-if="assignment.description.length" flat bordered>
            <q-card-section>
              <q-markdown :src="assignment.description" />
            </q-card-section>
          </q-card>

          <q-select
            v-model="selectedType"
            :options="assignmentTypes"
            :label="$t('taskDialog.type')"
            :disable="isEdit"
            filled
          >
            <template v-slot:prepend>
              <q-icon name="mdi-shape" />
            </template>
          </q-select>

          <q-checkbox
            v-model="assignment.conferenceEnabled"
            :label="$t('taskDialog.conferenceEnabled')"
          />

          <template v-if="assignment.conferenceEnabled">
            <q-input
              v-model="assignment.conferenceURL"
              :label="$t('taskDialog.conferenceURL')"
              type="url"
              filled
            >
              <template v-slot:prepend>
                <q-icon name="mdi-video-account" />
              </template>
            </q-input>
            <q-input
              v-model="assignment.conferencePassword"
              label="Conference password"
              filled
            >
              <template v-slot:prepend>
                <q-icon name="mdi-lock" />
              </template>
            </q-input>
          </template>

          <template v-if="selectedType.value !== 'message'">
            <div class="q-pa-xs">
              <q-file
                v-model="assignmentFiles"
                @rejected="onRejectedFilePick"
                :label="$t('taskDialog.addFiles')"
                max-total-size="15728640"
                filled
                use-chips
                multiple
                counter
                append
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-file-multiple" />
                </template>
              </q-file>
            </div>

            <q-list
              v-if="uploadedFiles && uploadedFiles.length"
              bordered
              padding
            >
              <q-item-label header>
                {{ $t("taskDialog.uploadedFiles") }}
              </q-item-label>
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

            <template v-if="selectedType.value === 'test'">
              <div class="q-px-lg q-py-xs">
                <div class="row q-gutter-x-md">
                  <q-btn
                    @click="addTestVariant()"
                    :label="$t('taskDialog.test.addVariant')"
                    color="primary"
                    class="col"
                    style="width: 100%;"
                  />

                  <q-btn
                    @click="deleteTestVariant()"
                    :label="
                      testVariantTab < 0
                        ? $t('taskDialog.test.deleteVariant.noVariantToDelete')
                        : $t('taskDialog.test.deleteVariant.label', [
                            testVariantTab + 1,
                          ])
                    "
                    :disable="testVariantTab < 0"
                    color="negative"
                    class="col"
                    style="width: 100%;"
                  />
                </div>

                <q-tabs
                  v-model="testVariantTab"
                  active-color="primary"
                  indicator-color="primary"
                  align="justify"
                >
                  <q-tab
                    v-for="(variant, variantIndex) in assignment.test"
                    :key="variantIndex"
                    :name="variantIndex"
                    :label="$t('taskDialog.test.variant', [variantIndex + 1])"
                  />
                </q-tabs>

                <q-separator />

                <q-tab-panels v-model="testVariantTab" animated>
                  <q-tab-panel
                    v-for="(variant, variantIndex) in assignment.test"
                    :key="variantIndex"
                    :name="variantIndex"
                  >
                    <div
                      v-for="(option, index) in variant"
                      :key="index"
                      class="q-col-gutter-md"
                    >
                      <!-- <div class="q-mb-md">
                        <q-img
                          v-if="option.image && dataImages[variantIndex]"
                          :src="dataImages[variantIndex][index]"
                        >
                          <div class="absolute-top-right">
                            <q-btn
                              @click="removeImage(option, variantIndex, index)"
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
                      </div> -->

                      <div
                        v-if="option.question.includes('$$')"
                        :key="`${option.question}-${index}`"
                        class="flex flex-center q-py-md"
                        v-katex:auto
                      >
                        {{ option.question }}
                      </div>

                      <div class="row q-gutter-x-sm q-gutter-y-md">
                        <q-input
                          v-model="option.question"
                          :label="$t('taskDialog.test.inputQuestion')"
                          :prefix="`${index + 1}) `"
                          type="text"
                          autogrow
                          filled
                        >
                          <template v-slot:append>
                            <q-btn
                              @click="deleteTestQuestion(variantIndex, index)"
                              dense
                              flat
                              round
                              icon="mdi-delete"
                            >
                              <q-tooltip>
                                {{ $t("taskDialog.test.deleteQuestion") }}
                              </q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>

                        <q-input
                          v-model.number="option.points"
                          :label="$t('taskDialog.test.pointsAmount')"
                          type="number"
                          filled
                        />
                      </div>

                      <div class="q-mx-lg q-py-xs q-gutter-sm">
                        <template
                          v-for="(answer, answerIndex) in option.answers"
                        >
                          <div :key="answerIndex">
                            <div
                              v-if="answer.label.includes('$$')"
                              :key="`${answer.label}-${answerIndex}`"
                              class="flex flex-center q-py-sm"
                              v-katex:auto
                            >
                              {{ answer.label }}
                            </div>
                            <q-input
                              v-model="answer.label"
                              :prefix="`${index + 1}.${answerIndex + 1}) `"
                              type="text"
                              autogrow
                              filled
                            >
                              <template v-slot:after>
                                <q-btn
                                  @click="
                                    deleteTestAnswer(
                                      variantIndex,
                                      index,
                                      answerIndex
                                    )
                                  "
                                  icon="mdi-delete"
                                  dense
                                  flat
                                  round
                                >
                                  <q-tooltip>
                                    {{ $t("taskDialog.test.deleteAnswer") }}
                                  </q-tooltip>
                                </q-btn>
                              </template>
                              <template v-slot:before>
                                <q-checkbox
                                  v-model="option.answers[answerIndex].value"
                                  filled
                                />
                              </template>
                            </q-input>
                          </div>
                        </template>

                        <q-btn
                          @click="addTestAnswer(variantIndex, index)"
                          :label="$t('taskDialog.test.addAnswer')"
                          class="q-mt-md full-width"
                          color="primary"
                        />
                      </div>
                    </div>
                    <div>
                      <q-btn
                        @click="addTestQuestion(variantIndex)"
                        :label="$t('taskDialog.test.addQuestion')"
                        class="q-mt-xs full-width"
                        color="primary"
                      />
                    </div>
                  </q-tab-panel>
                </q-tab-panels>
              </div>
            </template>

            <template v-if="selectedType.value !== 'lection'">
              <q-input
                v-model="assignment.maxMark"
                :label="$t('taskDialog.test.maxMark')"
                type="number"
                filled
              />

              <q-checkbox
                v-model="assignment.allowZero"
                :label="$t('taskDialog.test.allowZeroMark')"
              />

              <q-input
                v-model="assignment.due"
                :label="$t('globals.due')"
                readonly
                filled
              >
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
                    <q-tooltip>
                      {{ $t("taskDialog.test.due.tooltips.pickDate") }}
                    </q-tooltip>
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
                    <q-tooltip>
                      {{ $t("taskDialog.test.due.tooltips.pickTime") }}
                    </q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </template>
          </template>

          <q-separator />

          <div class="text-right">
            <q-btn
              :label="
                isCreate
                  ? $t('taskDialog.test.create')
                  : $t('taskDialog.test.update')
              "
              :disable="selectedType.value === 'test' && testIsWrongFilled"
              :loading="loading.submitting"
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

import sendMessage from "../functions/sendMessage";

const testQuestion = {
  image: null,
  question: "",
  points: 1,
  answers: [
    {
      label: "",
      value: false,
    },
  ],
};

export default {
  name: "TaskDialog",
  props: [
    "value",
    "mode",
    "tab",
    "courseId",
    "assignmentId",
    "data",
    "uploadedFiles",
  ],
  data() {
    return {
      testVariantTab: 0,
      dataImages: {},
      assignmentFiles: [],
      assignment: {
        title: "",
        description: "",
        due: null,
        type: null,
        conferenceEnabled: false,
        conferenceURL: "",
        conferencePassword: "",
        test: [[JSON.parse(JSON.stringify(testQuestion))]],
        maxMark: 5,
        allowZero: false,
      },
      assignmentTypes: Object.freeze([
        { value: "message", label: this.$t("course.tabs.message") },
        { value: "lection", label: this.$t("course.tabs.lection") },
        { value: "practical", label: this.$t("course.tabs.practical") },
        { value: "test", label: this.$t("course.tabs.test") },
        { value: "acw", label: this.$t("course.tabs.acw") },
      ]),
      dateFormat,
      isCreate: this.mode === "create",
      isEdit: this.mode === "edit",
      loading: {
        submitting: false,
      },
    };
  },

  computed: {
    selectedType: {
      get() {
        return this.assignmentTypes.find(
          (item) => item.value === this.assignment.type
        );
      },
      set(type) {
        this.assignment.type = type.value;
      },
    },
    testIsWrongFilled() {
      return this.assignment.test.some((variant) =>
        variant.some(
          (question) =>
            question.question === "" ||
            question.points < 1 ||
            question.answers.length < 2 ||
            question.answers.some((answer) => answer.label === "") ||
            question.answers.every((answer) => answer.value === false)
        )
      );
    },
  },

  watch: {
    value: {
      immediate: true,
      async handler() {
        this.assignment.type =
          this.tab === "all" ? this.assignmentTypes[0].value : this.tab;
        if (this.data) {
          this.assignment = extend(true, this.assignment, this.data);
          if (this.assignment.test) {
            this.assignment.test = Object.values(this.assignment.test);
            const promises = [];
            for (const variant of this.assignment.test) {
              for (const question of variant) {
                if (question.image) {
                  promises.push(storage.ref(question.image).getDownloadURL());
                }
              }
            }
            const imagesRef = await Promise.all(promises);
            this.assignment.test.forEach((variant, index) => {
              variant.forEach((question, questionIndex) => {
                const found = imagesRef.find((img) =>
                  decodeURIComponent(img).includes(question.image)
                );
                if (found) {
                  if (!this.dataImages[index]) {
                    this.dataImages[index] = {};
                  }
                  this.dataImages[index][questionIndex] = found;
                }
              });
            });
          }
          if (this.assignment.due) {
            this.assignment.due = date.formatDate(
              this.assignment.due.toDate(),
              dateFormat
            );
          }
        } else {
          this.assignment.title = "";
          this.assignment.description = "";
          this.assignment.conferenceEnabled = false;
          this.assignment.conferenceURL = "";
          this.assignment.test = [[JSON.parse(JSON.stringify(testQuestion))]];
          this.assignment.maxMark = 5;
          this.assignment.allowZero = false;
          this.assignment.due = date.formatDate(new Date(), dateFormat);
        }
      },
    },
  },

  methods: {
    onTestImageInput(file, variantIndex, questionIndex) {
      const fr = new FileReader();
      fr.readAsDataURL(file);
      this.$set(
        this.assignment.test[variantIndex][questionIndex],
        "image",
        file
      );
      fr.onloadend = () => {
        if (!this.dataImages[variantIndex]) {
          this.$set(this.dataImages, variantIndex, {});
        }
        this.$set(this.dataImages[variantIndex], questionIndex, fr.result);
      };
    },

    async removeImage(option, variantIndex, questionIndex) {
      if (typeof option.image === "string") {
        console.log(variantIndex, questionIndex);
        // await firestore
        //   .collection("courses")
        //   .doc(this.courseId)
        //   .collection("classwork")
        //   .doc(this.assignmentId)
        //   .update({
        //     ["test." +
        //     variantIndex +
        //     "." +
        //     questionIndex +
        //     ".image"]: FieldValue.delete(),
        //   });
        // await storage.ref(option.image).delete();
      }
      option.image = null;
      delete this.dataImages[variantIndex][questionIndex];
    },

    async onTaskSubmit() {
      try {
        this.loading.submitting = true;
        const oldType = this.data?.type;
        const classworkRef = firestore
          .collection("courses")
          .doc(this.courseId)
          .collection("classwork");
        const data = {
          title: this.assignment.title,
          description: this.assignment.description,
          type: this.assignment.type,
          conferenceEnabled: this.assignment.conferenceEnabled,
        };
        const assignmentRef = this.assignmentId
          ? classworkRef.doc(this.assignmentId)
          : classworkRef.doc();
        if (this.selectedType.value === "test") {
          const res = {};
          const promises = [];
          this.assignment.test.forEach((variant, index) => {
            res[index] = variant;
            variant.forEach((question) => {
              if (question.image) {
                promises.push(
                  storage
                    .ref(`files/${this.courseId}/${assignmentRef.id}/test`)
                    .child(question.image.name)
                    .put(question.image)
                );
              }
            });
          });
          data.test = res;
          const imagesRes = await Promise.all(promises);
          for (const variant of Object.values(data.test)) {
            for (const question of variant) {
              if (question.image) {
                question.image = imagesRes.find(
                  (storage) => storage.metadata.name === question.image.name
                ).ref.location.path;
              }
            }
          }
        }
        if (!["message", "lection"].includes(this.selectedType.value)) {
          data.due = Timestamp.fromDate(
            date.extractDate(this.assignment.due, dateFormat)
          );
          data.maxMark = this.assignment.maxMark;
          data.allowZero = this.assignment.allowZero;
        }
        if (this.assignment.conferenceEnabled) {
          data.conferenceURL = this.assignment.conferenceURL;
          data.conferencePassword = this.assignment.conferencePassword;
        }
        if (this.assignmentId) {
          data.edited = Timestamp.now();
          await assignmentRef.set(data, { merge: true });
        } else {
          data.timestamp = Timestamp.now();
          const courseData = await firestore
            .collection("courses")
            .doc(this.courseId)
            .get();
          const { title, groups } = courseData.data();
          const usersData = await firestore
            .collection("users")
            .where("group", "in", groups)
            .get();
          const users = [];
          usersData.forEach((doc) => {
            users.push({ id: doc.id, data: doc.data() });
          });
          await Promise.all([
            assignmentRef.set(data),
            sendMessage({
              users,
              title: `New ${this.assignmentTypes
                .find((type) => type.value === data.type)
                .label.toLowerCase()} task`,
              body: `'${this.assignment.title}' in '${title}'`,
              to: `/assignment/${this.courseId}/${assignmentRef.id}`,
            }),
          ]);
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
        this.loading.submitting = false;
        this.$emit(
          "visibility",
          false,
          oldType !== data.type,
          this.selectedType.value
        );
      } catch (err) {
        this.loading.submitting = false;
        console.error(err);
        this.$q.notify({ message: err.message, type: "negative" });
      }
    },

    async deleteUploadedFile(file, index) {
      try {
        await file.delete();
        this.uploadedFiles.splice(index, 1);
      } catch (err) {
        this.$q.notify({ message: err.message, type: "negative" });
      }
    },

    addTestQuestion(variantIndex) {
      this.assignment.test[variantIndex].push(
        JSON.parse(JSON.stringify(testQuestion))
      );
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

    onRejectedFilePick() {
      this.$q.notify({
        type: "negative",
        message: "Selected files exceed file size limit",
      });
    },
  },
};
</script>

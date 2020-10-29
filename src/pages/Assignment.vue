<template>
  <q-page padding>
    <template v-if="assignment">
      <q-card>
        <template
          v-if="!isStudent && !['message', 'lection'].includes(assignment.type)"
        >
          <q-tabs
            v-model="tab"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab
              :label="$t('assignment.tabs.assignment')"
              name="assignment"
            />
            <q-tab
              :label="$t('assignment.tabs.studentsWork')"
              name="studentsWork"
            />
          </q-tabs>

          <q-separator />
        </template>

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="assignment">
            <q-card-section>
              <div class="flex flex-center">
                <q-splitter
                  v-model="splitterWidth"
                  :style="{ width: $q.screen.lt.md ? '90vw' : '70vw' }"
                  :separator-style="{
                    'background-color': isStudent ? '' : 'transparent',
                  }"
                  :limits="[splitterWidth, splitterWidth]"
                  :horizontal="$q.screen.lt.md"
                >
                  <template v-slot:before>
                    <q-card>
                      <q-card-section>
                        <div class="flex">
                          <template v-if="isTeacher">
                            <div class="text-primary text-h4">
                              {{ assignment.title }}
                            </div>
                            <q-space></q-space>
                            <q-btn
                              @click="editTaskDialog = true"
                              color="primary"
                              icon="mdi-pencil"
                              flat
                              round
                            >
                              <q-tooltip>
                                {{ $t("assignment.tooltips.editAssignment") }}
                              </q-tooltip>
                            </q-btn>
                            <q-btn
                              @click="deleteAssignment()"
                              color="negative"
                              icon="mdi-delete"
                              flat
                              round
                            >
                              <q-tooltip>
                                {{ $t("assignment.deleteAssignment") }}
                              </q-tooltip>
                            </q-btn>
                          </template>
                          <template v-else>
                            <div class="text-primary text-h4">
                              {{ assignment.title }}
                            </div>
                          </template>
                        </div>
                        <div class="text-subtitle1">
                          {{ assignment.timestamp | formatTimestamp }}
                          <template v-if="assignment.edited">
                            ({{ $t("globals.edited") }}
                            {{ assignment.edited | formatTimestamp }})
                          </template>
                        </div>
                        <div class="q-mt-md row">
                          <span class="text-secondary text-bold">
                            {{
                              course.teachers
                                .map((teacher) => teacher.displayName)
                                .join(", ")
                            }}
                          </span>
                          <q-space></q-space>
                          <span
                            v-if="assignment.due"
                            :class="{ 'text-negative': isPast(assignment.due) }"
                          >
                            {{ $t("globals.due") }}
                            {{ assignment.due | formatTimestamp }}
                          </span>
                        </div>
                      </q-card-section>

                      <template v-if="assignment.conferenceEnabled">
                        <q-separator />
                        <q-card-section>
                          <div class="text-h6">Conference</div>
                          <q-chip
                            @click="openURL(assignment.conferenceURL)"
                            :label="assignment.conferenceURL"
                            color="primary"
                            icon-right="mdi-open-in-new"
                            clickable
                          />
                          <div
                            v-if="assignment.conferencePassword"
                            class="flex items-center text-subtitle2"
                          >
                            Password:
                            <q-chip
                              @click="
                                copyToClipboard(assignment.conferencePassword)
                              "
                              :label="assignment.conferencePassword"
                              class="q-ml-sm"
                              icon-right="mdi-content-copy"
                              color="primary"
                              clickable
                            />
                          </div>
                        </q-card-section>
                      </template>

                      <q-separator></q-separator>

                      <q-card-section
                        v-html="assignment.description"
                      ></q-card-section>

                      <template
                        v-if="
                          assignmentUploadedFiles &&
                          assignmentUploadedFiles.length
                        "
                      >
                        <q-separator></q-separator>
                        <q-card-section>
                          <div class="text-h6">
                            {{ $t("assignment.pinnedFiles") }}
                          </div>
                          <q-chip
                            v-for="(file, index) in assignmentUploadedFiles"
                            :key="index"
                            @click="downloadFile(file)"
                            icon="mdi-download"
                            clickable
                          >
                            {{ file.location.path.split("/").pop() }}
                          </q-chip>
                        </q-card-section>
                      </template>
                      <q-separator></q-separator>
                      <q-card-section>
                        <q-input
                          v-model="comment"
                          :label="$t('assignment.comment')"
                          color="primary"
                          filled
                          autogrow
                        >
                          <template v-slot:prepend>
                            <q-icon
                              name="mdi-comment-multiple"
                              color="primary"
                            />
                          </template>
                          <template v-slot:after>
                            <q-btn
                              @click="sendComment()"
                              icon="mdi-send"
                              color="primary"
                              flat
                              round
                              dense
                            >
                              <q-tooltip>
                                {{
                                  $t("assignment.tooltips.sendPublicComment")
                                }}
                              </q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>
                        <q-list v-if="comments && comments.length">
                          <q-item
                            v-for="({
                              id,
                              text,
                              user: { id: userId, displayName },
                              timestamp,
                            },
                            index) in comments"
                            :key="index"
                          >
                            <q-item-section>
                              <q-item-label
                                :class="[
                                  {
                                    'text-secondary text-bold': course.teachers.find(
                                      (teacher) =>
                                        teacher.displayName === displayName
                                    ),
                                  },
                                  'text-primary',
                                ]"
                                overline
                              >
                                {{ displayName }}
                              </q-item-label>
                              <q-item-label lines="2">{{ text }}</q-item-label>
                            </q-item-section>
                            <q-item-section side top>
                              <q-item-label caption>
                                {{ timestamp | formatCommentTimestamp }}
                                <q-btn
                                  v-if="user.uid === userId"
                                  @click="deleteComment(id)"
                                  color="negative"
                                  icon="mdi-delete"
                                  flat
                                  round
                                >
                                  <q-tooltip>
                                    {{
                                      $t("assignment.tooltips.deleteComment")
                                    }}
                                  </q-tooltip>
                                </q-btn>
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </template>
                  <template v-if="isStudent" v-slot:after>
                    <q-card>
                      <template
                        v-if="!['message', 'lection'].includes(assignment.type)"
                      >
                        <q-card-section class="row flex-center">
                          <div class="text-h6">
                            {{ $t("assignment.student.yourWork") }}
                          </div>
                          <q-space></q-space>
                          <template v-if="turnedIn">
                            <div v-if="typeof turnedIn.mark === 'number'">
                              {{ $t("assignment.student.gradeSet") }}:
                              {{ turnedIn.mark }} /
                              {{ assignment.maxMark }}
                            </div>
                            <div
                              v-else-if="turnedIn.submitted"
                              :class="[
                                { 'text-negative': isPast(assignment.due) },
                                'text-subtitle2',
                              ]"
                            >
                              {{
                                isTurnedInLate(turnedIn.timestamp)
                                  ? $t("assignment.student.turnedInLate")
                                  : $t("assignment.student.turnedIn")
                              }}
                            </div>
                          </template>
                          <div
                            v-else
                            :class="[
                              { 'text-negative': isPast(assignment.due) },
                              'text-subtitle2',
                            ]"
                          >
                            {{
                              isPast(assignment.due)
                                ? $t("assignment.student.missing")
                                : $t("assignment.student.assigned")
                            }}
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
                                  ? $t('assignment.student.test.timeIsOver')
                                  : turnedIn.submitted
                                  ? $t('assignment.student.test.viewTest')
                                  : $t('assignment.student.test.takeTest')
                              "
                              :disable="isPast(assignment.due)"
                            />
                          </template>
                          <template v-else>
                            <q-file
                              v-if="!turnedIn || !turnedIn.submitted"
                              v-model="filesToUpload"
                              :loading="loading.fileUpload"
                              :label="$t('assignment.student.pickFiles')"
                              color="primary"
                              use-chips
                              filled
                              multiple
                              append
                            >
                              <template v-slot:prepend>
                                <q-icon
                                  name="mdi-file-multiple"
                                  color="primary"
                                />
                              </template>
                              <template v-slot:after>
                                <q-btn
                                  @click="upload()"
                                  icon="mdi-upload"
                                  color="primary"
                                  round
                                  dense
                                  flat
                                >
                                  <q-tooltip>
                                    {{ $t("assignment.tooltips.uploadFiles") }}
                                  </q-tooltip>
                                </q-btn>
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
                                      icon="mdi-delete"
                                      flat
                                      dense
                                      round
                                    >
                                      <q-tooltip>
                                        {{
                                          $t("assignment.tooltips.deleteFile")
                                        }}
                                      </q-tooltip>
                                    </q-btn>
                                  </div>
                                </q-item-section>
                              </q-item>
                            </q-list>
                            <q-btn
                              v-if="turnedIn && turnedIn.submitted"
                              @click="unsubmit()"
                              color="negative"
                            >
                              {{ $t("assignment.student.unsubmit") }}
                            </q-btn>
                            <q-btn v-else @click="turnIn()" color="positive">{{
                              $t("assignment.student.turnIn")
                            }}</q-btn>
                          </template>
                        </q-card-section>
                        <q-separator></q-separator>
                      </template>
                      <q-card-section>
                        <q-input
                          v-model="privateComment"
                          :label="$t('assignment.privateComment')"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon
                              name="mdi-comment-account"
                              color="primary"
                            />
                          </template>
                          <template v-slot:after>
                            <q-btn
                              @click="sendPrivateComment()"
                              icon="mdi-send"
                              color="primary"
                              flat
                              round
                              dense
                            >
                              <q-tooltip>
                                {{
                                  $t("assignment.tooltips.sendPrivateComment")
                                }}
                              </q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>
                        <q-list
                          v-if="privateComments && privateComments.replies"
                        >
                          <q-item
                            v-for="({ text, user: { displayName }, timestamp },
                            index) in sortedPrivateComments"
                            :key="index"
                          >
                            <q-item-section>
                              <q-item-label
                                :class="[
                                  {
                                    'text-secondary text-bold': course.teachers.find(
                                      (teacher) =>
                                        teacher.displayName === displayName
                                    ),
                                  },
                                  'text-primary',
                                ]"
                                overline
                              >
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
          <q-tab-panel
            v-if="!['message', 'lection'].includes(assignment.type)"
            name="studentsWork"
          >
            <q-card-section>
              <div class="text-primary text-h5">{{ assignment.title }}</div>
              <div
                :class="[
                  'subtitle',
                  { 'text-negative': isPast(assignment.due) },
                ]"
              >
                {{ $t("globals.due") }}
                {{ assignment.due | formatTimestamp }}
              </div>
            </q-card-section>
            <q-card-section>
              <q-table
                :data="studentsWork"
                :columns="columns"
                :grid="$q.screen.lt.md"
                virtual-scroll
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
                        <span>{{ $t("assignment.teacher.openWork") }}</span>
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
            <q-card-section>
              <q-list class="rounded-borders shadow-2" bordered separator>
                <q-item-label header>
                  {{ $t("assignment.teacher.studentsWhoDidntOpen") }}
                </q-item-label>
                <q-item
                  v-for="({ displayName, group }, index) in computedStudents"
                  :key="index"
                >
                  <q-item-section>{{ displayName }}</q-item-section>
                  <q-item-section side>
                    {{ group }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
      <q-dialog v-model="workDialog.visible">
        <q-card style="width: 700px; max-width: 80vw;">
          <q-card-section>
            <div class="text-h5">
              {{ $t("assignment.teacher.studentsWork") }}
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-list bordered>
              <q-item-label header>
                {{ $t("assignment.teacher.status") }}
              </q-item-label>
              <template v-if="workDialog.work">
                <q-item>
                  <q-item-section>{{
                    $t("assignment.teacher.seen")
                  }}</q-item-section>
                  <q-item-section avatar>
                    <q-avatar
                      :color="workDialog.work.seen ? 'positive' : 'negative'"
                      :icon="workDialog.work.seen ? 'mdi-check' : 'mdi-close'"
                      text-color="white"
                    ></q-avatar>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    {{ $t("assignment.teacher.turnedIn") }}
                  </q-item-section>
                  <q-item-section avatar>
                    <q-avatar
                      :color="
                        workDialog.work.submitted ? 'positive' : 'negative'
                      "
                      :icon="
                        workDialog.work.submitted ? 'mdi-check' : 'mdi-close'
                      "
                      text-color="white"
                    ></q-avatar>
                  </q-item-section>
                </q-item>
                <template v-if="workDialog.work.submitted">
                  <q-item>
                    <q-item-section>{{
                      $t("assignment.teacher.turnedInOnTime")
                    }}</q-item-section>
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
                    <q-item-section>{{
                      $t("assignment.teacher.edited")
                    }}</q-item-section>
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
              <q-item-label header>{{ $t("files") }}</q-item-label>
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
                <q-item-section>{{ $t("filesMissing") }}</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-separator></q-separator>
          <template v-if="workDialog.work">
            <q-card-section v-if="assignment.type === 'test'">
              <div class="text-h6 q-mb-md">
                {{ $t("assignment.teacher.test") }}
              </div>
              <div class="column flex-center">
                <div class="text-subtitle2 q-mb-sm">
                  {{
                    $t("assignment.teacher.testResults", [
                      workDialog.work.testPoints,
                      computedTestMaxPoints,
                    ])
                  }}
                </div>
                <q-btn
                  @click="openTestDialog()"
                  :label="$t('assignment.teacher.viewTestAnswers')"
                  color="primary"
                  class="full-width"
                />
              </div>
            </q-card-section>
            <q-card-section>
              <div class="text-h6 q-mb-md">{{ $t("mark") }}</div>
              <q-btn-toggle
                v-model="workDialog.work.mark"
                @input="changeMark"
                :options="computedMarks"
                toggle-color="primary"
                spread
              />
            </q-card-section>
          </template>
          <q-separator></q-separator>
          <q-card-section>
            <q-input
              v-model="privateComment"
              :label="$t('assignment.privateComment')"
              type="text"
              filled
              autogrow
            >
              <template v-slot:prepend>
                <q-icon color="primary" name="mdi-comment-account" />
              </template>
              <template v-slot:after>
                <q-btn
                  @click="sendPrivateComment()"
                  color="primary"
                  icon="mdi-send"
                  flat
                  round
                  dense
                >
                  <q-tooltip>
                    {{ $t("assignment.tooltips.sendPrivateComment") }}
                  </q-tooltip>
                </q-btn>
              </template>
            </q-input>
            <q-list v-if="privateComments && privateComments.replies">
              <q-item
                v-for="({ text, user: { displayName }, timestamp },
                index) in sortedPrivateComments"
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
        @visibility="changeVisibility"
        :courseId="courseId"
        :assignmentId="id"
        :data="assignment"
        :uploadedFiles="assignmentUploadedFiles"
        mode="edit"
      />

      <q-dialog v-model="testDialog.visible">
        <q-card style="min-width: 50vw; max-width: 80vw;">
          <q-card-section>
            <div class="text-h5">
              {{
                $t("assignment.student.test.label", [testDialog.variant + 1])
              }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section style="max-height: 70vh;" class="scroll">
            <div class="q-col-gutter-md">
              <div v-for="(option, index) in testDialog.test" :key="index">
                <q-img v-if="option.image" :src="getTestImg(option.image)" />

                <div
                  v-if="option.question.includes('$$')"
                  :key="`${option.question}-${index}`"
                  class="flex flex-center q-py-md"
                  v-katex:auto
                >
                  {{ option.question }}
                </div>

                <q-input
                  v-model="option.question"
                  :label="$t('assignment.student.test.question.label')"
                  :prefix="`${index + 1}) `"
                  filled
                  readonly
                  autogrow
                />

                <div class="q-mx-lg q-py-xs q-gutter-sm">
                  <template v-for="(answer, answerIndex) in option.answers">
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
                        :prefix="`${answerIndex + 1}) `"
                        filled
                        readonly
                        autogrow
                      >
                        <template
                          v-if="isTeacher || (turnedIn && turnedIn.submitted)"
                          v-slot:append
                        >
                          <q-icon
                            v-if="
                              assignment.test[testDialog.variant][index]
                                .answers[answerIndex].value
                            "
                            name="mdi-check"
                            color="positive"
                          ></q-icon>
                          <q-icon
                            v-else-if="answer.value"
                            name="mdi-close"
                            color="negative"
                          ></q-icon>
                        </template>
                        <template v-slot:before>
                          <q-checkbox
                            v-model="option.answers[answerIndex].value"
                            :disable="
                              isTeacher || (turnedIn && turnedIn.submitted)
                            "
                            filled
                          />
                        </template>
                      </q-input>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-btn
              v-if="isTeacher || (turnedIn && turnedIn.submitted)"
              @click="testDialog.visible = false"
              :label="$t('globals.close')"
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
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>
    <q-inner-loading :showing="loading.init">
      <q-spinner size="5em" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>
import {
  firestore,
  storage,
  Timestamp,
  FieldPath,
  FieldValue,
} from "boot/firebase";
import isPast from "date-fns/isPast";
import isAfter from "date-fns/isAfter";
import { date, openURL } from "quasar";
import { dateFormat } from "boot/globals";
import { copyToClipboard } from "quasar";

import TaskDialog from "../components/TaskDialog.vue";

import sendMessage from "../functions/sendMessage";
import getTestImg from "../functions/getTestImg";

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
      privateComments: {},
      assignmentUploadedFiles: null,
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
      splitterWidth: !this.$store.state.user.auth.uid.startsWith("s")
        ? 100
        : 70,
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
        init: false,
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
    };
  },
  watch: {
    "$route.params.assignmentId": {
      immediate: true,
      async handler(id) {
        this.loading.init = true;
        const courseRef = firestore.collection("courses").doc(this.courseId);
        const course = await this.$bind("course", courseRef);
        this.assignmentRef = courseRef.collection("classwork").doc(id);
        const doneRef = this.assignmentRef.collection("done");
        if (
          this.user.uid.startsWith("s") &&
          !this.course.groups.includes(this.$store.state.user.data.group)
        ) {
          this.$router.go(-1);
        }
        const promises = [
          this.$bind("assignment", this.assignmentRef),
          this.$bind(
            "comments",
            this.assignmentRef
              .collection("comments")
              .orderBy("timestamp", "desc")
          ),
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
        const uploadedFiles = await storage
          .ref()
          .child(`files/${this.courseId}/${this.id}`)
          .listAll();
        this.assignmentUploadedFiles = uploadedFiles.items;
        this.loading.init = false;
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
    computedStudents() {
      return this.students.filter(
        ({ id }) => !this.studentsWork.some(({ id: id2 }) => id2 === id)
      );
    },
    computedTestMaxPoints() {
      let res = 0;
      for (const variant of Object.values(this.assignment.test)) {
        for (const { points } of variant) {
          res += points;
        }
      }
      return res;
    },
    getTestImg,
    sortedPrivateComments() {
      return this.privateComments.replies
        .slice()
        .sort(({ timestamp: a }, { timestamp: b }) => {
          if (isAfter(b.toDate(), a.toDate())) {
            return 1;
          } else {
            return -1;
          }
        });
    },
  },
  methods: {
    async deleteComment(commentId) {
      try {
        await this.assignmentRef.collection("comments").doc(commentId).delete();
      } catch (err) {
        this.$q.notify({ message: err.message, type: "negative" });
      }
    },
    async deleteAssignment() {
      try {
        await this.assignmentRef.delete();
        this.$router.replace(`/course/${this.courseId}`);
      } catch (err) {
        this.$q.notify({ message: err.message, type: "negative" });
      }
    },
    async updateFilesList() {
      try {
        this.storageRef = storage
          .ref()
          .child(`files/${this.courseId}/${this.id}/${this.user.uid}`);
        const res = await this.storageRef.listAll();
        this.uploadedFiles = res.items;
      } catch (err) {
        this.$q.notify({ message: err.message, type: "negative" });
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
          const users = [];
          const usersData = await firestore
            .collection("users")
            .where("group", "in", this.course.groups)
            .where(FieldPath.documentId(), "!=", this.user.uid)
            .get();
          usersData.forEach((doc) => {
            users.push({ id: doc.id, data: doc.data() });
          });
          await sendMessage({
            users,
            title: "New comment",
            body: `${this.user.displayName} commented on '${this.assignment.title}'`,
            to: `/assignment/${this.courseId}/${this.id}`,
          });
          this.comment = "";
        } catch (err) {
          this.$q.notify({ message: err.message, type: "negative" });
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
          this.$q.notify({ message: err.message, type: "negative" });
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
        this.$q.notify({ message: err.message, type: "negative" });
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
        this.$q.notify({ message: err.message, type: "negative" });
        this.loading.fileUpload = false;
      }
    },
    async deleteFile(file) {
      try {
        await file.delete();
        this.updateFilesList();
      } catch (err) {
        this.$q.notify({ message: err.message, type: "negative" });
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
        this.$q.notify({ message: err.message, type: "negative" });
      }
    },
    async turnIn() {
      try {
        await this.turnInRef.set(
          {
            submitted: true,
            timestamp: Timestamp.now(),
          },
          { merge: true }
        );
      } catch (err) {
        this.$q.notify({ message: err.message, type: "negative" });
      }
    },
    async downloadFile(file) {
      const downloadURL = await storage
        .ref(file.location.path)
        .getDownloadURL();
      openURL(downloadURL);
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
    changeVisibility(visible, changedType) {
      this.editTaskDialog = visible;
      if (changedType) {
        this.$router.go(-1);
      }
    },
    openTestDialog() {
      if (this.isTeacher) {
        const { test, variant } = JSON.parse(
          JSON.stringify(this.workDialog.work)
        );
        this.testDialog.test = test;
        this.testDialog.variant = variant;
      } else {
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
      }
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
              testMark += Number(value.points);
            }
          }
        );
        await this.turnInRef.set(
          {
            submitted: true,
            user: firestore.collection("users").doc(this.user.uid),
            timestamp: Timestamp.now(),
            test: this.testDialog.test,
            testPoints: testMark,
            variant: this.testDialog.variant,
          },
          { merge: true }
        );
      } catch (err) {
        this.$q.notify({ message: err.message, type: "negative" });
      }
    },
    openURL(url) {
      window.open(url, "_blank");
    },
    async copyToClipboard(text) {
      try {
        await copyToClipboard(text);
        this.$q.notify({
          type: "positive",
          message: "Copied successfully!",
        });
      } catch (err) {
        this.$q.notify({
          type: "negative",
          message: err.message,
        });
      }
    },
  },
};
</script>

<template>
  <q-page padding>
    <q-card v-if="user.uid.startsWith('a') && courses.length">
      <q-card-section>
        <div class="text-h6">{{ $t("index.admin.teachers") }}</div>
      </q-card-section>
      <q-card-section>
        <q-list>
          <q-expansion-item
            v-for="(courses, key) in grouppedByTeacher"
            :key="key"
            :label="key"
            switch-toggle-side
            default-opened
            popup
          >
            <q-card>
              <q-card-section>
                <q-list>
                  <q-item
                    v-for="({ id, title, groups }, index) in courses"
                    :key="index"
                  >
                    <q-item-section>
                      <q-item-label>{{ title }}</q-item-label>
                      <q-item-label caption>
                        {{ groups.join(", ") }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        :to="`/course/${id}`"
                        :label="$t('index.course.open')"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-card-section>
    </q-card>
    <q-card v-else bordered>
      <q-card-section>
        <div class="text-h6">{{ $t("index.classesList") }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="q-pa-lg row items-start q-gutter-lg">
          <template v-if="user.uid.startsWith('t')">
            <q-card v-for="(group, key) in grouppedByTitle" :key="key" bordered>
              <q-card-section>
                <div class="text-h4 text-primary">{{ key }}</div>
              </q-card-section>
              <q-separator inset />
              <q-card-actions>
                <template v-for="({ id, groups }, index) in group">
                  <q-btn
                    :key="index"
                    :to="`/course/${id}`"
                    :label="groups.join(', ')"
                    color="primary"
                    flat
                  />
                  <q-separator
                    :key="`sep-${index}`"
                    v-if="index !== group.length - 1"
                    inset
                    spaced
                    vertical
                  />
                </template>
              </q-card-actions>
            </q-card>
          </template>
          <template v-else>
            <q-card
              v-for="({ id, title, teachers }, index) in courses"
              :key="index"
              bordered
            >
              <q-card-section>
                <div class="text-h4 text-primary">{{ title }}</div>
                <div v-if="teachers" class="text-h6">
                  {{
                    teachers.map((teacher) => teacher.displayName).join(", ")
                  }}
                </div>
              </q-card-section>
              <q-separator inset />
              <q-card-actions>
                <q-btn
                  :key="index"
                  :to="`/course/${id}`"
                  :label="$t('index.course.open')"
                  color="primary"
                  flat
                />
              </q-card-actions>
            </q-card>
          </template>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { firestore } from "boot/firebase";

export default {
  name: "PageIndex",
  data() {
    return {
      courses: [],
      user: {
        uid: this.$store.state.user.auth.uid,
      },
    };
  },
  computed: {
    grouppedByTeacher() {
      const res = {};
      for (const course of this.courses) {
        const key = course.teacher.displayName;
        if (!res[key]) {
          res[key] = [];
        }
        res[key].push(course);
      }
      return res;
    },
    grouppedByTitle() {
      const res = {};
      for (const course of this.courses) {
        const key = course.title;
        if (!res[key]) {
          res[key] = [];
        }
        res[key].push(course);
      }
      return res;
    },
  },
  async created() {
    const coursesRef = firestore.collection("courses");
    if (this.user.uid.startsWith("a")) {
      await this.$bind("courses", coursesRef);
    } else if (this.user.uid.startsWith("t")) {
      await this.$bind(
        "courses",
        coursesRef.where(
          "teachers",
          "array-contains",
          firestore.collection("users").doc(this.user.uid)
        )
      );
    } else if (this.user.uid.startsWith("s")) {
      await this.$bind(
        "courses",
        coursesRef.where(
          "groups",
          "array-contains",
          this.$store.state.user.data.group
        )
      );
    }
  },
};
</script>

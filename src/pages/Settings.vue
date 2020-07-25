<template>
  <q-page padding>
    <q-list>
      <q-select
        v-model="lang"
        :options="langOptions"
        :label="$t('settings.lang')"
        emit-value
        map-options
        options-dense
      />
    </q-list>
  </q-page>
</template>

<script>
export default {
  name: "Settings",
  data() {
    return {
      lang: this.$i18n.locale,
      langOptions: [
        { value: "en-us", label: "English" },
        { value: "ru", label: "Русский" },
      ],
    };
  },
  watch: {
    lang(lang) {
      this.$i18n.locale = lang;
    },
  },
};
</script>

<script setup lang="ts">
import { useBackendStore } from '@/stores/backend';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const backend = useBackendStore()
</script>

<template>
  <v-dialog
    v-model="backend.showLanguageOverlay"
    persistent
    max-width="420"
  >
    <v-card>
      <v-card-title>{{ t('language.selectLanguage') }}</v-card-title>
      <v-card-text>
        <LanguageSwitcher />
      </v-card-text>
      <v-card-actions>
        <v-btn
          :text="t('actions.close')"
          block
          border
          @click="backend.showLanguageOverlay = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

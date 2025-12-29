<template>
  <v-sheet>
    <v-snackbar
      v-model="showChannelUploadSnackbar"
      :color="channelUploadResponse"
    >
      {{ channelUploadMessage }}

      <template #actions>
        <v-btn
          color="pink"
          variant="text"
          @click="showChannelUploadSnackbar = false"
        >
          {{ t('actions.close') }}
        </v-btn>
      </template>
    </v-snackbar>
    <v-file-input
      v-model="filesToUpload"
      :accept="props.accept"
      :label="props.label"
      :loading="isUploading"
      :prepend-icon="props.prependIcon"
      :rules="[validateFileType]"
      show-size
    />
    <v-btn
      prepend-icon="mdi-upload"
      color="primary"
      :disabled="uploadDisabled"
      @click="upload"
    >
      Upload
    </v-btn>
  </v-sheet>
</template>

<script lang="ts" setup>
import { type Ref, ref } from 'vue'
import { useBackendStore } from '@/stores/backend'
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const store = useBackendStore()

const props = defineProps<{
  accept: string
  label: string
  hint: string
  mimeType: Set<string>
  uploadUrl: string
  prependIcon: string
}>();
const isUploading: Ref<boolean> = ref(false)
const showChannelUploadSnackbar = ref(false)
const channelUploadResponse = ref('success')
const channelUploadMessage: Ref<string|null> = ref(null)

const filesToUpload: Ref<File|null> = ref(null)

const uploadDisabled: Ref<boolean> = ref(false)
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function upload() {
  isUploading.value = true
  console.log(filesToUpload.value)
  if (filesToUpload.value) {
      const [result, message] = await store.uploadFile(props.uploadUrl, filesToUpload.value)
      if (result) {
        filesToUpload.value = null
        channelUploadResponse.value = "success"
        channelUploadMessage.value = t('actions.uploadSuccessful')
      } else {
        channelUploadResponse.value = "error"
        channelUploadMessage.value = message
      }
      showChannelUploadSnackbar.value = true
  }
  isUploading.value = false
}

async function validateFileType() {
  if (filesToUpload.value == null || !props.mimeType.has(filesToUpload.value?.type)) {
    uploadDisabled.value = true
    return false
  } else {
    uploadDisabled.value = false
    return true
  }
}
</script>

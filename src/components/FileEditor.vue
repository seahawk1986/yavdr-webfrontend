<template>
  <v-card>
    <v-card-title>{{ t('category.editor', {what: props.fileconfig.filename}) }}</v-card-title>
    <v-card-text>
      <v-textarea
        v-model="editableFileContent"
        autofocus
        auto-grow
        style="max-height: 100%"
      />
    </v-card-text>
    <v-card-actions>
      <v-file-input
        v-model="fileToUpload"
        accept="*.conf"
        :label="t('actions.uploadSth', {what: props.fileconfig.filename})"
        :loading="isUploading"
        prepend-icon="mdi-upload"
        :rules="[validateFileType]"
        show-size
        tile
        variant="solo"
        width="20%"
        @update:model-value="uploadFile"
      />
      <v-btn
        color="red"
        prepend-icon="mdi-cancel"
        variant="tonal"
        @click="emit('abort')"
      >
        {{ t('actions.cancel') }}
      </v-btn>
      <v-btn
        color="green"
        prepend-icon="mdi-floppy"
        variant="tonal"
        @click="saveFilecontent(editableFileContent, props.fileconfig)"
      >
        {{ t('actions.save') }}
      </v-btn>
      <v-btn
        color="secondary"
        prepend-icon="mdi-download"
        variant="tonal"
        @click="createDownloadFile"
      >
        {{ t('actions.download') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import type { configFileInterface } from '@/components/FileEditor/interfaces';
import { downloadBlob } from '@/services/download';
import { useI18n } from 'vue-i18n';
import { useBackendStore } from '@/stores/backend';
import type { AxiosResponse } from 'axios';

const backend = useBackendStore()

const { t } = useI18n()

const editableFileContent: Ref<string> = ref('')

const props = defineProps<{
  fileconfig: configFileInterface
}>();

const emit = defineEmits<{
  (e: 'abort'): void
  (e: 'saved'): void
}>()

function createDownloadFile() {
  const blob = new Blob([editableFileContent.value], {type: "text/plain"})
  downloadBlob(blob, props.fileconfig.filename)
}

async function loadFileContent(config: configFileInterface) {
  try {
    const response: AxiosResponse = await backend.getRequest(
      `${config.url}?filename=${encodeURIComponent(config.filename)}`
    )
    return response.data
  } catch (error) {
    console.error(error)
  }
  return ""
}

onMounted(async () => {
    editableFileContent.value = await loadFileContent(props.fileconfig)
})

const isUploading: Ref<boolean> = ref(false)
const uploadDisabled: Ref<boolean> = ref(false)
const fileToUpload: Ref<File|null> = ref(null)

async function saveFilecontent(content: string, config: configFileInterface) {
  console.log("save file", config.filename, ": ", content)
  const blob = new Blob([content], {type: "text/plain"})
  const file = new File([blob], config.filename);
  const r = await backend.uploadFile(encodeURI(`${config.url}/${config.filename}`), file)
  console.log("file upload:", r)
  if (r) {
    emit('saved')
  }
}

async function uploadFile() {
  isUploading.value = true
  if (fileToUpload.value) {
    editableFileContent.value = await fileToUpload.value?.text()
  }
  isUploading.value = false
}

async function validateFileType() {
  if (fileToUpload.value == null || fileToUpload.value?.type == 'text/plain') {
    uploadDisabled.value = true
    return false
  } else {
    uploadDisabled.value = false
    return true
  }
}

</script>
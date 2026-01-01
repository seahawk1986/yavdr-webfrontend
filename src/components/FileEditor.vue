<template>
  <v-card
    class="d-flex flex-column fill-height"
  >
    <div class="d-flex justify-center border-b">
      <v-card-title style="width: 100%; max-width: 1440px;">
        <v-toolbar class="bg-surface">
          <v-icon-btn
            v-tooltip="t('actions.close')"
            class="mb-4"
            color="red"
            icon="mdi-close"
            variant="tonal"
            @click="emit('abort')"
          />
          <v-toolbar-title>
            {{
              t("category.editor", { what: props.fileconfig.filename })
            }}
          </v-toolbar-title>

          <v-toolbar-items class="justify-center ga-2">
            <v-file-input
              v-if="!mobile"
              v-model="fileToUpload"
              v-tooltip="t('actions.uploadSth', { what: props.fileconfig.filename })"
              :aria-label="t('actions.uploadSth', { what: props.fileconfig.filename })"
              accept="text/plain"
              filter-by-type="text/plain"
              :label="t('actions.uploadSth', { what: props.fileconfig.filename })"
              :loading="isUploading"
              prepend-icon="mdi-file-upload"
              :rules="[validateFileType]"
              show-size
              tile
              min-width="400px"
              :hide-input="mobile"

              variant="outlined"
              density="compact"
              @update:model-value="uploadFile"
            />
            <v-icon-btn
              v-else
              v-tooltip="t('actions.uploadSth', { what: props.fileconfig.filename })"
              :aria-label="t('actions.uploadSth', { what: props.fileconfig.filename })"
              icon="mdi-file-upload"
              color="primary"
              variant="tonal"
              @click="triggerPicker"
            />

            <input
              ref="hiddenInput"
              type="file"
              accept="text/plain"
              style="display: none"
              @change="onFileChange"
            >
            <v-divider
              vertical
              thickness="5px"
              opacity="0"
            />
            <v-icon-btn
              v-tooltip="t('actions.downloadSth', {what: props.fileconfig.filename})"
              :aria-label="t('actions.downloadSth', {what: props.fileconfig.filename})"
              color="secondary"
              icon="mdi-download"
              variant="tonal"
              :loading="isUploading"
              @click="createDownloadFile"
            />
          </v-toolbar-items>
          <v-spacer
            horizontal
            opacity="0%"
            size="5px"
          />
          <v-icon-btn
            v-tooltip="t('actions.save')"
            class="mb-4"
            :loading="isSaving"
            color="green"
            icon="mdi-floppy"
            variant="tonal"
            @click="saveFilecontent(editableFileContent, props.fileconfig)"
          />
        </v-toolbar>
      </v-card-title>
    </div>
    <v-card-text class="pa-0  d-flex justify-center">
      <v-textarea
        v-model="editableFileContent"
        :autofocus="false"
        width="100%"
        height="100%"
        class="overflow-auto pa-n4 text-no-wrap"
        style="font-family: monospace;"
        max-width="1440"
        spellcheck="false"
        density="compact"
        variant="solo"
        wrap="off"
        :hide-details="true"
        no-resize
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import type { configFileInterface } from "@/components/FileEditor/interfaces";
import { downloadBlob } from "@/services/download";
import { useI18n } from "vue-i18n";
import { useBackendStore } from "@/stores/backend";
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()


const backend = useBackendStore();

const { t } = useI18n();

const editableFileContent: Ref<string> = ref("");
const isSaving: Ref<boolean> = ref(false)

const props = defineProps<{
  fileconfig: configFileInterface;
}>();

const emit = defineEmits<{
  (e: "abort"): void;
  (e: "saved"): void;
}>();

function createDownloadFile() {
  const blob = new Blob([editableFileContent.value], { type: "text/plain" });
  downloadBlob(blob, props.fileconfig.filename);
}

async function loadFileContent(config: configFileInterface) {
  try {
    const response = await backend.getRequest(
      `${config.url}?filename=${encodeURIComponent(config.filename)}`
    );
    if (response?.data) editableFileContent.value = response.data;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await loadFileContent(props.fileconfig);
});

const isUploading: Ref<boolean> = ref(false);
const uploadDisabled: Ref<boolean> = ref(false);
const fileToUpload: Ref<File | undefined > = ref(undefined);

async function saveFilecontent(content: string, config: configFileInterface) {
  isSaving.value = true
  console.log("save file", config.filename, ": ", content);
  const blob = new Blob([content], { type: "text/plain" });
  const file = new File([blob], config.filename);
  const r = await backend.uploadFileWithStreamingResponseTC(
    `${encodeURI(`${config.url}/${config.filename}`)}`,
    file, (data) => {console.log(data)},
  );
  console.log("file upload:", r);
  if (r) {
    isSaving.value = false
    emit("saved");
  }
}

const hiddenInput = ref<HTMLInputElement | null>(null)
// Trigger the hidden input picker (Mobile)
const triggerPicker = () => hiddenInput.value?.click()

async function uploadFile() {
  isUploading.value = true;
  if (fileToUpload.value) {
    editableFileContent.value = await fileToUpload.value?.text();
    fileToUpload.value = undefined
  }
  isUploading.value = false;
}

// this is for the native input form used on mobile platforms
const onFileChange = async (e: Event) => {
  isUploading.value = true;
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    editableFileContent.value = await file.text()
    target.value = '' // Reset so the same file can be selected again
  }
  isUploading.value = false;
}

async function validateFileType() {
  if (fileToUpload.value == null || fileToUpload.value?.type == "text/plain") {
    uploadDisabled.value = true;
    return false;
  } else {
    uploadDisabled.value = false;
    return true;
  }
}
</script>

<template>
  <v-sheet
    class="d-flex flex-column"
  >
    <v-card>
      <v-card-title>Update Packages</v-card-title>
      <v-card-text>
        <v-btn
          variant="elevated"
          class="ma-2"
          :text="t('category.all')"
          :loading="allLoadingState"
          @click="updateAll"
        />
        <v-btn
          variant="elevated"
          class="ma-2"
          :text="t('category.debian_packages')"
          :loading="debianLoadingState"
          @click="updateDebian"
        />
        <v-btn
          variant="elevated"
          class="ma-2"
          :text="t('category.snap packages')"
          :loading="snapLoadingState"
          @click="updateSnaps"
        />
        <v-btn
          variant="elevated"
          class="ma-2"
          :text="t('category.flatpak_packages')"
          :loading="flatpakLoadingState"
          @click="updateFlatpak"
        />
      </v-card-text>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const backend = useBackendStore()

const allLoadingState: Ref<boolean> = ref(false)
const debianLoadingState: Ref<boolean> = ref(false)
const snapLoadingState: Ref<boolean> = ref(false)
const flatpakLoadingState: Ref<boolean> = ref(false)

// const sleep = async (ms: number): Promise<void> => {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

async function updateAll() {
  await update("all", allLoadingState)
}

async function updateDebian() {
  await update("debian", debianLoadingState)
}
async function updateSnaps() {
  await update("snap", snapLoadingState)
}
async function updateFlatpak() {
  await update("flatpak", flatpakLoadingState)
}

async function update(what: string, stateHandler: Ref<boolean>) {
  stateHandler.value = true
  try {
    const success = await backend.postRequest(`/system/update/${what}`, {})
    console.log("update result:", success.data)

  } catch(error) {
    console.log(`Updating ${what} failed: ${error}`)
  } finally {
    stateHandler.value = false
  }

}
</script>

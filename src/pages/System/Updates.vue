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
          text="All"
          :loading="allLoadingState"
          @click="updateAll"
        />
        <v-btn
          variant="elevated"
          class="ma-2"
          text="Debian Packages"
          :loading="debianLoadingState"
          @click="updateDebian"
        />
        <v-btn
          variant="elevated"
          class="ma-2"
          text="Snap Packages"
          :loading="snapLoadingState"
          @click="updateSnaps"
        />
        <v-btn
          variant="elevated"
          class="ma-2"
          text="Flatpak Packages"
          :loading="flatpakLoadingState"
          @click="updateFlatpak"
        />
      </v-card-text>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
const backend = useBackendStore()

const allLoadingState: Ref<boolean> = ref(false)
const debianLoadingState: Ref<boolean> = ref(false)
const snapLoadingState: Ref<boolean> = ref(false)
const flatpakLoadingState: Ref<boolean> = ref(false)

const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateAll() {
  allLoadingState.value = true
  await sleep(500)
  try {
    const success = await backend.postRequest('/system/update/all', {})
    console.log("update result", success)
  } catch (error) {
    console.log(error)
  } finally {
    allLoadingState.value = false
  }

}
async function updateDebian() {
  debianLoadingState.value = true
  await sleep(5000)
  const success = await backend.postRequest('/system/update/debian', {})
  console.log("update result", success)

  debianLoadingState.value = false
}
async function updateSnaps() {
  snapLoadingState.value = true
  await sleep(5000)
  const success = await backend.postRequest('/system/update/snap', {})
  console.log("update result", success.data)

  snapLoadingState.value = false
}
async function updateFlatpak() {
  flatpakLoadingState.value = true
  await sleep(5000)
  const success = await backend.postRequest('/system/update/flatpak', {})
  console.log("update result", success)

  flatpakLoadingState.value = false
}
</script>

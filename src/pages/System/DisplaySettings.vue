<script setup lang="ts">
// TODO: use Backend to get monitor information
// TODO: choose defaults and switch secondary display
import { ref, type Ref, watch } from 'vue'

interface DisplayDataInterface {
  [key: string]: { modes: { [key: string]: Array<number> }; preferred_mode: string }
}

const displays: Ref<DisplayDataInterface> = ref({
  'DP-1': { modes: { '1920x1080': [24, 50, 60], '1280x720': [50, 60] }, preferred_mode: '' },
  'HDMI-A-2': { modes: { '1280x1024': [60] }, preferred_mode: '' }
})

const primaryDisplay: Ref<string> = ref(Object.keys(displays.value)[0])
const primaryDisplayResolution = ref(Object.keys(displays.value[primaryDisplay.value].modes)[0])
const primaryDisplayRefreshRate = ref(
  displays.value[primaryDisplay.value].modes[primaryDisplayResolution.value][0].toString()
)

const secondaryDisplay: Ref<string> = ref('')
const secondaryDisplayResolution: Ref<string> = ref('')
const secondaryDisplayRefreshRate: Ref<string> = ref('')

watch([primaryDisplay], () => {
  primaryDisplayResolution.value = Object.keys(displays.value[primaryDisplay.value].modes)[0]
})
watch([primaryDisplayResolution], () => {
  primaryDisplayRefreshRate.value =
    displays.value[primaryDisplay.value].modes[primaryDisplayResolution.value][0].toString()
})
</script>

<template>
  <v-card>
    <v-card-title>Display Configuration</v-card-title>
    <v-card-text>
      <v-sheet class="d-flex">
        <v-sheet
          class="flex-1-0 ma-2 pa-2"
          min-width="15ch"
        >
          <v-select
            v-model="primaryDisplay"
            label="Primary Display"
            :items="Object.keys(displays)"
          />
        </v-sheet>
        <v-sheet class="flex-2-0 ma-2 pa-2">
          <v-select
            v-model="primaryDisplayResolution"
            label="Primary Display Resolution"
            :items="Object.keys(displays[primaryDisplay].modes)"
          />
          <v-select
            v-model="primaryDisplayRefreshRate"
            label="Primary Display Refresh Rate"
            :items="displays[primaryDisplay].modes[primaryDisplayResolution].map(String)"
          />
        </v-sheet>
      </v-sheet>
      <v-sheet class="d-flex">
        <v-sheet class="flex-1-0 ma-2 pa-2">
          <v-select
            v-model="secondaryDisplay"
            label="Secondary Display"
            :items="Object.keys(displays)"
          />
        </v-sheet>
        <v-sheet class="flex-1-0 ma-2 pa-2">
          <v-select
            v-model="secondaryDisplayResolution"
            label="Secondary Display Resolution"
            :items="Object.keys(displays[primaryDisplay].modes)"
          />
          <v-select
            v-model="secondaryDisplayRefreshRate"
            label="Secondary Display Refresh Rate"
            :items="displays[primaryDisplay].modes[primaryDisplayResolution].map(String)"
          />
        </v-sheet>
      </v-sheet>

      {{ primaryDisplay }}
    </v-card-text>
  </v-card>
</template>

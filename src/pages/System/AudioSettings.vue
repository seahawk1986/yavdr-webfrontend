<script setup lang="ts">
import { onMounted } from 'vue'
import { useBackendStore } from '@/stores/backend'

const store = useBackendStore()

onMounted(() => {
  store.listPulseaudioSinks()
})

function submit() {
  console.log('new sink selected:', store.listedPulseSinks.default_sink)
  store.postRequest('/audio/set_default_pulseaudio_sink', {
    sink: store.listedPulseSinks.default_sink,
    scopes: []
  })
}
function refresh() {
  store.listPulseaudioSinks()
}
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>Audio Output</v-card-title>
      <v-card-text v-if="store.pulseErrorMessage === null">
        <v-radio-group
          v-model="store.listedPulseSinks.default_sink"
          @update:model-value="submit"
        >
          <template
            v-for="device in store.listedPulseSinks.pulse_devices"
            :key="device.device"
          >
            <v-radio
              :label="device.device_name"
              :value="device.device"
            />
          </template>
        </v-radio-group>
        Selected: {{ store.listedPulseSinks.default_sink }}
      </v-card-text>
      <v-card-text v-else>
        <h2>
          {{ store.pulseErrorMessage }}
        </h2>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="refresh"
        >
          refresh
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

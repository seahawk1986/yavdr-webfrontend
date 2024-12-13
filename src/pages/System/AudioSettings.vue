<script setup lang="ts">
import { onMounted } from 'vue'
import { useBackendStore } from '@/stores/backend'

const store = useBackendStore()

interface VdrAudioChannelInterface {
  number: number,
  desc: string,
  selected: boolean,
}

const VdrAudioChannels: Ref<Array<VdrAudioChannelInterface>> = ref([])
const selectedVdrAudioChannel: Ref<number> = ref(1)

onMounted(async () => {
  store.listPulseaudioSinks()
  await refreshVDRAudioChannels()
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

async function refreshVDRAudioChannels() {
  try {

    const data = await store.getRequest('/vdr/audiochannel')
    if (data) {
      VdrAudioChannels.value = data
      selectedVdrAudioChannel.value = data.find((channel: VdrAudioChannelInterface) => channel.selected).number
    }
  } catch (error) {
    console.error("could not list VDR' audio channels", error)
  }
}

async function setVDRAudioChannel() {
  const channel = selectedVdrAudioChannel.value
  console.log("set audio channel to", channel)
  store.postRequest(`/vdr/audiochannel?channel=${channel}`, {
    scopes: []
  })
}
</script>

<template>
  <v-sheet
    class="fill-height"
  >
    <v-row no-gutters>
      <v-col
        col="12"
        md="6"
      >
        <v-card
          class="ma-2 pa-2"
        >
          <v-card-title>Audio Output</v-card-title>
          <v-card-text
            v-if="store.pulseErrorMessage === null"
          >
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
            <!-- Selected: {{ store.listedPulseSinks.default_sink }} -->
          </v-card-text>
          <v-card-text
            v-else
          >
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
      </v-col>
      <v-col>
        <v-card
          class="ma-2 pa-2"
        >
          <v-card-title>VDR Audio Channel Selection</v-card-title>
          <v-card-text>
            <v-radio-group
              v-model="selectedVdrAudioChannel"
              @update:model-value="setVDRAudioChannel"
            >
              <template
                v-for="channel in VdrAudioChannels"
                :key="channel.number"
              >
                <v-radio
                  :label="channel.desc"
                  :value="channel.number"
                />
              </template>
            </v-radio-group>
            <!-- {{ selectedVdrAudioChannel }} -->
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              @click="refreshVDRAudioChannels"
            >
              refresh
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-sheet>
</template>

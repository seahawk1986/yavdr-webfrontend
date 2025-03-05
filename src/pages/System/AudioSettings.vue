<script setup lang="ts">
import { onMounted } from 'vue'
import { useBackendStore } from '@/stores/backend'
import { useAudioStore } from '@/stores/audio'
import { useI18n } from 'vue-i18n'

const backend = useBackendStore()
const audio = useAudioStore()
const {t} = useI18n()

interface VdrAudioChannelInterface {
  number: number,
  desc: string,
  selected: boolean,
}

const VdrAudioChannels: Ref<Array<VdrAudioChannelInterface>> = ref([])
const selectedVdrAudioChannel: Ref<number> = ref(1)

onMounted(async () => {
  audio.listPulseaudioSinks()
  await refreshVDRAudioChannels()
})

function submit() {
  console.log('new sink selected:', audio.listedPulseSinks.default_sink)
  backend.postRequest('/audio/set_default_pulseaudio_sink', {
    sink: audio.listedPulseSinks.default_sink,
    scopes: []
  })
}
function refresh() {
  audio.listPulseaudioSinks()
}

async function refreshVDRAudioChannels() {
  try {

    const request = await backend.getRequest('/vdr/audiochannel')
    if (request) {
      VdrAudioChannels.value = request.data
      selectedVdrAudioChannel.value = request.data.find((channel: VdrAudioChannelInterface) => channel.selected).number
    }
  } catch (error) {
    console.error("could not list VDR' audio channels", error)
  }
}

async function setVDRAudioChannel() {
  const channel = selectedVdrAudioChannel.value
  console.log("set audio channel to", channel)
  backend.postRequest(`/vdr/audiochannel?channel=${channel}`, {
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
        class="mx-auto"
        col="12"
        md="6"
      >
        <v-card
          class="ma-2 pa-2"
          prepend-icon="mdi-speaker-multiple"
          :title="t('audio.audioOutput') + ' (PulseAudio)'"
        >
          <v-card-text
            v-if="audio.pulseErrorMessage === null"
          >
            <v-radio-group
              v-model="audio.listedPulseSinks.default_sink"
              @update:model-value="submit"
            >
              <template
                v-for="device in audio.listedPulseSinks.pulse_devices"
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
              {{ audio.pulseErrorMessage }}
            </h2>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              @click="refresh"
            >
              {{ t('actions.reload') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col>
        <v-card
          class="ma-2 pa-2"
          prepend-icon="mdi-soundbar"
          :title="t('audio.vdrAudioChannel')"
        >
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
              {{ t('actions.reload') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-sheet>
</template>

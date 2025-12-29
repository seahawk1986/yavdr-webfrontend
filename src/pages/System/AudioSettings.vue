<template>
  <v-container
    class="ma-0 pa-2"
  >
    <v-sheet
      class="fill-height"
    >
      <v-row no-gutters>
        <!-- <v-col
        class="mx-auto"
        col="12"
        md="6"
      >
        <v-card
          class="ma-2 pa-2"
          prepend-icon="mdi-speaker-multiple"
        >
          <template #title>
            Pulseaudio Profiles
          </template>
          <template #text>
            <v-radio-group
              v-for="card in audio.listedPulseProfiles"
              :key="card.card_name"
              v-model="card.profile_active"
              :label="card.card_description"
              @update:model-value="audio.setPulseProfile(card.card_name, card.profile_active); refresh()"
            >
              <v-radio
                v-for="profile in card.profiles"
                :key="profile.profile_name"
                :value="profile.profile_name"
                :label="profile.profile_description"
              />
            </v-radio-group>
          </template>
          <template #actions>
            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              @click="refresh"
            >
              {{ t('actions.reload') }}
            </v-btn>
          </template>
        </v-card>
      </v-col> -->
        <!-- <ul>
        <li>
          {{ audio.listedPulseSinks }}
        </li>
        <li>
          {{ cardForCurrentSink }}
        </li>
      </ul> -->
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
                hide-details="auto"
                :label="t('audio.sink')"
                @update:model-value="setNewDefaultSink"
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

              <v-radio-group
                v-if="cardForCurrentSink"
                v-model="cardForCurrentSink.profile_active"
                hide-details="auto"
                :label="t('audio.profile')"
                @update:model-value="setProfile"
              >
                <v-radio
                  v-for="profile in profilesForCurrentSink"
                  :key="profile.profile_name"
                  :label="profile.profile_description"
                  :value="profile.profile_name"
                />
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
                :error="(VDRAudioSelectionErrorMessage && VDRAudioSelectionErrorMessage.length > 0) || false"
                :error-messages="VDRAudioSelectionErrorMessage"
                hide-details="auto"
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
  </v-container>
</template>


<script setup lang="ts">
import { onMounted } from 'vue'
import { useBackendStore } from '@/stores/backend'
import { useAudioStore, type PulseProfileInterface } from '@/stores/audio'
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
// const VDRAudioSelectionError: Ref<boolean> = ref(false)
const VDRAudioSelectionErrorMessage: Ref<string|undefined> = ref()

onMounted(async () => {
  await Promise.allSettled([
    audio.listPulseaudioSinks(),
    audio.listPulseaudioProfiles(),
    refreshVDRAudioChannels(),
  ])
})

const cardForCurrentSink = computed(() => {
  const sink = audio.listedPulseSinks.pulse_devices.find((sink) => sink.device === audio.listedPulseSinks.default_sink)
  if (sink) {
    return audio.listedPulseProfiles[sink.card]
  }
  return undefined
})

const profilesForCurrentSink = computed((): PulseProfileInterface[] => {
  const sink = audio.listedPulseSinks.pulse_devices.find((sink) => sink.device === audio.listedPulseSinks.default_sink)
  if (sink) {
    return audio.listedPulseProfiles[sink.card].profiles
  }
  return []
})

function setNewDefaultSink() {
  console.log('new sink selected:', audio.listedPulseSinks.default_sink)
  backend.postRequest('/audio/set_default_pulseaudio_sink', {
    sink: audio.listedPulseSinks.default_sink,
    scopes: []
  })
}

async function setProfile() {
  if (cardForCurrentSink.value) {
    const currentCard = cardForCurrentSink.value
    await audio.setPulseProfile(currentCard.card_name, cardForCurrentSink.value.profile_active)
  }
  // await refresh() # TODO: this additional refresh() call breaks the switching of the profiles - why?
}

async function refresh() {
  await audio.listPulseaudioSinks()
  await audio.listPulseaudioProfiles()
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
  // VDRAudioSelectionError.value = false
  VDRAudioSelectionErrorMessage.value = undefined
  try {
      const response = await backend.postRequest(`/vdr/audiochannel?channel_nr=${channel}`, {
        scopes: []
      })
      if (response.data) {
        // console.log("response.data: ", response.data[0])
      if (response.data[0]) {
        const data: VdrAudioChannelInterface = response.data[1]
        const newAudioChannel: number = data.number
        // console.log("setVDRAudioChannel response data:", data)
        // console.log("selected vdr audio channel:", newAudioChannel)
        selectedVdrAudioChannel.value = newAudioChannel
      } else {
        console.log("switching the audio channel failed:", response.data[1])
        throw new Error("switching the audio channel failed")
      }
    }
  }
  catch(e) {
    console.log("got an error:", e)
    // VDRAudioSelectionError.value = true
    VDRAudioSelectionErrorMessage.value = `${e}`
  }
}
</script>


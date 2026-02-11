<template>
  <v-sheet
    class="overflow-y-auto pa-4 d-flex flex-wrap align-self-center justify-space-between"
    color="background"
  >
    <v-card
      prepend-icon="mdi-speaker-multiple"
      min-width="350px"
      class="pa-2 ma-2"
      :title="t('audio.audioOutput') + ' (Pipewire)'"
    >
      <v-card-text
        v-if="audio.pulseErrorMessage === null"
      >
        <v-radio-group
          v-model="audio.listedPulseSinks.default_sink"
          hide-details="auto"
          class="mb-6"
          :label="t('audio.sink')"
          @update:model-value="setNewDefaultSink"
        >
          <v-radio
            v-for="device in audio.listedPulseSinks.pulse_devices"
            :key="device.device"
            :label="device.device_name"
            :value="device.device"
          />
        </v-radio-group>

        <v-radio-group
          v-if="cardForCurrentSink"
          v-model="cardForCurrentSink.profile_active"
          hide-details="auto"
          :label="t('audio.profile')"
          @update:model-value="setProfile"
        >
          <v-radio
            v-for="profile in cardForCurrentSink?.profiles "
            :key="profile.profile_name"
            :label="profile.profile_description"
            :value="profile.profile_name"
          />
        </v-radio-group>
      </v-card-text>
      <v-card-text
        v-else
      >
        <h2>
          {{ audio.pulseErrorMessage }}
        </h2>
      </v-card-text>
      <!-- <v-divider /> -->

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

    <v-card
      class="pa-2 ma-2"
      prepend-icon="mdi-soundbar"
      :title="t('audio.vdrAudioChannel')"
      min-width="350px"
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

      <!-- <v-divider /> -->

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
  </v-sheet>
</template>

<!-- TODO: choosing the profile for a output doesn't work with pipewire -->


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
    // console.log("sink:", sink.device.split('.', 3))
    return audio.listedPulseProfiles.find ((profile) => sink.card_name === profile.card_name)
  } else {
    return undefined
  }})

function setNewDefaultSink() {
  if (cardForCurrentSink.value) {
    console.log('new sink selected:', audio.listedPulseSinks.default_sink, cardForCurrentSink.value?.card_name)
    backend.postRequest('/audio/set_default_pulseaudio_sink', {
        default_sink: audio.listedPulseSinks.default_sink,
        card_name: cardForCurrentSink.value.card_name ? cardForCurrentSink.value.card_name : "",
      scopes: []
    })
  } else {
    console.log(
      "Can't set default pulseaudio sink - cardForCurrentSink is undefined, sink was",
      audio.listedPulseSinks.default_sink
    )
  }
}

async function setProfile() {
  if (cardForCurrentSink.value) {
    const currentCard = cardForCurrentSink.value
    console.log("setProfile:", currentCard.card_name, cardForCurrentSink.value.profile_active)
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


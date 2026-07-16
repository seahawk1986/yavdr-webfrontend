<template>
  <v-card
    class="fill-height overflow-y-auto d-flex flex-wrap"
    color="background"
  >
    <v-card
      v-if="currentSink"
      title="System Volume"
      class="pa-2 ma-2 flex-grow-1"
    >
      <v-slider
        v-model="currentSink.volume_values[0]"
        :min="0"
        :max="allowSystemVolumeOverride ? 1.53 : 1.0"
        thumb-label
        prepend-icon="mdi-volume-low"
        append-icon="mdi-volume-high"
        @update:model-value="setSystemVolume(currentSink.device, $event)"
        @end="audio.listPulseaudioSinks()"
      >
        <template #thumb-label="{ modelValue }">
          {{ Math.round(modelValue * 100) }}%
        </template>
        <template #append>
          <div class="d-flex align-center h-100">
            <!-- <v-checkbox
              v-model="allowSystemVolumeOverride"
              label="Overdrive"
              hide-details
              @update="
                if (currentSink.volume_values[0]) {
                  setSystemVolume(
                    currentSink.device,
                    Math.min(1.0, currentSink.volume_values[0]),
                  );
                }
                audio.listPulseaudioSinks();
              "
            ></v-checkbox> -->
            <v-icon icon="mdi-volume-high" @click.stop=""></v-icon>
            <v-icon-btn
              icon="mdi-reload"
              @click="audio.listPulseaudioSinks"
            ></v-icon-btn>
          </div>
        </template>
      </v-slider>
    </v-card>

    <v-card title="VDR Volume" min-width="48vw" class="pa-2 ma-2 flex-grow-1">
      <v-slider
        v-model="vdr.currentVolume"
        width="100%"
        :min="0"
        :max="255"
        :step="5"
        :color="vdr.isMuted ? 'red' : 'primary'"
        thumb-label
        prepend-icon="mdi-volume-low"
        append-icon="mdi-volume-high"
        @update:model-value="vdr.setVolume($event, false)"
        @end="audio.listPulseaudioSinks()"
      >
        <template #append>
          <div class="d-flex align-center h-100">
            <v-icon-btn
              :icon="vdr.isMuted ? 'mdi-volume-off' : 'mdi-volume-high'"
              :color="vdr.isMuted ? 'red' : 'primary'"
              @click="vdr.setVolume(vdr.currentVolume, true)"
            ></v-icon-btn>
            <v-icon-btn icon="mdi-reload"></v-icon-btn>
          </div>
        </template>
      </v-slider>
    </v-card>

    <v-card
      prepend-icon="mdi-speaker-multiple"
      min-width="48vw"
      class="pa-2 ma-2"
      :title="t('audio.audioOutput') + ' (Pipewire)'"
    >
      <v-card-text v-if="audio.pulseErrorMessage === null">
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
            :value="device.device"
            :label="device.device_name"
          >
          </v-radio>
        </v-radio-group>

        <v-radio-group
          v-if="cardForCurrentSink"
          v-model="cardForCurrentSink.profile_active"
          hide-details="auto"
          :label="t('audio.profile')"
          @update:model-value="setProfile"
        >
          <v-radio
            v-for="profile in cardForCurrentSink?.profiles"
            :key="profile.profile_name"
            :value="profile.profile_name"
            :label="profile.profile_description"
          />
        </v-radio-group>
      </v-card-text>
      <v-card-text v-else>
        <h2>
          {{ audio.pulseErrorMessage }}
        </h2>
      </v-card-text>
      <!-- <v-divider /> -->

      <v-card-actions>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="refresh">
          {{ t("actions.reload") }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card
      class="pa-2 ma-2"
      prepend-icon="mdi-soundbar"
      :title="t('audio.vdrAudioChannel')"
      min-width="40vw"
    >
      <v-card-text>
        <v-radio-group
          v-model="selectedVdrAudioChannel"
          :error="
            (VDRAudioSelectionErrorMessage &&
              VDRAudioSelectionErrorMessage.length > 0) ||
            false
          "
          :error-messages="VDRAudioSelectionErrorMessage"
          hide-details="auto"
          @update:model-value="setVDRAudioChannel"
        >
          <template v-for="channel in VdrAudioChannels" :key="channel.number">
            <v-radio :label="channel.desc" :value="channel.number" />
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
          {{ t("actions.reload") }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card
      title="Alsa Mixers"
      class="pa-2 ma-2 flex-grow-1"
      prepend-icon="mdi-tune"
    >
      <v-card-text>
        <!-- Alsa data: '{{ audio.listedAlsaMixers }}' -->
        <v-list>
          <template
            v-for="mixer in audio.listedAlsaMixers"
            :key="mixer.card_idx + ':' + mixer.name"
          >
            <v-list-item>
              <template #title>
                <v-icon-btn
                  variant="flat"
                  :color="mixer.is_muted ? 'red' : 'primary'"
                  :icon="
                    mixer.is_muted ? 'mdi-volume-off' : 'mdi-volume-source'
                  "
                  density="compact"
                  size="small"
                  rounded="0"
                  @click="
                    audio.setAlsaMixer({
                      mixer_name: mixer.name,
                      card_idx: mixer.card_idx,
                      volume: mixer.volume,
                      muted: !mixer.is_muted,
                    })
                  "
                >
                </v-icon-btn>
                {{ mixer.name }} (Card {{ mixer.card_idx }})
              </template>
              <v-slider
                v-model="mixer.volume"
                width="100%"
                :min="mixer.volume_range[0]"
                :max="mixer.volume_range[1]"
                step="1"
                prepend-icon="mdi-volume-low"
                append-icon="mdi-volume-high"
                thumb-label
                @click:prepend="
                  audio.setAlsaMixer({
                    mixer_name: mixer.name,
                    card_idx: mixer.card_idx,
                    volume: mixer.volume,
                    muted: !mixer.is_muted,
                  })
                "
                @update:model-value="
                  audio.setAlsaMixer({
                    mixer_name: mixer.name,
                    card_idx: mixer.card_idx,
                    volume: mixer.volume,
                    muted: mixer.is_muted,
                  })
                "
              ></v-slider>
            </v-list-item>
          </template>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="audio.listAlsaMixers"
        >
          {{ t("actions.reload") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-card>
</template>

<!-- TODO: choosing the profile for a output doesn't work with pipewire -->

<script setup lang="ts">
import { onMounted } from "vue";
import { useBackendStore } from "@/stores/backend";
import { useAudioStore } from "@/stores/audio";
import { useVDRStore } from "@/stores/vdr";
import { useI18n } from "vue-i18n";

const backend = useBackendStore();
const audio = useAudioStore();
const vdr = useVDRStore();
const { t } = useI18n();

interface VdrAudioChannelInterface {
  number: number;
  desc: string;
  selected: boolean;
}

const VdrAudioChannels: Ref<Array<VdrAudioChannelInterface>> = ref([]);
const selectedVdrAudioChannel: Ref<number> = ref(1);
// const VDRAudioSelectionError: Ref<boolean> = ref(false)
const VDRAudioSelectionErrorMessage: Ref<string | undefined> = ref();

const allowSystemVolumeOverride: Ref<boolean> = ref(true);

onMounted(async () => {
  await Promise.allSettled([
    audio.listPulseaudioSinks(),
    audio.listPulseaudioProfiles(),
    audio.listAlsaMixers(),
    refreshVDRAudioChannels(),
    vdr.getVolume(),
  ]);
});

const currentSink = computed(() => {
  const sink = audio.listedPulseSinks.pulse_devices.find(
    (sink) => sink.device === audio.listedPulseSinks.default_sink,
  );
  if (sink) {
    return sink;
  } else {
    return null;
  }
});

const cardForCurrentSink = computed(() => {
  const sink = audio.listedPulseSinks.pulse_devices.find(
    (sink) => sink.device === audio.listedPulseSinks.default_sink,
  );
  if (sink) {
    // console.log("sink:", sink.device.split('.', 3))
    return audio.listedPulseProfiles.find(
      (profile) => sink.card_name === profile.card_name,
    );
  } else {
    return undefined;
  }
});

function setNewDefaultSink() {
  if (cardForCurrentSink.value) {
    console.log(
      "new sink selected:",
      audio.listedPulseSinks.default_sink,
      cardForCurrentSink.value?.card_name,
    );
    backend.postRequest("/audio/set_default_pulseaudio_sink", {
      default_sink: audio.listedPulseSinks.default_sink,
      card_name: cardForCurrentSink.value.card_name
        ? cardForCurrentSink.value.card_name
        : "",
      scopes: [],
    });
  } else {
    console.log(
      "Can't set default pulseaudio sink - cardForCurrentSink is undefined, sink was",
      audio.listedPulseSinks.default_sink,
    );
  }
}

async function setProfile() {
  if (cardForCurrentSink.value) {
    const currentCard = cardForCurrentSink.value;
    console.log(
      "setProfile:",
      currentCard.card_name,
      cardForCurrentSink.value.profile_active,
    );
    await audio.setPulseProfile(
      currentCard.card_name,
      cardForCurrentSink.value.profile_active,
    );
  }
  // await refresh() # TODO: this additional refresh() call breaks the switching of the profiles - why?
}

async function setSystemVolume(device: string, volume: number) {
  await audio.setSystemVolume(device, volume);
}

async function refresh() {
  await audio.listPulseaudioSinks();
  await audio.listPulseaudioProfiles();
  await audio.listAlsaMixers();
}

async function refreshVDRAudioChannels() {
  try {
    const request = await backend.getRequest("/vdr/audiochannel");
    if (request) {
      VdrAudioChannels.value = request.data;
      selectedVdrAudioChannel.value = request.data.find(
        (channel: VdrAudioChannelInterface) => channel.selected,
      ).number;
    }
  } catch (error) {
    console.error("could not list VDR' audio channels", error);
  }
}

async function setVDRAudioChannel() {
  const channel = selectedVdrAudioChannel.value;
  console.log("set audio channel to", channel);
  // VDRAudioSelectionError.value = false
  VDRAudioSelectionErrorMessage.value = undefined;
  try {
    const response = await backend.postRequest(
      `/vdr/audiochannel?channel_nr=${channel}`,
      {
        scopes: [],
      },
    );
    if (response.data) {
      // console.log("response.data: ", response.data[0])
      if (response.data[0]) {
        const data: VdrAudioChannelInterface = response.data[1];
        const newAudioChannel: number = data.number;
        // console.log("setVDRAudioChannel response data:", data)
        // console.log("selected vdr audio channel:", newAudioChannel)
        selectedVdrAudioChannel.value = newAudioChannel;
      } else {
        console.log("switching the audio channel failed:", response.data[1]);
        throw new Error("switching the audio channel failed");
      }
    }
  } catch (e) {
    console.log("got an error:", e);
    // VDRAudioSelectionError.value = true
    VDRAudioSelectionErrorMessage.value = `${e}`;
  }
}
</script>

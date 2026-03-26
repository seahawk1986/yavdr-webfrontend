export interface PulseDeviceInterface {
  device: string
  device_name: string
  index: number
  card: number
  card_name: string
  muted: boolean
  number_of_channels: number
  volume_values: Array<number>
  port_active: string
  is_default_sink: boolean
}

export interface ListedPulseSinksInterface {
  pulse_devices: Array<PulseDeviceInterface>
  default_sink: string
}
export class ListedPulseSinks implements ListedPulseSinksInterface {
  pulse_devices: PulseDeviceInterface[] = []
  default_sink: string = ''
}

export interface PulseProfileInterface {
  profile_name: string
  profile_description: string
}

export interface ListedPulseCardInterface {
  card_name: string
  card_description: string
  profiles: PulseProfileInterface[]
  profile_active: string
}

import { defineStore } from "pinia";
import { useBackendStore } from "./backend"

const backend = useBackendStore()

export const useAudioStore = defineStore("audio", () => {
  const listedPulseSinks = ref(new ListedPulseSinks())
  const listedPulseProfiles: Ref<ListedPulseCardInterface[]> = ref([])
  const pulseErrorMessage: Ref<string | null> = ref(null)

  async function listPulseaudioSinks() {
    console.log("called listPulseAudioSinks");
    backend.getRequest("audio/list_pulseaudio_sinks")
      .then((response) => {
        if (response?.status && response.status == 200 && response?.data != null) {
          listedPulseSinks.value = response.data;
          console.log("audio sinks:", response.data);
          pulseErrorMessage.value = null;
        }
      }).catch((error) => {
        console.log("listing sinks failed:", error.toJSON());
        pulseErrorMessage.value = error.toJSON().message;
      })
  }


  const defaultSink = computed(() => {
    return listedPulseSinks.value.pulse_devices.find((device: PulseDeviceInterface) => listedPulseSinks.value.default_sink == device.device)
  })

  async function listPulseaudioProfiles() {
    console.log("called listProfiles()")
    backend.getRequest("/system/audio/pulseaudio_output_profiles").then((response) => {
      if (response?.status && response.status == 200 && response?.data != null) {
        listedPulseProfiles.value = response.data
        console.log("audio profiles:", response.data)
        pulseErrorMessage.value = null

      }
    }).catch((error) => {
      console.log("listing profiles failed:", error.toJSON());
      pulseErrorMessage.value = error.toJSON().message;
    })
  }

  async function setPulseProfile(card: string, profile: string) {
    await backend.postRequest("/system/audio/pulseaudio_output_profile", { card_name: card, profile_name: profile })
  }

  async function setSystemVolume(device: string, volume: number) {
    await backend.postRequest("/system/audio/volume", { device: device, volume: volume })

  }

  return {
    listedPulseSinks,
    listedPulseProfiles,
    defaultSink,
    pulseErrorMessage,
    listPulseaudioSinks,
    listPulseaudioProfiles,
    setPulseProfile,
    setSystemVolume,
  }
})
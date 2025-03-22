interface PulseDeviceInterface {
  device: string
  device_name: string
  index: number
  muted: boolean
  number_of_channels: number
  volume_values: Array<number>
  port_active: string
  is_default_sink: boolean
}

interface ListedPulseSinksInterface {
  pulse_devices: Array<PulseDeviceInterface>
  default_sink: string
}
export class ListedPulseSinks implements ListedPulseSinksInterface {
  pulse_devices: PulseDeviceInterface[] = []
  default_sink: string = ''
}

import { defineStore } from "pinia";
import { useBackendStore } from "./backend"

const backend = useBackendStore()

export const useAudioStore = defineStore("audio", () => {
  const listedPulseSinks = ref(new ListedPulseSinks())
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

  return {
    listedPulseSinks,
    pulseErrorMessage,
    listPulseaudioSinks,
  }
})
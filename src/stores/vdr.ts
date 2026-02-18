import { defineStore } from "pinia";
import type { VDRChannel } from "./interfaces/VdrChannelInterface";
import { useBackendStore } from "./backend";
import type { VDRTimerInterface } from "./interfaces/VdrTimerInterface";
import { consoleError } from "vuetify/lib/util/console.mjs";

const backend = useBackendStore()

export const useVDRStore = defineStore("vdr", () => {
  const currentChannel: Ref<number> = ref(0);
  const vdrChannels: Ref<VDRChannel[]> = ref([])
  const isLoadingChannels: Ref<boolean> = ref(false);
  const isDeletingTimer: Ref<boolean> = ref(false);

  async function loadChannels() {
    isLoadingChannels.value = true;
    const response = await backend.getRequest("/vdr/channels_with_groups")
    if (response?.data) {
      const data: VDRChannel[] = response.data
      if (data) {
        // console.log(data)
        vdrChannels.value = data;
        isLoadingChannels.value = false;
        return data;
      } else {
        throw new Error("Loading VDR channels failed");
      }
    } else {
      return []
    }
  }

  async function saveChannels() {
    isLoadingChannels.value = true;
    const channelList = vdrChannels.value.map((element) => {
      return element.channel_string;
    });
    const result = await backend.postRequest("/vdr/channels", {
      channel_list: channelList,
    });
    console.log("sent channels.conf data:", channelList, result);
    isLoadingChannels.value = false;
  }

  const vdrTimers: Ref<Array<VDRTimerInterface>> = ref([]);
  const isLoadingTimers: Ref<boolean> = ref(false);

  async function loadTimers() {
    isLoadingTimers.value = true;
    const response = await backend.getRequest("/vdr/timers");
    if (response?.data && Array.isArray(response?.data)) {
      // console.log(data)
      vdrTimers.value = response.data;
      isLoadingTimers.value = false;
      console.log("got timers: ", response.data);
      return response.data;
    } else {
      throw new Error("Loading VDR timers failed");
    }
  }

  async function deleteTimer(timerID: number) {
    isDeletingTimer.value = true;
    const response = await backend.deleteRequest(`/vdr/timers/${timerID}`, null)
    console.log(response?.data)
    // if (response?.data) {
    //   console.log("deleted timer", timerID)
    //   return response.data
    // } else {
    //   throw new Error(`Deleting ${timerID} failed`)
    // }
    isDeletingTimer.value = false;
  }

  async function updateTimer(timer: string) {
    const response = await backend.putRequest('/vdr/timers', { timer_str: timer })
    console.log(response?.data)
  }

  const vdrRecordings: Ref<Array<VDRTimerInterface>> = ref([]);
  const isLoadingRecordings: Ref<boolean> = ref(false);

  async function loadRecordings() {
    isLoadingTimers.value = true;
    const response = await backend.getRequest("/vdr/recordings");
    if (response?.data && Array.isArray(response.data)) {
      // console.log(data)
      vdrRecordings.value = response.data;
      isLoadingRecordings.value = false;
      console.log("got recordings: ", response.data);
      return response.data;
    } else {
      throw new Error("Loading VDR recordings failed");
    }
  }

  const isLoadingEPG = ref(false);
  async function loadEPG(channelId: string) {
    try {
      isLoadingEPG.value = true;
      const response = await backend.getRequest(
        `/vdr/epg?channel_id=${encodeURIComponent(channelId)}`
      );
      if (response) {
        return response;
      }
    } finally {
      isLoadingEPG.value = false;
    }
  }

  async function playRecording(recID: number, position: number = -1) {
    console.log("play recording", recID)
    const response = await backend.postRequest('/vdr/recordings/play', { RecNum: recID, continue_replay: position })
    console.log("playRecording response:", response)
  }

  async function deleteRecording(recID: number) {
    console.log("delete recording", recID)
    const response = await backend.deleteRequest(`/vdr/recordings/${recID}`, null)
    console.log("deleteRecording response:", response)
    loadRecordings()
  }


  async function getCurrentChannel() {
    const response = await backend.getRequest('/vdr/channels/current', {})
    if (response) {
      console.log("current channel is", response.data)
      currentChannel.value = response.data[0]
      return response.data
    }
  }
  return {
    vdrChannels,
    currentChannel,
    isLoadingChannels,
    isDeletingTimer,
    getCurrentChannel,
    loadChannels,
    saveChannels,
    loadEPG,
    loadRecordings,
    loadTimers,
    deleteTimer,
    updateTimer,
    vdrTimers,
    playRecording,
    deleteRecording,
  }
})
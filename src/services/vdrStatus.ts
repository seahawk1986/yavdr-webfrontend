import { useBackendStore } from "@/stores/backend";
import { useVDRStore } from "@/stores/vdr";
import {
  statusMessageEnum,
  type ChannelSwitch,
  type Recording,
  type Replaying,
  type SetAudioChannel,
  type SetAudioTrack,
  type SetSubtitleTrack,
  type SetVolume,
  type TimerChange,
} from "@/stores/interfaces/vdrStatusInterfaces";

const backend = useBackendStore()
const vdr = useVDRStore()

export async function useVDRStatus() {
  const eventSource = await backend.getSSEClient("/vdr/status");
  const controller = eventSource?.listen({
    // async onResponse({ request, response, options }) {
    //     console.log(`Received status code: ${response.status}`);
    // },
    onResponseError({ request, options, response }) {
      const status = response.status;
      console.log(
        `[response error]`,
        request,
        response.status,
        response.body,
        options
      );
      if (status === 401) {
        console.error("sse request not authorized:", response.statusText);
        backend.invalidateToken();
        controller.abort();
      }
    },
    onMessage(msg) {
      console.log("got event:", msg);
      const jsonData = JSON.parse(msg.data)
      switch (msg.event) {
        case statusMessageEnum.ChannelSwitch: {
          const data: ChannelSwitch = jsonData;
          if (data.LiveView && data.ChannelNumber != 0) {
            vdr.currentChannel = data.ChannelNumber;
            console.log("switched to channel:", data.ChannelNumber);
          }
          break;
        }
        case statusMessageEnum.Recording: {
          const data: Recording = jsonData;
          console.log("Recording status change:", data);
          break;
        }
        case statusMessageEnum.Replaying: {
          const data: Replaying = jsonData;
          console.log("Replaying status change:", data);
          break;
        }
        case statusMessageEnum.SetAudioChannel: {
          const data: SetAudioChannel = jsonData;
          console.log("Set Audio Channel:", data);
          break;
        }
        case statusMessageEnum.SetAudioTrack: {
          const data: SetAudioTrack = jsonData;
          console.log("Set Audio Track:", data);
          break;
        }
        case statusMessageEnum.SetSubtitleTrack: {
          const data: SetSubtitleTrack = jsonData;
          console.log("Set Subtitle Track:", data);
          break;
        }
        case statusMessageEnum.SetVolume: {
          const data: SetVolume = jsonData;
          console.log("Set Volume:", data);
          break;
        }
        case statusMessageEnum.TimerChange: {
          const data: TimerChange = jsonData;
          console.log("Timer change:", data);
          break;
        }
      }
    },
  });
  backend.sseClients.push(controller); // so we have a handle to cancel the request+
  return controller
}

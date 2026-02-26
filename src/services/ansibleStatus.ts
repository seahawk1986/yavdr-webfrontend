import { useBackendStore } from "@/stores/backend";
// import { useVDRStore } from "@/stores/vdr";

const backend = useBackendStore()
// const vdr = useVDRStore()

enum MessageType {
  "event",
  "status",
  "done",
}

interface ansibleEventInterface {
  uuid: string
  parent_uuid: string
  counter: number
  stdout: string
  pid: number
  created: Date
  event?: string
  event_data?: unknown
}

interface doneInterface {
  status: string
}

interface ansibleStatusInterface {
  uuid: string
}

export type NormalizedTag = {
  [key in MessageType]: [msg: ansibleEventInterface | ansibleStatusInterface | doneInterface];
};

export async function useAnsibleStatus() {
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
      const entries = Object.entries(jsonData);
      const firstEntry = entries[0];
      if (!firstEntry) return; // Beendet die Funktion, wenn das Objekt leer ist

      const [key, value] = firstEntry;
      switch (key) {
        case "event":
        case "status":
          break
        case "job": {
          const jobMsg = String(value);
          if (jobMsg.endsWith("done")) {
            // Extrahiert das erste Wort (den Job-Namen)
            const jobName = jobMsg.split(' ')[0];
            console.log(`job ${jobName} is done`);
          }
          break;
        }
        default: {
          console.log("unknown signal:", jsonData)
        }
      }
      console.log("got data:", jsonData, key, value)
    },
  });
  backend.sseClients.push(controller); // so we have a handle to cancel the request+
  return controller
}

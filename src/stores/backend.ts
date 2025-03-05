import { defineStore } from "pinia";
import axios from "axios";
import { computed, ref, type Ref } from "vue";
import { until, useLocalStorage } from "@vueuse/core";
import router from "@/router";
import { EventSourceController, EventSourcePlus } from "event-source-plus";
import type { SystemStatusInterface } from "./interfaces/SystemStatusInterface";
import { downloadBlob } from "@/services/download";

interface OptionInterface {
  baseUrl: string;
  token?: string;
}

const options: OptionInterface = { baseUrl: import.meta.env.VITE_API_BASE_URL };
console.log("baseURL:", options.baseUrl);

export const useBackendStore = defineStore("backend", () => {
  const ls = <T>(id: string, defaultValue: T): Ref<T> =>
    useLocalStorage(id, defaultValue);
  const jwToken = ls("jwToken", "");
  const selectedLocale = ls("locale", "");
  const titlebarHeight: Ref<number> = ref(0);
  const hasToken = computed(() => jwToken.value.length > 0);
  // const refreshToken: Ref<string> = ref('')
  const showNavigation: Ref<boolean> = ref(false);
  const showRemote: Ref<boolean> = ref(false);

  // const listedPulseSinks = ref(new ListedPulseSinks());
  // const pulseErrorMessage: Ref<string | null> = ref(null);

  const axios_instance = axios.create({
    baseURL: options.baseUrl, // TODO: use '/api/' for production
    timeout: 60000,
  });

  function invalidateToken() {
    // TODO: can the backend manage tokens resp. secret parts?
    jwToken.value = "";
  }

  axios_instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response ? error.response.status : null;
      if (status === 401) {
        // TODO: try to use the refresh token to obtain a new token

        // if the login fails we have an old token, so let's throw it away
        // this causes the login mask to be shown
        invalidateToken()
      } else {
        console.error("Request failed: ", error.response.status, error.response.statusText);
      }
      return Promise.reject(error);
    }
  );

  axios_instance.interceptors.request.use((config) => {
    const authToken = jwToken.value;
    if (authToken && authToken.length > 0) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });

  class RetriableError extends Error {}
  class FatalError extends Error {}

  // async function syntax //
  function getHeaders() {
    const authToken = jwToken.value;
    if (authToken && authToken.length > 0) {
      return {
        Authorization: `Bearer ${authToken}`,
      };
    } else {
      throw new FatalError("no Auth Token");
    }
  }

  const sseClients: Ref<EventSourceController[]> = ref([])
  async function getSSEClient(url: string) {
    const client = new EventSourcePlus(url, {
        headers: getHeaders(),
      });
    return client
  }


  async function login(username: string, password: string): Promise<boolean> {
    jwToken.value = "";
    try {
      const form = new FormData();
      form.append("username", username);
      form.append("password", password);
      const response_data = await axios_instance.post("/token", form);
      console.log("login response:", response_data.data);

      if (
        response_data.data.access_token &&
        response_data.data.token_type === "bearer"
      ) {
        jwToken.value = response_data.data.access_token;
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  function logout() {
    if (jwToken.value.length > 0) {
      console.log("logout");
      sseClients.value.map((client) => {
        client.abort()
      })
      invalidateToken()
      router.push("/");
    } else {
      console.log("already logged out");
    }
  }

  function sendKeypress(keyname: string) {
    console.log("Key pressed:", keyname);
    axios_instance
      .post("/hitkey", { key: keyname })
      .then((response) => {
        console.log("successfully sent key:", response.data.toJSON);
      })
      .catch((error) => {
        console.log("sending key press for '", keyname, "' failed: ", error.toJSON);
      });
  }

  const systemStatus: Ref<SystemStatusInterface | null> = ref(null);
  const cpu_average_load: Ref<Array<number>> = ref(new Array(60).fill(0));

  async function getSystemStatus() {
    try {
      const response = await axios_instance.get("/system/status");
      if (response.status === 200) {
        console.log("system status", response.data);
        systemStatus.value = response.data as SystemStatusInterface;
        if (cpu_average_load.value.length >= 60) {
          cpu_average_load.value.shift();
        }
        cpu_average_load.value.push(systemStatus.value.load_average.last_min);
      }
    } catch {
      console.log("failed to get system status data");
    }
  }

  async function getRequest(url: string) {
    let final_result = null
    do {
      final_result = await axios_instance
      .get(url)
      .then((result) => {
        console.log(
          "get request for ",
          url,
          "returned:",
          result.data,
          result.status,
          result.statusText
        );
        return result;
      })
      .catch(async (error) => {
        console.error(error.toJSON());
        return undefined;
      });

      if (jwToken.value.length === 0) {
        console.log("waiting for the jwToken to be set")
        await until(jwToken).changed()
      }

    } while (!final_result)
    return final_result
  }

  async function postRequest(url: string, payload: unknown) {
    return axios_instance
      .post(url, payload)
      .then((response) => {
        return response;
      })
  }

  async function putRequest(url: string, payload: unknown) {
    return axios_instance
      .post(url, payload)
      .then((response) => {
        return response;
      })
  }

  async function downloadFile(url: string) {
    try {
      const result = await axios_instance.get(url, { responseType: "blob" });
      const headerContentDisp: string = result.headers["content-disposition"];
      console.log(
        "got content-disposition from header: ",
        headerContentDisp,
        typeof headerContentDisp
      );
      const parts =
        headerContentDisp && headerContentDisp.split("filename*=utf-8");
      const filename = parts.length > 1 && parts[1].replace(/["']/g, ""); // TODO improve parsing
      // const contentType = result.headers["content-type"];

      console.log("downloaded file '", result.data, "' in browser");
      downloadBlob(result.data, filename ? filename : null);
    } catch (error) {
      console.error("download for", url, "failed:", error);
    }
  }

  async function uploadFile(
    url: string,
    file: File
  ): Promise<[boolean, string]> {
    // Replace 'http://your-server.com/upload' with your actual server endpoint
    try {
      const response = await axios_instance.postForm(url, {
        file: file,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data); // Handle successful upload response
      return [true, "upload successful"];
    } catch (error) {
      console.error(error); // Handle upload errors
      return [false, "upload failed"];
    }
  }

  async function deleteRequest(url: string) {
    return axios_instance
      .delete(url)
      .then((response) => {
        return response.data;
      })
      .catch();
  }

  // function listPulseaudioSinks() {
  //   console.log("called listPulseAudioSinks");
  //   axios_instance
  //     .get("audio/list_pulseaudio_sinks")
  //     .then((response) => {
  //       if (response.status == 200) {
  //         listedPulseSinks.value = response.data;
  //         console.log("audio sinks:", response.data);
  //         pulseErrorMessage.value = null;
  //       } else {
  //         pulseErrorMessage.value = response.statusText;
  //         console.error(
  //           "got status code:",
  //           response.status,
  //           "error:",
  //           response.statusText,
  //           response.data
  //         );
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("listing sinks failed:", error.toJSON());
  //       pulseErrorMessage.value = error.toJSON().message;
  //     });
  // }

  const isOnMobile: Ref<boolean> = ref(false);

  // const channelIdSet = computed(() => {
  //   const _channelIdSet = ref(new Set())
  //   vdrChannels.value.map((channel) => {
  //     _channelIdSet.value.add(channel.channel_id)
  //   })
  //   return _channelIdSet
  // })
  return {
    isOnMobile,
    showNavigation,
    showRemote,
    selectedLocale,
    titlebarHeight,
    login,
    logout,
    hasToken,
    invalidateToken,
    getSSEClient,
    RetriableError,
    FatalError,
    getRequest,
    postRequest,
    putRequest,
    deleteRequest,
    getSystemStatus,
    onKeypress: sendKeypress,
    cpu_average_load,
    systemStatus,
    uploadFile,
    downloadFile,
    sseClients,
  };
});

import { defineStore } from "pinia";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
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
  const jwToken: Ref<string> = ls("jwToken", "");
  // const jwToken = authStore.jwToken
  const selectedLocale = ls("locale", "");
  const titlebarHeight: Ref<number> = ref(0);
  const mainAreaHeight: Ref<number> = ref(0);
  const hasToken = computed(() => jwToken.value !== null && jwToken.value.length > 0);
  const requiresLogin = computed(() => jwToken.value === null || jwToken.value.length === 0)
  // const refreshToken: Ref<string> = ref('')
  const showNavigation: Ref<boolean | null> = ref(null);
  const showRemote: Ref<boolean> = ref(false);
  const showLanguageOverlay: Ref<boolean> = ref(false);

  // const listedPulseSinks = ref(new ListedPulseSinks());
  // const pulseErrorMessage: Ref<string | null> = ref(null);

  console.log("baseURL:", options)

  const axios_instance = axios.create({
    baseURL: options.baseUrl, // TODO: use '/api/' for production
    timeout: 60000,
  });

  function invalidateToken() {
    // TODO: can the backend manage tokens resp. secret parts?
    console.log("request failed with permission denied, invalidate token ...")
    jwToken.value = ""
  }

  axios_instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response ? error.response.status : null;
      if (status === 401) {
        // TODO: try to use the refresh token to obtain a new token

        // if the login fails we have an old token, so let's throw it away
        // this causes the login mask to be shown
        invalidateToken();
      } else {
        console.error("Request failed: ", error);
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

  class RetriableError extends Error { }
  class FatalError extends Error { }

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

  const sseClients: Ref<EventSourceController[]> = ref([]);
  async function getSSEClient(url: string) {
    const client = new EventSourcePlus(url, {
      headers: getHeaders(),
    });
    return client;
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
        client.abort();
      });
      invalidateToken();
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
        console.log("successfully sent key:", response.data);
      })
      .catch((error) => {
        console.log(
          "sending key press for '",
          keyname,
          "' failed: ",
          error.toJSON
        );
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

  // async function doOrRepepeatAfterReauthentication(
  //   fn: CallableFunction,
  //   url: string
  // ): Promise<AxiosResponse | undefined> {
  //   let final_result = null;
  //   do {
  //     final_result = await fn(url)
  //       .then((result: AxiosResponse) => {
  //         return result;
  //       })
  //       .catch(
  //         async (error: {
  //           status: number;
  //           toJSON: () => unknown;
  //           response: { config: { headers: { [x: string]: string } } };
  //         }) => {
  //           if (error.status != 401) return undefined;
  //           console.error(error.toJSON());
  //           await until(jwToken).toBeTruthy();
  //           const result = await fn(url);
  //           return result;
  //         }
  //       );
  //   } while (final_result === null);
  //   return final_result;
  // }

  interface AnsibleJobEventInterface {
    event?: {
      stdout: string
    },
    status?: {
      status: string
    }
  }

  async function getRequest(url: string): Promise<AxiosResponse | undefined> {
    let final_result = null;
    do {
      final_result = await axios_instance
        .get(url)
        .then((result: AxiosResponse) => {
          return result;
        })
        .catch(async (error) => {
          if (error.status != 401) return undefined;
          console.error(error);
          await until(jwToken).toBeTruthy();
          const result = await axios_instance.get(url);
          return result;
        });
    } while (final_result === null);
    return final_result;
  }

  async function postRequest(url: string, payload: unknown) {
    return axios_instance.post(url, payload).then((response) => {
      return response;
    });
  }

  async function postRequestWithStreamingResponse(
    url: string,
    payload: unknown,
    onData: (chunk: AnsibleJobEventInterface) => void,
    onEnd: (chunk: AnsibleJobEventInterface) => void
  ) {
    console.log("Streaming JSONL response:");
    let returnStatus = false;
    try {
      // Replace 'http://your-server.com/upload' with your actual server endpoint
      const response = await axios_instance.post(url, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        responseType: "stream",
        adapter: "fetch",
        timeout: 60 * 60 * 1000,
      });
      const reader = (response.data as ReadableStream).getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // console.log("got raw value: '", value, "'");

        buffer += decoder.decode(value, { stream: true });
        // console.log("buffer:", buffer);

        // Process complete JSON lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line for next iteration

        for (const line of lines) {
          if (line.startsWith("data:")) {
            // remove 'data:'
            const clean_line = line.replace(/^data:\s*/, "");
            // console.log("got line:", clean_line);
            try {
              const jsonData = JSON.parse(clean_line);
              console.log("Received JSON:", jsonData);
              onData(jsonData)
              if (
                jsonData.status &&
                (jsonData.status.status === "successful" ||
                  jsonData.status === "done")
              ) {
                // this is the playbook result
                returnStatus = true;
                onEnd(jsonData)
                // await reader.cancel()
              }
            } catch (error) {
              console.error("Failed to parse JSON:", error);
            }
          } else {
            // console.log("ignoring line:", line);
          }
        }
      }
    } catch (error) {
      console.error("Error uploading file or processing response:", error);
    }
    return returnStatus;
  }

  async function putRequest(url: string, payload: unknown) {
    return axios_instance.put(url, payload).then((response) => {
      return response;
    });
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

  async function uploadFileWithStreamingResponse(
    url: string,
    file: File,
    onData: (chunk: unknown) => void,
    onEnd: (chunk: unknown) => void
  ): Promise<void> {
    // Replace 'http://your-server.com/upload' with your actual server endpoint
    axios_instance
      .postForm(
        url,
        {
          file: file,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        },
        {
          responseType: "stream",
        }
      )
      .then((response) => {
        console.log(response.data); // Handle successful upload response
        response.data.on("data", (chunk: unknown) => {
          onData(chunk);
        });
        response.data.on("end", (chunk: unknown) => {
          onEnd(chunk);
        });
      })
      .catch((error) => {
        console.error(error); // Handle upload errors
      });
  }

  async function uploadFileWithStreamingResponseTC(
    url: string,
    uploaded_file: File,
    _onData: (chunk: unknown) => void // TODO: use this method to show progress im the client
  ): Promise<boolean> {
    // TODO: why does this fail?
    let returnStatus = false;
    try {
      // Replace 'http://your-server.com/upload' with your actual server endpoint
      const response = await axios_instance.postForm(
        url,
        {
          uploaded_file: uploaded_file,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        },
        {
          responseType: "stream",
          adapter: "fetch",
          timeout: 60 * 60 * 1000,
        }
      );
      const reader = (response.data as ReadableStream).getReader();
      const decoder = new TextDecoder();

      console.log("Streaming JSONL response:");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log("got raw value: '", value, "'");

        buffer += decoder.decode(value, { stream: true });
        console.log("buffer:", buffer);

        // Process complete JSON lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line for next iteration

        for (const line of lines) {
          if (line.startsWith("data:")) {
            // remove 'data:'
            const clean_line = line.replace(/^data:\s*/, "");
            console.log("got line:", line);
            try {
              const jsonData = JSON.parse(clean_line);
              console.log("Received JSON:", jsonData);
              if (jsonData.state === "done") {
                returnStatus = true;
                // await reader.cancel()
              }
            } catch (error) {
              console.error("Failed to parse JSON:", error);
            }
          } else {
            console.log("ignoring line:", line);
          }
        }
      }

      console.log("Streaming complete");
    } catch (error) {
      console.error("Error uploading file or processing response:", error);
    }
    return returnStatus;
  }

  async function deleteRequest(url: string, payload: unknown) {
    return axios_instance.delete(url, payload as AxiosRequestConfig<any>).then((response) => {
      return response;
    });
  }

  const isOnMobile: Ref<boolean> = ref(false);

  // https://stackoverflow.com/a/61511955
  function waitForElm(selector: string): Promise<Element | null> {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });

      // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }
  return {
    isOnMobile,
    showNavigation,
    showRemote,
    showLanguageOverlay,
    selectedLocale,
    titlebarHeight,
    mainAreaHeight,
    login,
    logout,
    hasToken,
    requiresLogin,
    invalidateToken,
    getSSEClient,
    RetriableError,
    FatalError,
    getRequest,
    postRequest,
    postRequestWithStreamingResponse,
    putRequest,
    deleteRequest,
    getSystemStatus,
    onKeypress: sendKeypress,
    cpu_average_load,
    systemStatus,
    uploadFile,
    uploadFileWithStreamingResponse,
    uploadFileWithStreamingResponseTC,
    downloadFile,
    sseClients,
    waitForElm,
  };
});

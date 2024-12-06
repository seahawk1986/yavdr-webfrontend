import { defineStore } from 'pinia'
import axios from 'axios'
import { computed, ref, type Ref } from 'vue'
import { ListedPulseSinks } from './Settings/audio'
import { useLocalStorage } from '@vueuse/core'
import router from '@/router'
import type { SystemStatusInterface } from './interfaces/SystemStatusInterface'
import type { VDRChannel } from './interfaces/VdrChannelInterface'
import type { VDRTimerInterface } from './interfaces/VdrTimerInterface'

interface OptionInterface {
  baseUrl: string
  token?: string
}

const options: OptionInterface = { baseUrl: import.meta.env.VITE_API_BASE_URL }
console.log('baseURL:', options.baseUrl)

const axios_instance = axios.create({
  baseURL: options.baseUrl, // TODO: use '/api/' for production
  timeout: 5000
})

axios_instance.interceptors.request.use((config) => {
  const authToken = localStorage.getItem('jwToken')
  if (authToken && authToken.length > 0) {
    config.headers.Authorization = `Bearer ${authToken}`
    console.log('jwToken:', authToken) // TODO: remove for production
  } else {
    console.log('Warning: no token')
  }
  return config
})

axios_instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null

    if (status === 401) {
      // Handle unauthorized access
      localStorage.setItem('jwToken', '')
      // router.push('/login')
    } else if (status === 404) {
      // Handle not found errors
    } else {
      // Handle other errors
    }

    return Promise.reject(error)
  }
)

export const useBackendStore = defineStore('backend', () => {
  const jwToken = useLocalStorage('jwToken', '')
  const hasToken = computed(() => jwToken.value.length > 0)
  // const refreshToken: Ref<string> = ref('')

  const listedPulseSinks = ref(new ListedPulseSinks())
  const pulseErrorMessage: Ref<string | null> = ref(null)

  async function login(username: string, password: string): Promise<boolean> {
    jwToken.value = ''
    try {
      const form = new FormData()
      form.append('username', username)
      form.append('password', password)
      const response_data = await axios_instance.post('/token', form)
      console.log(response_data.data)

      if (response_data.data.access_token && response_data.data.token_type === 'bearer') {
        jwToken.value = response_data.data.access_token
        return true
      } else {
        return false
      }
    } catch (error) {
      console.log(error)
      return false
    }
  }

  function logout() {
    if (jwToken.value.length > 0) {
      console.log('logout')
      jwToken.value = ''
      router.push('/')
    } else {
      console.log('already logged out')
    }
  }

  function sendKeypress(keyname: string) {
    console.log('Key pressed:', keyname)
    axios_instance
      .post('/hitkey', { key: keyname })
      .then((response) => {
        console.log('successfully sent key:', response.data.toJSON)
      })
      .catch((error) => {
        console.log('sending hitkey', keyname, 'failed:', error.toJSON)
      })
  }

  const systemStatus: Ref<SystemStatusInterface | null> = ref(null)
  const cpu_average_load: Ref<Array<number>> = ref(new Array(60).fill(0))

  async function getSystemStatus() {
    try {
      const response = await axios_instance.get('/system/status')
      if (response.status === 200) {
        console.log('system status', response.data)
        systemStatus.value = response.data as SystemStatusInterface
        if (cpu_average_load.value.length >= 60) {
          cpu_average_load.value.shift()
        }
        cpu_average_load.value.push(systemStatus.value.load_average.last_min)
      }
    } catch {
      console.log('failed to get system status data')
    }
  }

  async function getRequest(url: string) {
    return await axios_instance
      .get(url)
      .then((result) => {
        console.log("get request for ", url, "returned:", result.data, result.status, result.statusText)
        return result.data
      })
      .catch((error) => {
        console.error(error.toJSON())
        return undefined
      })
  }

  async function postRequest(url: string, payload: unknown) {
    return axios_instance
      .post(url, payload)
      .then((response) => {
        return response.data
      })
      .catch()
  }

  async function deleteRequest(url: string) {
    return axios_instance
      .delete(url)
      .then((response) => {
        return response.data
      })
      .catch()
  }

  function listPulseaudioSinks() {
    console.log('called listPulseAudioSinks')
    axios_instance
      .get('audio/list_pulseaudio_sinks')
      .then((response) => {
        if (response.status == 200) {
          listedPulseSinks.value = response.data
          console.log('audio sinks:', response.data)
          pulseErrorMessage.value = null
        } else {
          pulseErrorMessage.value = response.statusText
          console.error(
            'got status code:',
            response.status,
            'error:',
            response.statusText,
            response.data
          )
        }
      })
      .catch((error) => {
        console.log('listing sinks failed:', error.toJSON())
        pulseErrorMessage.value = error.toJSON().message
      })
  }

  const vdrChannels: Ref<Array<VDRChannel>> = ref([])
  const isLoadingChannels: Ref<boolean> = ref(false)

  async function loadChannels() {
    isLoadingChannels.value = true
    const data: VDRChannel[] = await getRequest('/vdr/channels_with_groups')
    if (data) {
      // console.log(data)
      vdrChannels.value = data
      isLoadingChannels.value = false
      return data
    } else {
      throw new Error('Loading VDR channels failed')
    }
  }

  async function saveChannels() {
    isLoadingChannels.value = true
    const channelList = vdrChannels.value.map((element) => {
      return element.channel_string
    })
    const result = await postRequest('/vdr/channels', { channel_list: channelList })
    console.log('sent channels.conf data:', channelList, result)
    isLoadingChannels.value = false
  }

  const vdrTimers: Ref<Array<VDRTimerInterface>> = ref([])
  const isLoadingTimers: Ref<boolean> = ref(false)

  async function loadTimers() {
    isLoadingTimers.value = true
    const data = await getRequest('/vdr/timers')
    if (Array.isArray(data)) {
      // console.log(data)
      vdrTimers.value = data
      isLoadingTimers.value = false
      console.log("got timers: ", data)
      return data
    } else {
      throw new Error('Loading VDR timers failed')
    }
  }

  const vdrRecordings: Ref<Array<VDRTimerInterface>> = ref([])
  const isLoadingRecordings: Ref<boolean> = ref(false)

  async function loadRecordings() {
    isLoadingTimers.value = true
    const data = await getRequest('/vdr/recordings')
    if (Array.isArray(data)) {
      // console.log(data)
      vdrRecordings.value = data
      isLoadingRecordings.value = false
      console.log("got recordings: ", data)
      return data
    } else {
      throw new Error('Loading VDR recordings failed')
    }
  }

  const isOnMobile: Ref<boolean> = ref(false)

  // const channelIdSet = computed(() => {
  //   const _channelIdSet = ref(new Set())
  //   vdrChannels.value.map((channel) => {
  //     _channelIdSet.value.add(channel.channel_id)
  //   })
  //   return _channelIdSet
  // })
  return {
    isOnMobile,
    login,
    logout,
    hasToken,
    getRequest,
    postRequest,
    deleteRequest,
    getSystemStatus,
    listPulseaudioSinks,
    // channelIdSet,
    onKeypress: sendKeypress,
    cpu_average_load,
    systemStatus,
    listedPulseSinks,
    pulseErrorMessage,
    vdrChannels,
    isLoadingChannels,
    loadChannels,
    saveChannels,
    loadTimers,
    loadRecordings,
  }
})

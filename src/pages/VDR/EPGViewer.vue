<template>
  <v-sheet>
    <h1>EPG Viewer</h1>
    <v-select
      v-model="selectedChannel"
      :items="store.vdrChannels"
      item-title="name"
      item-value="channel_id"
    />
    <div v-if="isLoading">
      <v-progress-linear indeterminate />
    </div>
    <!-- <div v-else-if="epgChannelList.length === 0">
      Keine Epg Daten vorhanden.
    </div> -->
    <v-virtual-scroll
      v-else
      height="74svh"
      :items="epgChannelList"
      density="compact"
    >
      <template
        #default="{ item, index }"
      >
        <v-list-item
          v-if="index === 0"
          :title="date.format(item.dtStart.toPlainDate.toString(), 'fullDateWithWeekday')"
          variant="elevated"
        >
          <template #prepend>
            <v-icon>mdi-calendar</v-icon>
          </template>
        </v-list-item>
        <v-list-item
          :title="item.title"
          :subtitle="item.subtitle ? item.subtitle : (item.description ? item.description : '')"
          slim
          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >
          <template
            #prepend
          >
            <v-btn
              color="primary"
              icon="mdi-timer-plus-outline"
              size="x-small"
            />
            <v-list-item
              :title="formatTimespan(item.dtStart, item.dtEnd)"
              :subtitle="`(${item.duration.minutes.toLocaleString()} Min.)`"
              lines="two"
              slim
            />
          </template>
        </v-list-item>
        <v-list-item
          v-if="item.crossDay"
          :title="date.format(item.dtEnd.toPlainDate.toString(), 'fullDateWithWeekday')"
          variant="elevated"
        />
        <!-- <v-divider v-else /> -->
      </template>
    </v-virtual-scroll>
  </v-sheet>
</template>

<script
  lang="ts"
  setup
>
  import { useBackendStore } from "@/stores/backend"
  import { useDate } from "vuetify"; 
  import { Temporal } from "temporal-polyfill";
  const date = useDate()
  const store = useBackendStore()

  interface epgEntryInterface {
    event_id: string
    channel_id: string

    title: string,
    subtitle: string,
    description: string,
    start: string,
    duration: string,
  }

  interface epgListInterface {
    dtStart: Temporal.PlainDateTime
    dtEnd: Temporal.PlainDateTime
    duration: Temporal.Duration
    title: string
    subtitle: string|null
    description: string|null
    channelId: string|null
    crossDay: boolean
    // isSeparator: boolean
  }

  const selectedChannel: Ref<string|null> = ref(null)
  const isLoading: Ref<boolean> = ref(true)

  const epgChannelList: Ref<epgListInterface[]> = ref([])

  function formatTimespan(dtStart: Temporal.PlainDateTime, dtEnd: Temporal.PlainDateTime) {
    return `${dtStart.hour.toString().padStart(2, '0')}:${dtStart.minute.toString().padStart(2, '0')}–${dtEnd.hour.toString().padStart(2, '0')}:${dtEnd.minute.toString().padStart(2, '0')}`
  }

  async function loadEpgData(channel_id: string|null) {
    isLoading.value = true
    // get the EPG for this channel
    if (channel_id) {
      const data: epgEntryInterface[] = await store.loadEPG(channel_id)
      epgChannelList.value = []
      if (data) {
        const epgListData: epgListInterface[] = data.map(element => {
          const dtStart = Temporal.PlainDateTime.from(element.start)
          const duration = Temporal.Duration.from(element.duration)
          const dtEnd = dtStart.add(duration)
          const crossDay = (dtStart.day !== dtEnd.day) ? true : false

          return {
            channelId: element.channel_id,
            dtStart: dtStart,
            dtEnd: dtEnd,
            duration: duration,
            crossDay: crossDay,
            title: element.title,
            subtitle: element.subtitle,
            description: element.description
          }          
          });
        epgChannelList.value = epgListData
      }
    }
    isLoading.value = false    
  }
  watch((selectedChannel), async (old_channel_id, channel_id) => {
    isLoading.value = true
    if (old_channel_id !== channel_id || old_channel_id === null) {
      // epgChannelList.value = []
      await loadEpgData(channel_id)
    }
  })
  

  onMounted (async () => {
    // load the channels
    await store.loadChannels()
    const first = store.vdrChannels.find(Boolean)
    if (first) {
      selectedChannel.value = first.channel_id
      await loadEpgData(selectedChannel.value)
    }
  })
</script>

<style lang="css" scoped>
.v-list-item-subtitle {
  /* overflow: hidden; text-overflow: ellipsis; white-space: nowrap !important; */
  width: 80vw;
}
</style>

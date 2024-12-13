<template>
  <v-sheet
    class="ma-2"
  >
    <v-toolbar
      color="grey-darken-4"
      dark
      flat
    >
      <v-toolbar-title>System Journal</v-toolbar-title>
      <template 
        v-if="$vuetify.display.mdAndUp"
      >
        <div
          v-for="level in logLevelSelection.filter((element) => element.prio <= filterLogLevel)"
          :key="level.prio"
        >
          <span :class="`${getBackgroundColorByPrio(level.prio)} pa-2 text-body-2`">{{ level.name }}</span>
          <v-divider
            thickness="1ch"
            opacity="0"
            vertical
          />
        </div>
      </template>
      <v-tooltip
        location="top"
      >
        <template #activator="{ props }">
          <v-btn
            aria-label="Scroll to show newest syslog entries"
            size="small"
            icon="mdi-play"
            v-bind="props"
            variant="tonal"
          />
        </template>
        <span>Autoscroll</span>
      </v-tooltip>
      <v-tooltip
        location="top"
      >
        <template #activator="{ props }">
          <v-btn
            aria-label="download syslog for current boot"
            :loading="isDownloadingFile"
            download
            size="small"
            icon="mdi-download"
            v-bind="props"
            variant="tonal"
            @click="downloadSyslog"
          />
        </template>
        <span>Download Syslog</span>
      </v-tooltip>
      <v-divider
        thickness="2ch"
        opacity="0"
        vertical
      />
      <v-select
        v-model="filterLogLevel"
        class="mt-6 mr-4 flex-grow-0"
        label="Loglevel"
        :items="logLevelSelection"
        item-title="name"
        item-value="prio"
        variant="outlined"
        density="compact"
      />
    </v-toolbar>
    <v-infinite-scroll
      :items="logEntries"
      :height="$vuetify.display.mobile ? '73vh' : '86vh'"
      side="both"
      @load="load"
    >
      <template #loading>
        <v-progress-linear
          color="primary"
          indeterminate
          rounded
        />
      </template>
    
      <template
        v-for="item in filteredLogEntries"
        :key="item.CURSOR"
      >
        <div class="text-body-2`">
          <!-- <span :class="getBackgroundColorByPrio(item.PRIORITY)"> -->
          {{ item.FORMATTED_TIMESTAMP }}
          <!-- </span> -->
          
          <v-divider
            thickness="1ch"
            vertical
            opacity="0"
          />
          <template v-if="$vuetify.display.lgAndUp">
            <span :class="getBackgroundColorByPrio(item.PRIORITY)">
              {{ item.HOSTNAME }}:
            </span>
            <v-divider
              thickness="1ch"
              vertical
              opacity="0"
            />
          </template>
          {{ item.MESSAGE }}
        </div>
      </template>
    </v-infinite-scroll>
  </v-sheet>
</template>

<script lang="ts" setup>
import { useBackendStore } from '@/stores/backend'
import { useDate } from 'vuetify'
import { VInfiniteScroll } from 'vuetify/components';

const date = useDate()

const store = useBackendStore()
const logEntries: Ref<Array<logEntryInterface>> = ref([])


function formatDate(element: logEntryInterface) {
  return `${date.format(element.REALTIME_TIMESTAMP, 'shortDate')} ${date.format(element.REALTIME_TIMESTAMP, 'fullTime24h')}`
}

onMounted(async () => {
  const data: Array<logEntryInterface> = await store.getRequest('/logs/?start=now&n_entries=200&direction=forward')
    logEntries.value = data.map((element) => {
    element.FORMATTED_TIMESTAMP = formatDate(element)
    return element
  })
})

type InfiniteScrollStatus = 'ok' | 'empty' | 'loading' | 'error';
interface doInterface {
    (status: InfiniteScrollStatus): void
}

interface logEntryInterface {
  BOOT_ID: string
  CURSOR: string
  HOSTNAME: string
  MACHINE_ID: string
  PRIORITY: number
  REALTIME_TIMESTAMP: string
  FORMATTED_TIMESTAMP: string|null
  MESSAGE: string
}

const logLevelSelection = [
  {name: "EMERGENCY", prio: 0, color: "red"},
  {name: "ALERT", prio: 1, color: "orange"},
  {name: "CRITICAL", prio: 2, color: "amber"},
  {name: "ERROR", prio: 3, color: "yellow"},
  {name: "WARNING", prio: 4, color: "deep-purple-lighten-2"},
  {name: "NOTICE", prio: 5, color: "light-blue"},
  {name: "INFO", prio: 6, color: "cyan"},
  {name: "DEBUG", prio: 7, color: "blue-grey-lighten-5"},
]

function getBackgroundColorByPrio(prio: number) {
  const color = logLevelSelection[prio].color
  return `text-${color}`
}

// function getColorByPrio(prio: number) {
//   const color = logLevelSelection[prio].color
//   return color
// }

const isDownloadingFile: Ref<boolean> = ref(false)

async function downloadSyslog() {
  isDownloadingFile.value = true
  await store.downloadFile('/logs/download?start=boot')
  isDownloadingFile.value = false
}

// const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
const filterLogLevel: Ref<number> = ref(7)
const filteredLogEntries = computed(() => {
  return logEntries.value.filter((entry) => entry.PRIORITY <= filterLogLevel.value)
})

async function load (this: VInfiniteScroll, { side, done }: {side: string, done: doInterface}) {
  console.log("called load with ", side)
  // TODO: implement the loading method
  // const halfVirtualLength = this.virtualLength / 2
  if (side === 'start') {
    console.log("scrollback")
    const firstElement = logEntries.value[0]
    if (firstElement) {
      const ts = firstElement.REALTIME_TIMESTAMP
      const data: logEntryInterface[] = await store.getRequest(`/logs/?start=${ts}&n_entries=200&direction=backward&uuid=${firstElement.CURSOR}`)
      if(data) {
        if (data.length == 0) {
              done('empty')
              return
            }
        const entries = data.map((element) => {
          element.FORMATTED_TIMESTAMP = formatDate(element)
          return element
        })
        entries.push(...logEntries.value)
        logEntries.value = entries
      }
    }

  //   const arr = this.createRange(halfVirtualLength, this.cards[0] - halfVirtualLength)
  //   this.cards = [...arr, ...this.cards.slice(0, halfVirtualLength)]
  //   this.$nextTick(() => {
  //     this.$refs.infinite.$el.scrollTop = this.$refs.infinite.$el.scrollHeight - (halfVirtualLength * this.size) - this.$refs.infinite.$el.scrollTop
  //   })
  } else {
    console.log("scroll down")
    const lastElement = logEntries.value[logEntries.value.length -1]
    if (lastElement){
      const ts = lastElement.REALTIME_TIMESTAMP
      const data: logEntryInterface[] = await store.getRequest(`/logs/?start=${ts}&n_entries=200&direction=forward&uuid=${lastElement.CURSOR}`)
      if(data !== null) {
        if (data.length === 0) {
          await new Promise(r => setTimeout(r, 1000));
        } else {
          const entries = data.map((element) => {
            element.FORMATTED_TIMESTAMP = formatDate(element)
            return element
          })
          logEntries.value.push(...entries)
        }
      }
      //   const arr = this.createRange(halfVirtualLength, this.cards.at(-1) + 1)
      //   this.cards = [...this.cards.slice(halfVirtualLength), ...arr]
    }
  }

  done('ok')
}

</script>
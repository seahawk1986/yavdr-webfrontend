<template>
  <v-sheet v-if="timerLoadingState === RequestState.Error">
    {{ $t('errors.loadingFailed', {what: $t('category.timer', 2)}) }}
    <v-btn
      prepend-icon="mdi-reload"
      @click="reloadTimers"
    >
      {{ $t('actions.reload') }}
    </v-btn>
  </v-sheet>
  <v-data-table-virtual
    v-else
    class="vdr-item-list"
    density="compact"
    :headers="headers"
    :items="timers"
    :loading="isLoadingTimers"
    :loading-text="$t('actions.loadingData', {what: $t('category.timer', 2)})"
    item-value="raw"
    items-per-page="-1"
    fixed-header
    hover
    :no-data-text="$t('timer.noTimers')"
  >
    <template #top>
      <v-toolbar
        flat
        rounded
        density="compact"
        color="primary"
      >
        <v-toolbar-title>
          {{ $t('category.timer', 2) }}
        </v-toolbar-title>
        <v-btn
          class="me-2"
          prepend-icon="mdi-reload"
          rounded="lg"
          :text="$t('actions.reload')"
          :aria-label="$t('actions.reloadSth', {what: $t('category.timer', 2)})"
          border
          @click="reloadTimers"
        />
      </v-toolbar>
    </template>
    <template #bottom />
    <template #item="{ item }">
      <tr>
        <td>
          <EditTimer
            tooltip="timerStatusLabel(item.status_flags)"
            :timer="item"
            :color="timerStatusColor(item.status_flags)"
            :aria-label="
              t('timer.editTimer', {
                entry: item.filename,
                start: item.start,
                end: item.stop,
              })
            "
            @delete="(id) => deleteTimer(id)"
            @update="(timer) => updateTimer(timer)"
          />
          <!-- <v-icon
            v-tooltip:start="timerStatusLabel(item.status_flags)"
            :color="timerStatusColor(item.status_flags)"
            icon="mdi-record"
            :aria-label="timerStatusLabel(item.status_flags)"
            size="x-large"
          /> -->
        </td>
        <td>
          <div v-if="item.start > 0">
            {{ $d(item.start * 1000 /* JS uses milliseconds */) + ' ' }}
          </div>
          <div v-else>
            {{ item.day }}
          </div>
          <div style="white-space: nowrap">
            {{ item.time_span }}
          </div>
        </td>
        <td>
          {{ item.filename }}
        </td>
        <td>
          {{ item.duration / 60 }} Min.
        </td>
        <td>
          {{ item.channel_name }}
        </td>
      </tr>
    </template>
    <!-- <template #top>
      <v-icon style="position: absolute">
        mdi-refresh
      </v-icon>
    </template> -->
  </v-data-table-virtual>
</template>

<script setup lang="ts">
import i18n from '@/plugins/i18n';
import { useVDRStore } from '@/stores/vdr';
import { useI18n } from 'vue-i18n';
import type { VDRTimerInterface } from '@/stores/interfaces/VdrTimerInterface';

const {t} = useI18n()

enum RequestState {
    Unused,
    Pending,
    Success,
    Error
}

const vdr = useVDRStore()
const timers: Ref<VDRTimerInterface[]> = ref([])
const isLoadingTimers: Ref<boolean> = ref(true)
const timerLoadingState: Ref<RequestState> = ref(RequestState.Unused)

const reloadTimers = async function () {
  isLoadingTimers.value = true
  timerLoadingState.value = RequestState.Pending
  try {
    timers.value = await vdr.loadTimers()
    timerLoadingState.value = RequestState.Success
  } catch (error) {
    console.log('could not load timers', error)
    timerLoadingState.value = RequestState.Error
  }
  isLoadingTimers.value = false
}

const headers = [{
    title: i18n.global.t('info.state'),
    headerProps: {
      class: "status-column",
      align: 'center',
    },
    cellProps: {}
  },
  {
    title: i18n.global.t('info.date'),
    headerProps: {
      class: "date-column",
    },
    cellProps: {}
  },
  {
    title: i18n.global.t('info.title'),
    headerProps: {
      class: "title-column",
    },
    cellProps: {}
  },
  {
    title: i18n.global.t('info.duration'),
    headerProps: {
      class: "duration-column",
    },
    cellProps: {}
  },
  {
    title: i18n.global.t('info.channel'),
    headerProps: {
      class: "channel-column"
    },
    cellProps: {}
  },
]

enum RecStatus {
  inactive,
  peding,
  active,
  unknown,
}

const timerStatus = function (status: number) {
  if (status === 0) {
    return RecStatus.inactive
  } else if ((status & 8) === 8) {
    return RecStatus.active
  } else if ((status & 1) === 1) {
    return RecStatus.peding
  } else {
    return RecStatus.unknown
  }
}

const timerStatusColor = function(status: number) {
  status = timerStatus(status)
  switch(status) {
    case RecStatus.inactive: return 'gray'
    case RecStatus.active: return 'red'
    case RecStatus.peding: return 'green'
    case RecStatus.unknown: return 'secondary'
  }
}

const timerStatusLabel = function(status: number) {
  status = timerStatus(status)
  switch(status) {
    case RecStatus.inactive: return i18n.global.t('timer.status.inactive')
    case RecStatus.active: return i18n.global.t('timer.status.recording')
    case RecStatus.peding: return i18n.global.t('timer.status.pending')
    case RecStatus.unknown: return i18n.global.t('timer.status.unknown')
  }
}

// const timerDuration = function(item: VDRTimerInterface) {
//   const d_start = new Temporal.PlainDateTime(item.)
//   const d_end = new Temporal.PlainTime(end)
//   if (d_start >= d_end) {
//     return d_end.since(d_start)
//   } else {
//     const midnight = new Temporal.PlainDate
//   } // ((d_end.hour * 60 + d_end.minute) - (d_start.hour * 60 + d_start.minute)).}


async function updateTimer(timerEntry: string) {
  if (timerEntry) {
    console.log("edit timer for:", timerEntry)
    await vdr.updateTimer(timerEntry)
  }
  await reloadTimers()
}


async function deleteTimer(id: number) {
  await vdr.deleteTimer(id)
  await reloadTimers()
}


onMounted (async () => {
    reloadTimers()
})
</script>

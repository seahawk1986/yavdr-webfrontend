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
    <template #bottom />
    <template #item="{ item }">
      <tr>
        <td>
          <v-icon
            :color="timerStatusColor(item.status)"
            icon="mdi-record"
            :aria-label="timerStatusLabel(item.status)"
            size="x-large"
          /> 
        </td>
        <td>
          {{ $d(item.day * 1000 /* JS uses milliseconds */) + ' ' }}<div style="white-space: nowrap">
            {{ item.time }}
          </div>
        </td>
        <td>
          {{ item.filename }}
        </td>
        <td>
          {{ (item.stop - item.start) / 60 }} Min.
        </td>
        <td>
          {{ item.channelname }}
        </td>
      </tr>
    </template>
  </v-data-table-virtual>
</template>

<script setup lang="ts">
import i18n from '@/plugins/i18n';
import { useVDRStore } from '@/stores/vdr';
import type { VDRTimerInterface } from '@/stores/interfaces/VdrTimerInterface';

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

onMounted (async () => {
    reloadTimers()
})
</script>
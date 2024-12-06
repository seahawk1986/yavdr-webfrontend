<template>
  <v-sheet v-if="recordingsLoadingState === RequestState.Error">
    {{ $t('errors.loadingFailed', {what: $t('category.recording', 2)}) }}
    <v-btn
      prepend-icon="mdi-reload"
      @click="reloadRecordings"
    >
      {{ $t('actions.reload') }}
    </v-btn>
  </v-sheet>
  <v-data-table-virtual
    v-else
    class="vdr-item-list"
    density="compact"
    :headers="headers"
    :items="recordings"
    :loading="isLoadingRecordings"
    item-value="raw"
    items-per-page="-1"
    fixed-header
    hover
  >
    <template #bottom />
    <template #item="{ item }">
      <tr>
        <td>
          <v-icon
            v-if="item.IsNew"
            icon="mdi-new-box"
            :aria-label="$t('recording.isNew')"
          />
        </td>
        <td>
          {{ getStartDate(item.Start) }}
        </td>
        <td>
          <v-icon
            v-if="item.IsEdited"
            icon="mdi-content-cut"
            :aria-label="$t('recording.isEdited')"
          />
          {{ item.InfoTitle }}
        </td>
        <td>
          {{ item.duration }}
        </td>
        <td>
          {{ item.InfoChannelName }}
        </td>
      </tr>
    </template>
  </v-data-table-virtual>
</template>

<script setup lang="ts">
import { useDate } from 'vuetify'
import { useBackendStore } from '@/stores/backend';
import type { VDRRecordingInterface } from '@/stores/interfaces/VdrRecordingInterface';
import i18n from '@/plugins/i18n';


enum RequestState {
    Unused,
    Pending,
    Success,
    Error
}

const date = useDate()
const store = useBackendStore()

const recordings: Ref<VDRRecordingInterface[]> = ref([])
const isLoadingRecordings: Ref<boolean> = ref(false)
const recordingsLoadingState: Ref<RequestState> = ref(RequestState.Unused)

const headers = [{
    title: i18n.global.t('info.state'),
    headerProps: {
      class: "status-column",
    },
    cellProps: {
    },
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
      visibility: "hidden-md-and-down"
    },
    cellProps: {
    }
  },
  {
    title: i18n.global.t('info.channel'),
    headerProps: {
      class: "channel-column"
    },
    cellProps: {}
  },
]

const reloadRecordings = async function () {
  isLoadingRecordings.value = true
  recordingsLoadingState.value = RequestState.Pending
  try {
    recordings.value = await store.loadRecordings()
    recordingsLoadingState.value = RequestState.Success
  } catch (error) {
    console.log('could not load recordings', error)
    recordingsLoadingState.value = RequestState.Error
  }
  isLoadingRecordings.value = false
}

function getStartDate(timestamp: number) {
    const d = new Date(timestamp * 1000)
    return date.format(d, 'keyboardDateTime24h')
}

onMounted (async () => {
    reloadRecordings()
})
</script>
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
  <v-sheet
    v-else
    rounded="lg"
  >
    <v-data-table-virtual
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
      <template #top>
        <v-toolbar
          flat
          rounded
          density="compact"
          color="primary"
        >
          <v-toolbar-title>
            {{ $t('category.recording', 2) }}
          </v-toolbar-title>
          <v-btn
            class="me-2"
            prepend-icon="mdi-reload"
            rounded="lg"
            :text="$t('actions.reload')"
            :aria-label="$t('actions.reloadSth', {what: $t('category.recording', 2)})"
            border
            @click="reloadRecordings"
          />
        </v-toolbar>
      </template>


      <template #bottom />
      <template #item="{ item }">
        <tr>
          <td>
            <RecordingDetails :recording="item" @delete="reloadRecordings" />
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
            <v-icon
              v-if="item.IsNew"
              align-self="center"
              icon="mdi-new-box"
              :aria-label="$t('recording.isNew')"
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
  </v-sheet>
</template>

<script setup lang="ts">
import { useDate } from 'vuetify'
import { useVDRStore } from '@/stores/vdr';
import type { VDRRecordingInterface } from '@/stores/interfaces/VdrRecordingInterface';
import i18n from '@/plugins/i18n';


enum RequestState {
    Unused,
    Pending,
    Success,
    Error
}

const date = useDate()
const vdr = useVDRStore()

const recordings: Ref<VDRRecordingInterface[]> = ref([])
const isLoadingRecordings: Ref<boolean> = ref(false)
const recordingsLoadingState: Ref<RequestState> = ref(RequestState.Unused)

const headers = [{
    title: i18n.global.t('descriptions.details'),
    headerProps: {
      class: "status-column",
      align: "center"
    },
    cellProps: {
      align: "center",
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
    recordings.value = await vdr.loadRecordings()
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

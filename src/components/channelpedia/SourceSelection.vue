<template>
  <v-sheet
    color="#0d1117"
    elevation="3"
    rounded="lg"
  >
    <v-tabs
      v-model="selectedSource"
      align-tabs="center"
      color="white"
    >
      <v-tab
        v-for="source in channelpediaData"
        :key="source.id"
        :prepend-icon="getIconBySouce(source.id)"
        :text="source.title"
        :value="source.id"
      />
    </v-tabs>
    <v-select
      v-model="selectedLocation"
      density="comfortable"
      :label="t('channels.location')"
      :items="locationItems"
      no-data-text="no data available"
    >
      <template #item="{ props, item }">
        <v-list-item
          v-bind="props"
          :title="getLocationTitle(item.raw.title)"
        >
          <template
            v-if="item.raw.title[2] === '_'"
            #prepend
          >
            {{ getFlagEmoji(item.raw.title.slice(0, 2)) }}
            <v-divider
              vertical
              thickness="10"
              class="border-opacity-0"
            />
          </template>
          <template
            v-else
            #prepend
          >
            <v-icon icon="mdi-satellite" />
          </template>
        </v-list-item>
      </template>
      <template #selection="{ item }">
        <v-list-item>
          <template
            v-if="item.raw.title[2] === '_'"
            #prepend
          >
            {{ getFlagEmoji(item.raw.title.slice(0, 2)) }}
            <v-divider
              vertical
              thickness="10"
              class="border-opacity-0"
            />
          </template>
          <template
            v-else
            #prepend
          >
            <v-icon icon="mdi-satellite" />
          </template>
          {{ getLocationTitle(item.raw.title) }}
        </v-list-item>
      </template>
    </v-select>
    <v-select
      v-model="selectedGroup"
      :label="t('channels.group')"
      :items="groupItems"
      no-data-text="no data available"
      density="comfortable"
    />
  </v-sheet>
  <v-sheet
    class="overflow-y-auto"
    max-height="85dvh"
  >
    <v-expansion-panels
      v-if="subGroupItems"
      variant="accordion"
    >
      <template
        v-for="subGroupItem in subGroupItems"
        :key="subGroupItem.id"
      >
        <v-expansion-panel
          v-if="subGroupItem"
          :title="subGroupItem.title"
        >
          <v-expansion-panel-text>
            <ChannelCandidateList
              :original-channel-candidates="subGroupItem.children as unknown as VDRChannel[]"
              :channel-id-set="pprops.channelIdSet"
              @add-channel="(channel) => {$emit('addChannel', channel)}"
              @insert-channel="(channel, number, scroll) => {$emit('insertChannel', channel, number, scroll)}"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </template>
    </v-expansion-panels>
  </v-sheet>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useBackendStore } from '@/stores/backend'
import type { ChannelSubGroup, VDRChannel } from '@/stores/interfaces/VdrChannelInterface'
import { useI18n } from 'vue-i18n';

import ChannelCandidateList from './ChannelCandidateList.vue'

const backend = useBackendStore()
const { t } = useI18n();

const pprops = defineProps<{
  channelIdSet: Ref<Set<string>>
}>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  (e: 'addChannel', channel: VDRChannel): void
  (e: 'insertChannel', channel: VDRChannel, number: number, scroll: boolean): void
}>()

interface ChannelCategoryInterface {
  id: string
  title: string
  children?: Array<ChannelCategoryInterface>
}

// const collapseNavDrawer = ref(true)

const isLoadingMap: Ref<Map<string, boolean>> = ref(new Map())

const channelpediaData: Ref<Array<ChannelCategoryInterface>> = ref([])
const channelpediaSubGroupMap: Ref<Map<string, ChannelSubGroup[]>> = ref(new Map())
const selectedSource: Ref<string> = ref('DVB-S')
const locationItems = computed(() => {
  const sourceId = selectedSource.value
  const items = channelpediaData.value.find((item) => item.id === sourceId)
  console.log('locationItems:', items)
  return items?.children
})
const selectedLocation: Ref<string | undefined> = ref()
watch([selectedSource], () => {
  if (locationItems.value && locationItems.value.length > 0) {
    selectedLocation.value = locationItems.value[0].title
    selectedGroup.value = null
  }
})

watch([selectedLocation], () => {
  if (groupItems.value && groupItems.value.length > 0) {
    // selectedGroup.value = groupItems.value[0].title
  }
})
const selectedGroup: Ref<string | null> = ref(null)

watch([selectedGroup], () => {
  const selectedEntry = groupItems.value?.find((item) => item.title === selectedGroup.value)
  if (selectedGroup.value && selectedEntry?.children?.length == 0) {
    getChannelsByGroup(selectedEntry)
  }
})
// get the subgroups with their channel entries
const groupItems = computed(() => {
  const items = locationItems.value?.find(
    (item) => item.id === `${selectedSource.value}|${selectedLocation.value}`
  )
  console.log('locationItems:', items)
  return items?.children
})

const subGroupItems: ComputedRef<ChannelCategoryInterface[]> = computed(() => {
  const items = channelpediaSubGroupMap.value.get(
    `${selectedSource.value}|${selectedLocation.value}|${selectedGroup.value}`
  )
  if (items) {
    return items
  } else {
    return []
  }
})

async function getChannelsByGroup(groupName: ChannelCategoryInterface) {
  if (!channelpediaSubGroupMap.value.has(groupName.id)) {
    isLoadingMap.value.set(groupName.id, true)

    try {
      const [source, position, group] = groupName.id.split('|', 3)
      const url = `/channelpedia/get_group_channels/${source}/${position}/${group}`
      console.log('fetching data for ', url)
      const response = await backend.getRequest(url)
      if (response?.data) {
        channelpediaSubGroupMap.value.set(groupName.id, response.data)
        groupName.children = response.data
      } else {
        groupName.children = []
      }
    } catch (error) {
      console.log(error)
    }
    isLoadingMap.value.set(groupName.id, false)
  }
}

function getIconBySouce(source: string): string {
  if (source === "DVB-S") {
    return "mdi-satellite-variant"
  } else if (source === "DVB-C") {
    return "mdi-audio-input-stereo-minijack"
  } else if (source === "DVB-T") {
    return "mdi-antenna"
  }
  return "mdi-questionmark"
}

const getLocationTitle = (title: string) => {
  return (title[2] === '_' ? title.slice(3) : title).replace(/_/g, ' ')
}

// see https://www.bqst.fr/country-code-to-flag-emoji/
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

onMounted(async () => {
  try {
    isLoadingMap.value.set('channelpediaMain', true)
    const response =  await backend.getRequest('/channelpedia/get_categories')
    if (response?.data) {
      channelpediaData.value = response.data
    }
    isLoadingMap.value.set('channelpediaMain', false)
    // console.log(channelpediaData.value)
    if (locationItems.value && locationItems.value.length > 0) {
      selectedLocation.value = locationItems.value[0].title
    }
  } catch (error) {
    console.log('could not load channelpedia sources', error)
  }
})
</script>

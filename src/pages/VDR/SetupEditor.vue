<template>
  <v-card
    class="scrollable-container overflow-auto h-100"
    style="min-width: 80%"
  >
    <v-card-title id="innerTitle">
      <h2>
        VDR Setup
        <v-btn
          color="primary"
          prepend-icon="mdi-download"
          @click="offerSetupConf"
        >
          Download setup.conf
        </v-btn>
      </h2>
      <v-container>
        <v-row no-gutters>
          <v-col
            cols="8"
            md="6"
            lg="4"
          />
        </v-row>
      </v-container>
    </v-card-title>

    <v-card-text class="pb-0">
      <v-text-field
        id="searchbar"
        v-model="searchText"
        prepend-inner-icon="mdi-magnify"
        :label="t('actions.searchObj', {what: t('category.entry')})"
        :aria-label="t('actions.searchObj', {what: t('category.entry')})"
        variant="outlined"
        clearable
        hide-details
        single-line
      />
      <v-data-table-virtual
        :headers="[
          {title: 'Name', key: 'name', value: 'name', align: 'start'},
          {title: 'Setting', key: 'setting', value: 'value', sortable: false},
          {title: 'Action', key: 'action', sortable: false, width:'20vW'},
          // {title: 'MinValue', value:'min_value'},
          // {title: 'MaxValue', value:'max_value'},
        ]"
        :items="vdrSetupEntries"
        :loading="isLoading"
        :filter-keys="['name']"
        :search="searchText"
        :custom-filter="(text, searchTerm) => {
          return text?.toLowerCase().includes(searchTerm.toLowerCase())
        }"
        :height="listHeight"
        width="50vW"
        item-value="name"
      >
        <template #item="{ item }">
          <tr class="text-no-wrap">
            <td>
              <v-icon-btn
                icon="mdi-reload"
                color="secondary"
                size="small"
                class="ml-2"
                :aria-label="t('actions.updateSth', {what: t('category.entry') + ' ' + item.name})"
                @click="reloadValue(item.name)"
              />
              <v-divider
                thickness="10"
                vertical
              />
              {{ item.name }}
            </td>
            <td>
              <!-- boolean value -->
              <v-switch
                v-if="item.min_value == 0 && item.max_value == 1"
                v-model="item.value"
                color="primary"
                density="compact"
                :inline="true"
                :true-value="1"
                :false-value="0"
                :aria-label="item.name"
                inset
                hide-details="auto"
                :center-affix="true"
              />
              <!-- most likely a string value with a given maximum length-->
              <v-text-field
                v-else-if="(item.min_value == null) && (item.max_value !==null)"
                v-model="item.value"
                :aria-label="item.name"
                class="mt-2 mb-n4"
                variant="outlined"
                density="compact"
                :rules="[
                  ((value: string) => {
                    if (item.max_value && item.max_value > 0) {
                      if (value.length > item.max_value) return `Value longer than ${item.max_value}`
                    }
                    return false
                  }),
                ]"
              />
              <v-number-input
                v-else-if="
                  !(item.max_value == null)
                    &&
                    !(item.min_value == null)"
                class="my-2"
                :model-value="Number(item.value)"
                :hide-spin-buttons="mobile"
                :min="0"
                :max="9007199254740991"
                variant="outlined"
                hide-details
                density="compact"
                :aria-label="item.name"
              />
              <v-number-input
                v-else-if="(item.min_value !== null) && (item.max_value !== null)"
                :model-value="Number(item.value)"
                class="my-2"
                :min="item.min_value"
                :max="item.max_value"
                variant="outlined"
                hide-details
                density="compact"
              />
            </td>
            <td>
              <!-- <v-btn
                icon="mdi-reload"
                color="secondary"
                size="small"
                class="ml-2"
                @click="reloadValue(item.name)"
              /> -->

              <v-icon-btn
                color="primary"
                icon="mdi-floppy"
                size="small"
                @click="sendValue(item.name, item.value)"
              />
              <!-- <v-col
                cols="4"
                md="6"
                lg="2"
                class="md-3 mt-2 mb-2"
                align="start"
                justify="bottom"
              >
              </v-col> -->
            </td>
            <!-- <td>{{ item.min_value }}</td>
            <td>{{ item.max_value }}</td> -->
          </tr>
        </template>
      </v-data-table-virtual>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { useDisplay } from 'vuetify'
import { useBackendStore } from '@/stores/backend';
import { useI18n } from 'vue-i18n';
import { downloadBlob } from '@/services/download';

const { mobile } = useDisplay()
const { t } = useI18n();
const store = useBackendStore()

const isLoading: Ref<boolean> = ref(false)
const searchText: Ref<string> = ref('')

interface VDRSetupInterface {
  name: string
  value: string|number
  max_value: number|null
  min_value: number|null
}

const listHeight = ref(0)

const vdrSetupEntries: Ref<VDRSetupInterface[]> = ref([])

async function loadVDRSetup() {
  isLoading.value = true
  try {
    const response = await store.getRequest('/vdr/setup')
    if (response?.data) {
      vdrSetupEntries.value = response.data
    }
  } catch (error) {
    console.error("could not load setup from vdr:", error)
  }
  isLoading.value = false

}

async function reloadValue(name: string) {
  try {
    const response = await store.getRequest(`/vdr/setup?key=${encodeURIComponent(name)}`)
    if (response?.data) {
      const idx = vdrSetupEntries.value.findIndex((element) => element.name === name)
      vdrSetupEntries.value[idx].value = response.data
      // const idx2 = visibleEntries.value.findIndex((element) => element.name === name)
      // visibleEntries.value[idx2].value = value
      console.log("updated value for: ", name, ': ', response.data, 'at index', idx)
      // console.log("updated value for: ", name, ': ', value, 'at index', idx2)
    }
  } catch(error) {
    console.error(error)
  }
}

async function sendValue(name: string, value: string|number) {
  const idx = vdrSetupEntries.value.findIndex((element) => element.name === name)
  vdrSetupEntries.value[idx].value = value
  console.log("saved value for: ", name, ': ', value, 'at index', idx)
  try {
    await store.postRequest(`/vdr/setup?key=${encodeURIComponent(name)}&value=${encodeURIComponent(value)}`, {})
  } catch(error) {
    console.error(error)
  }

};

async function offerSetupConf() {
  const setupConfList: string[] = []
  vdrSetupEntries.value.forEach((entry) => {
    setupConfList.push(`${entry.name} = ${entry.value}\n`)
  })
  const blob = new Blob(setupConfList, {type: "text/plain"})
  downloadBlob(blob, "setup.conf")
}

onMounted(async () => {
  await loadVDRSetup()
  const titleElement = (await store.waitForElm('#innerTitle'))
  const searchbarElement = (await store.waitForElm('#searchbar'))
  if (searchbarElement && titleElement) {
    console.log("title height:", titleElement.clientHeight)
    console.log("searchbar height:", searchbarElement.clientHeight)
    listHeight.value = (
      store.mainAreaHeight
       - titleElement.clientHeight
       - searchbarElement.clientHeight
      )
    console.log("listHeight:", listHeight.value)
  } else {
    listHeight.value = store.mainAreaHeight - 128
  }
})
</script>

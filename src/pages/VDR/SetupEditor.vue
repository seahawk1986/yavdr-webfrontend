<template>
  <v-card
    class="scrollable-container overflow-auto"
    :height="height - store.titlebarHeight"
  >
    <v-card-title>
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
          >
            <v-text-field
              v-model="searchText"
              prepend-icon="mdi-magnify"
              :label="t('actions.searchObj', {what: t('category.entry')})"
              :aria-label="t('actions.searchObj', {what: t('category.entry')})"
              variant="outlined"
              clearable
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-card-text>
      <!-- TODO: fix virtual scroll when searching for entries -->
      <v-virtual-scroll
        :items="visibleEntries"
        aria-label="Setup Entries"
        :height="height - store.titlebarHeight - 200"
      >
        <template #default="{ item }: { item: VDRSetupInterface }">
          <v-list-item
            density="compact"
            class="py-0"
            height="64"
          >
            <v-container>
              <v-row no-gutters>
                <!-- {{ item.name }} -->
                <v-col
                  v-if="
                    !item.max_value
                      &&
                      !item.min_value"
                  cols="8"
                  md="6"
                  lg="4"
                >
                  <!-- int64 value -->
                  <v-number-input
                    class="my-2"
                    :model-value="Number(item.value)"
                    :label="item.name"
                    :hide-spin-buttons="mobile"
                    :min="0"
                    :max="9007199254740991"
                    variant="outlined"
                    hide-details
                    density="compact"
                    :aria-label="item.name"
                  />
                </v-col>
                <v-col
                  v-else-if="item.min_value == 0 && item.max_value == 1"
                  cols="8"
                  md="6"
                  lg="4"
                  align-self="end"
                >
                  <v-switch 
                    v-model="item.value"
                    :label="item.name"
                    class="mb-3"
                    color="primary"
                    density="compact"
                    :true-value="1"
                    :false-value="0"
                    :aria-label="item.name"
                    inset
                    hide-details
                  />
                </v-col>
                <v-col
                  v-else-if="!item.min_value && item.max_value"
                  cols="8"
                  md="6"
                  lg="4"
                >
                  <!-- String and max len -->
                  <v-text-field
                    v-model="item.value"
                    :label="item.name"
                    :aria-label="item.name"
                    class="mt-2 mb-n4"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col
                  v-else-if="item.min_value && item.max_value"
                  cols="8"
                  md="6"
                  lg="4"
                >
                  <v-number-input
                    :model-value="Number(item.value)"
                    :label="item.name"
                    class="my-2"
                    :min="item.min_value"
                    :max="item.max_value"
                    variant="outlined"
                    hide-details
                    density="compact"
                  />
                </v-col>
                <v-col
                  cols="4"
                  md="6"
                  lg="2"
                  class="md-3 mt-2 mb-2"
                  align="start"
                  justify="bottom"
                >
                  <v-btn
                    icon="mdi-reload"
                    color="secondary"
                    size="small"
                    class="ml-2"
                    @click="reloadValue(item.name)"
                  />
                  <v-divider
                    thickness="10"
                    vertical
                  />
                  <v-btn
                    color="primary"
                    icon="mdi-floppy"
                    size="small"
                    @click="sendValue(item.name, item.value)"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-list-item>
          <v-divider />
        </template>
      </v-virtual-scroll>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { useDisplay } from 'vuetify'
import { useBackendStore } from '@/stores/backend';
import { useI18n } from 'vue-i18n';
import { downloadBlob } from '@/services/download';

const { height, mobile } = useDisplay()
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

const setupEntries: Ref<VDRSetupInterface[]> = ref([])

const visibleEntries = computed(()=> {
  console.log("recalculate VisibleEntries")
  if (searchText.value?.length > 0) {
    return setupEntries.value.filter((entry) => entry.name.toLowerCase().includes(searchText.value.toLowerCase()))
  } else {
    return setupEntries.value
  }
})



async function loadVDRSetup() {
  isLoading.value = true
  try {
    const response = await store.getRequest('/vdr/setup')
    if (response?.data) {
      setupEntries.value = response.data
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
      const idx = setupEntries.value.findIndex((element) => element.name === name)
      setupEntries.value[idx].value = response.data
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
  const idx = setupEntries.value.findIndex((element) => element.name === name)
  setupEntries.value[idx].value = value
  console.log("saved value for: ", name, ': ', value, 'at index', idx)
  try {
    await store.postRequest(`/vdr/setup?key=${encodeURIComponent(name)}&value=${encodeURIComponent(value)}`, {})
  } catch(error) {
    console.error(error)
  }

};

async function offerSetupConf() {
  const setupConfList: string[] = []
  setupEntries.value.forEach((entry) => {
    setupConfList.push(`${entry.name} = ${entry.value}\n`)
  })
  const blob = new Blob(setupConfList, {type: "text/plain"})
  downloadBlob(blob, "setup.conf")
}

onMounted(async () => {
  await loadVDRSetup()
})
</script>
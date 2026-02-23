<template>
  <div
    class="d-flex flex-column flex-grow-1 pa-4"
    style="min-height: 0; height: 100%;"
  >
    <v-card
      class="d-flex flex-column mx-auto w-100"
      style="height: 100%; min-height: 0;"
    >
      <v-card-title
        id="innerTitle"
        class="flex-none"
      >
        <div class="d-flex align-center justify-space-between w-100">
          <h2 class="text-h5">
            VDR Setup
          </h2>
          <v-btn
            :tooltip="t('actions.reload')"
            color="primary"
            :text="t('actions.reload')"
            prepend-icon="mdi-reload"
            @click="loadVDRSetup"
          />
          <v-btn
            color="primary"
            prepend-icon="mdi-download"
            @click="offerSetupConf"
          >
            Download setup.conf
          </v-btn>
        </div>
      </v-card-title>


      <v-card-text
        style="position: relative; min-height: 0;"
      >

      <v-text-field
        v-model="searchText"
        prepend-inner-icon="mdi-magnify"
        :aria-label="t('actions.searchObj', {what: t('category.entry')})"
        :label="`${t('actions.searchObj', {what: t('category.setupEntries')})} ...`"
        variant="outlined"
        hide-details
        single-line
        clearable
      />

      <v-virtual-scroll
        :items="filteredEntries"
        height="95%"
        item-height="64"
        class="border rounded"
      >
        <template #default="{ item }">
          <v-list-item
            :title="item.name"
            :subtitle="`Aktueller Wert: ${item.value}`"
            @click="openEdit(item)"
          >
            <template #append>
              <v-btn icon="mdi-pencil" variant="text" size="small" />
            </template>
          </v-list-item>
        </template>
      </v-virtual-scroll>

      <!-- Zentraler Bearbeitungs-Dialog -->
      <v-dialog v-model="showEditDialog" max-width="500">
        <v-card v-if="selectedItem">
          <v-card-title>{{ t('actions.edit', {what: t('category.setupValueFor', {what: `'${selectedItem.name}'`})}) }}</v-card-title>
          <v-card-text>
            <!-- Hier deine Widget-Logik (Switch, Number, Text) basierend auf selectedItem -->
            <v-switch
                v-if="selectedItem.min_value == 0 && selectedItem.max_value == 1"
                v-model="selectedItem.value"
                color="primary"
                :inline="true"
                :true-value="1"
                :false-value="0"
                :aria-label="selectedItem.name"
                :label="selectedItem.name"
                inset
                hide-details="auto"
                :center-affix="true"
            />
            <v-text-field
              v-else-if="((selectedItem !== null) && selectedItem.min_value == null) && (selectedItem.max_value !==null)"
              v-model="selectedItem.value"
              class="w-100"
              :aria-label="selectedItem.name"
              variant="outlined"
              density="compact"
              :rules="[
                ((value: string) => {
                  if (selectedItem?.max_value && selectedItem?.max_value > 0) {
                    if (value.length > selectedItem?.max_value) return `Value longer than ${selectedItem?.max_value}`
                  }
                  return false
                }),
              ]"
            />
            <v-number-input
              v-else-if="selectedItem.min_value !== null && selectedItem.max_value !== null && (typeof selectedItem.value === 'number')"
              v-model="selectedItem.value"
              :min="selectedItem.min_value"
              :max="selectedItem.max_value"
              variant="outlined"
            />

            <v-number-input
              v-else-if="
                !(selectedItem.max_value == null)
                  &&
                  !(selectedItem.min_value == null)"
              class="w-100"
              :model-value="Number(selectedItem.value)"
              :min="0"
              :max="9007199254740991"
              variant="outlined"
              hide-details
              :aria-label="selectedItem.name"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text="Abbrechen" @click="showEditDialog = false" />
            <v-btn color="primary" text="Speichern" @click="saveValue" />
          </v-card-actions>
        </v-card>
      </v-dialog>


      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { useBackendStore } from '@/stores/backend';
import { useI18n } from 'vue-i18n';
import { downloadBlob } from '@/services/download';

const { t } = useI18n();
const store = useBackendStore()

const isLoading: Ref<boolean> = ref(false)
const searchText = ref("")
const selectedItem = ref<VDRSetupInterface | null>(null)
const showEditDialog = ref(false)

// Filtert die Einträge basierend auf der Suche
const filteredEntries = computed(() => {
  if (!searchText.value) return vdrSetupEntries.value
  const term = searchText.value.toLowerCase()
  return vdrSetupEntries.value.filter(entry =>
    entry.name.toLowerCase().includes(term)
  )
})

// Öffnet den Dialog für einen spezifischen Eintrag
function openEdit(item: VDRSetupInterface) {
  selectedItem.value = { ...item } // Kopie erstellen, um Original erst bei Save zu ändern
  showEditDialog.value = true
}

async function saveValue() {
  if (selectedItem.value) {
    await sendValue(selectedItem.value.name, selectedItem.value.value)
    showEditDialog.value = false
    loadVDRSetup() // Liste neu laden
  }
}

interface VDRSetupInterface {
  name: string
  value: string|number
  max_value: number|null
  min_value: number|null
}

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

// async function reloadValue(name: string) {
//   try {
//     const response = await store.getRequest(`/vdr/setup?key=${encodeURIComponent(name)}`)
//     if (response?.data) {
//       const idx = vdrSetupEntries.value.findIndex((element) => element.name === name)
//       vdrSetupEntries.value[idx].value = response.data
//       // const idx2 = visibleEntries.value.findIndex((element) => element.name === name)
//       // visibleEntries.value[idx2].value = value
//       console.log("updated value for: ", name, ': ', response.data, 'at index', idx)
//       // console.log("updated value for: ", name, ': ', value, 'at index', idx2)
//     }
//   } catch(error) {
//     console.error(error)
//   }
// }

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
  // const titleElement = (await store.waitForElm('#innerTitle'))
  // const searchbarElement = (await store.waitForElm('#searchbar'))
})
</script>


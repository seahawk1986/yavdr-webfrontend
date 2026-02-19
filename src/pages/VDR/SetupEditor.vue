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
            color="primary"
            prepend-icon="mdi-download"
            @click="offerSetupConf"
          >
            Download setup.conf
          </v-btn>
        </div>
      </v-card-title>


      <v-card-text
        class="flex-grow-1"
        style="position: relative; min-height: 0;"
      >
        <!-- {{ vdrSetupEntries}} -->
        <div
          class="d-flex flex-column"
          style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding: 16px;"
        >
          <v-text-field
            id="searchbar"
            v-model="searchText"
            class="flex-none mb-2"
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
              {title: 'Name', key: 'name', value: 'name', align: 'start', width:'20vW'},
              {title: 'Setting', key: 'setting', value: 'value', sortable: false, width:'60vW'},
              {title: 'Action', key: 'action', sortable: false, width: '20vW'},
              // {title: 'MinValue', value:'min_value'},
              // {title: 'MaxValue', value:'max_value'},
            ]"
            :items="vdrSetupEntries"
            :item-height="70"
            :loading="isLoading"
            :filter-keys="['name']"
            :search="searchText"
            :custom-filter="(text, searchTerm) => {
              return text?.toLowerCase().includes(searchTerm.toLowerCase())
            }"
            height="900"
            width="50vw"
            fixed-header
            item-key="name"
            item-value="name"
            class="flex-grow-1"
          >
            <template #item="{ item, itemRef }">
              <tr
                :ref="itemRef"
                class="text-no-wrap"
                style="height:65;"
              >
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
        </div>
      </v-card-text>
    </v-card>
  </div>
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
const searchText: Ref<string> = ref("")

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
  // const titleElement = (await store.waitForElm('#innerTitle'))
  // const searchbarElement = (await store.waitForElm('#searchbar'))
})
</script>

<style lang="css" scoped>

/* 1. Erzwinge die Höhe für die Tabellen-Zellen */
:deep(.v-data-table-virtual tr),
:deep(.v-data-table-virtual td) {
  height: 64px !important;
  max-height: 64px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* 2. Neutralisiere die Vuetify-Inputs innerhalb der Tabelle */
:deep(.v-table__wrapper .v-input) {
  margin: 0 !important;
  padding: 0 !important;
  /* Verhindert, dass die Inputs die Zelle aufblähen */
  height: 40px;
  display: flex;
  min-width: 400px;
  align-items: center;
}

/* 3. Verstecke Fehlermeldungs-Platzhalter komplett */
:deep(.v-input__details) {
  display: none !important;
}

/* 4. Fixiere den Scroll-Container */
:deep(.v-table__wrapper) {
  overflow-y: auto !important;
}


/* Dieser Teil erzwingt, dass der interne Wrapper der Tabelle wirklich scrollt */
:deep(.v-data-table__td) {
  height: 70px !important;
}

/* Verhindert, dass die Tabelle über die Card hinausragt */
.vdr-table {
  display: flex;
  flex-direction: column;
}

:deep(.v-table__wrapper) {
  flex-grow: 1;
  overflow-y: auto !important;
}

/* Zwinge die Tabelle, den Platz des v-card-text einzunehmen */
/* :deep(.v-table__wrapper) {
  height: 100% !important;
  overflow-y: auto !important;
} */

/* Fixiere die Zeilenhöhe für korrekte Virtualisierung */
:deep(.v-data-table-virtual tr) {
  height: 70px !important;
}
.v-data-table-virtual tr {
  height: 70px !important;
}

.v-data-table-virtual td {
  height: 70px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* Verhindert, dass Input-Details (Fehlermeldungen) die Zeile aufblähen */
.v-data-table-virtual .v-input__details {
  display: none !important;
}
</style>

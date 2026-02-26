<template>
  <!-- Der Wrapper füllt den gesamten v-main Platz aus -->
  <div
    class="d-flex flex-column flex-grow-1 pa-4"
    style="height: 100%; min-height: 0"
  >
    <v-card
      class="d-flex flex-column mx-auto w-100"
      style="height: 100%; min-height: 0"
    >
      <v-card-title class="flex-none pt-4 px-4">
        <div class="d-flex align-center justify-space-between w-100">
          <h2 class="text-h5">VDR Setup</h2>
          <v-btn
            color="primary"
            prepend-icon="mdi-download"
            @click="offerSetupConf"
          >
            Download setup.conf
          </v-btn>
        </div>
      </v-card-title>

      <!-- Dieser Container misst den verfügbaren Platz -->
      <v-card-text
        ref="tableContainer"
        class="flex-grow-1 pa-0"
        style="position: relative; min-height: 0; overflow: hidden"
      >
        <!-- Absolute Positionierung, um sich an v-card-text zu klammern -->
        <div
          class="d-flex flex-column pa-4"
          style="position: absolute; inset: 0"
        >
          <v-text-field
            id="searchbar"
            v-model="searchText"
            class="flex-none mb-4"
            prepend-inner-icon="mdi-magnify"
            :label="t('actions.searchObj', { what: t('category.entry') })"
            variant="outlined"
            clearable
            hide-details
            single-line
          />

          <!-- Die Tabelle nutzt die dynamisch berechnete Höhe -->
          <v-data-table-virtual
            :headers="headers"
            :items="vdrSetupEntries"
            :item-height="64"
            :height="dynamicTableHeight"
            :loading="isLoading"
            :search="searchText"
            fixed-header
            item-value="name"
            class="vdr-table-fix"
          >
            <template #item="{ item, itemRef }">
              <tr :ref="itemRef">
                <td class="text-no-wrap">
                  <v-btn
                    icon="mdi-reload"
                    variant="text"
                    color="secondary"
                    size="small"
                    @click="reloadValue(item.name)"
                  />
                  <v-divider thickness="2" vertical class="mx-2" />
                  {{ item.name }}
                </td>

                <td>
                  <!-- Boolean / Switch -->
                  <v-switch
                    v-if="item.min_value === 0 && item.max_value === 1"
                    v-model="item.value"
                    color="primary"
                    density="compact"
                    :true-value="1"
                    :false-value="0"
                    hide-details
                    inset
                  />

                  <!-- Number Input -->
                  <v-number-input
                    v-else-if="item.min_value !== null"
                    v-model="item.value"
                    :min="item.min_value"
                    :max="item.max_value || 9007199254740991"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />

                  <!-- Text Input -->
                  <v-text-field
                    v-else
                    v-model="item.value"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </td>

                <td class="text-center">
                  <v-btn
                    color="primary"
                    icon="mdi-floppy"
                    size="small"
                    variant="tonal"
                    @click="sendValue(item.name, item.value)"
                  />
                </td>
              </tr>
            </template>
          </v-data-table-virtual>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useDisplay } from "vuetify";
import { useBackendStore } from "@/stores/backend";
import { useI18n } from "vue-i18n";
import { downloadBlob } from "@/services/download";

const { mobile } = useDisplay();
const { t } = useI18n();
const store = useBackendStore();

const isLoading: Ref<boolean> = ref(false);
const searchText: Ref<string> = ref("");

interface VDRSetupInterface {
  name: string;
  value: string | number;
  max_value: number | null;
  min_value: number | null;
}

const vdrSetupEntries: Ref<VDRSetupInterface[]> = ref([]);

async function loadVDRSetup() {
  isLoading.value = true;
  try {
    const response = await store.getRequest("/vdr/setup");
    if (response?.data) {
      vdrSetupEntries.value = response.data;
    }
  } catch (error) {
    console.error("could not load setup from vdr:", error);
  }
  isLoading.value = false;
}

async function reloadValue(name: string) {
  try {
    const response = await store.getRequest(
      `/vdr/setup?key=${encodeURIComponent(name)}`,
    );
    if (response?.data) {
      const idx = vdrSetupEntries.value.findIndex(
        (element) => element.name === name,
      );
      vdrSetupEntries.value[idx].value = response.data;
      // const idx2 = visibleEntries.value.findIndex((element) => element.name === name)
      // visibleEntries.value[idx2].value = value
      console.log(
        "updated value for: ",
        name,
        ": ",
        response.data,
        "at index",
        idx,
      );
      // console.log("updated value for: ", name, ': ', value, 'at index', idx2)
    }
  } catch (error) {
    console.error(error);
  }
}

interface SetupElement {
  name: string;
  value: string | number;
}

async function sendValue(name: string, value: string | number) {
  const idx = vdrSetupEntries.value.findIndex(
    (element: SetupElement) => element.name === name,
  );
  vdrSetupEntries.value[idx].value = value;
  console.log("saved value for: ", name, ": ", value, "at index", idx);
  try {
    await store.postRequest(
      `/vdr/setup?key=${encodeURIComponent(name)}&value=${encodeURIComponent(value)}`,
      {},
    );
  } catch (error) {
    console.error(error);
  }
}

async function offerSetupConf() {
  const setupConfList: string[] = [];
  vdrSetupEntries.value.forEach((entry) => {
    setupConfList.push(`${entry.name} = ${entry.value}\n`);
  });
  const blob = new Blob(setupConfList, { type: "text/plain" });
  downloadBlob(blob, "setup.conf");
}

const tableContainer = ref<HTMLElement | null>(null);
const dynamicTableHeight = ref(500); // Startwert

// Dynamische Höhenberechnung
const updateHeight = () => {
  // Zugriff auf das native DOM-Element der Vuetify-Komponente via .$el
  const el = tableContainer.value?.$el as HTMLElement | undefined;

  if (!el) return;

  const searchbarHeight = 70;
  const padding = 32;
  const buffer = 10;

  const calculated = el.offsetHeight - searchbarHeight - padding - buffer;
  dynamicTableHeight.value = calculated > 100 ? calculated : 400;
};

const resizeObserver = new ResizeObserver(() => {
  updateHeight();
});

onMounted(async () => {
  loadVDRSetup(); // Dein API Aufruf
  await nextTick();
  updateHeight();
  if (tableContainer.value) resizeObserver.observe(tableContainer.value);
});

onUnmounted(async () => {
  loadVDRSetup();
  await nextTick();

  // Warten auf die Transition und sicherstellen, dass $el existiert
  setTimeout(() => {
    const el = tableContainer.value?.$el as HTMLElement | undefined;

    if (el) {
      updateHeight();
      resizeObserver.observe(el);
    }
  }, 200); // 200ms Puffer für die 'slide' Transition
});

const headers = [
  { title: "Name", key: "name", align: "start" },
  { title: "Setting", key: "value", sortable: false },
  {
    title: "Action",
    key: "action",
    sortable: false,
    width: "100px",
    align: "center",
  },
] as const;
</script>

<style scoped>
/* WICHTIG: Erzwinge exakte Höhen für die Virtualisierung */
:deep(.v-data-table-virtual tr) {
  height: 64px !important;
}

:deep(.v-data-table-virtual td) {
  height: 64px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* Verhindert internes Scrollen des v-card-text, da die Tabelle scrollt */
.vdr-table-fix {
  overflow: hidden;
}

:deep(.v-table__wrapper) {
  overflow-y: auto !important;
}
</style>

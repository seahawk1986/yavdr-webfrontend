<template>
  <div>
  <v-dialog v-model="showLogDialog" modal max-width="900" scrollable persistent>
    <v-card color="grey-darken-4">
      <v-card-title class="text-white d-flex align-center">
        {{ PlaybookAction }}
        <v-progress-circular v-if="isLookingForDisplays" indeterminate size="20" class="ml-4" />
      </v-card-title>

      <v-card-text
        ref="logContainer"
        style="height: 450px; font-family: monospace; background: #000; color: white;"
        @scroll.passive="handleScroll"
      >
        <div v-for="(line, i) in playbookLogs" :key="i" v-html="line"></div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>

        <v-divider></v-divider>
          <v-fade-transition>
          <v-btn
            v-if="!isAutoScrolling"
            icon="mdi-arrow-down"
            color="primary"
            size="small"
            elevation="4"
            class="scroll-bottom-btn"
            @click="scrollToBottomManual"
          ></v-btn>
        </v-fade-transition>
        <v-spacer></v-spacer>
        <v-btn color="primary" :disabled="isLookingForDisplays||isSettingConfig" @click="showLogDialog = false">
          Schließen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-card
  class="ma-2 pa-2 fill-height overflow-y-auto align-center"
  :disabled="isLookingForDisplays"
  :loading="isLookingForDisplays || isSettingConfig"
    prepend-icon="mdi-monitor-multiple"
    :title="t('category.displaySettings')"
  >
    <v-card-actions class="justify-center flex-wrap ga-2">
      <v-btn
        :disabled="isSettingConfig"
        :loading="isLookingForDisplays"
        prepend-icon="mdi-monitor-eye"
        color="primary"
        variant="tonal"
        :text="t('actions.rescanDisplays')"
        @click="scanDisplays()"
      />

      <v-btn
        class="flex-sm-grow-0"
        :disabled="isLookingForDisplays"
        :loading="isSettingConfig"
        prepend-icon="mdi-send"
        color="secondary"
        variant="tonal"
        :text="t('actions.apply')"
        @click="setDisplayConfig()"
      />
    </v-card-actions>

    <v-card-text>
      <v-container
        v-if="displayConfig && displayOutputs"
        :disabled="isSettingConfig||isLookingForDisplays"
      >
        <v-row
          no-gutters
          justify="center"
        >
          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              class="flex-1-0 ma-2 pa-2"
              variant="outlined"
              :min-width="200"
            >
              <template #title>
                {{ t('category.mainDisplay') }}
              </template>
              <template #text>
                <v-select
                  v-model="primaryDisplay"
                  :items="available_connectors"
                  :item-props="true"
                />
                <div v-if="primaryDisplay">
                  <!-- Modes: {{ Object.keys(xrandrFacts[primaryDisplay].modes) }} -->
                  <v-select
                    v-model="primaryDisplayResolution"
                    :items="primaryDisplayResolutionOptions"
                  />
                  <v-select
                    v-if="primaryDisplayResolution"
                    v-model="primaryDisplayRefreshRate"
                    :items="
                      displayOutputs[primaryDisplay].modes[
                        primaryDisplayResolution
                      ]
                    "
                  />
                </div>
              </template>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              class="flex-1-0 ma-2 pa-2"
              variant="outlined"
              :min-width="200"
            >
              <template #title>
                {{ t('category.secondaryDisplay') }}
              </template>

              <template #text>
                <v-select
                  v-model="secondaryDisplay"
                  :items="secondaryDisplayOptions"
                  :item-props="true"
                />
                <v-select
                  v-model="secondaryDisplayResolution"
                  :items="secondaryDisplayResolutionOptions"
                  :disabled="secondaryDisplayResolutionOptions.length == 0"
                />
                <v-select
                  v-model="secondaryDisplayRefreshRate"
                  :disabled="secondaryDisplayRefreshrateOptions.length == 0"
                  :items="secondaryDisplayRefreshrateOptions"
                />
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue";
import { useBackendStore } from "@/stores/backend";
import { useI18n } from "vue-i18n";

import AnsiConverter from 'ansi-to-html';
import type { VCardText } from "vuetify/components";
import type { AnsibleJobEventInterface } from "@/stores/interfaces/AnsibleInterface";
const convert = new AnsiConverter({ fg: '#FFF', bg: '#000', newline: true, escapeXML: true,  // Sicherheit gegen XSS (sehr wichtig bei v-html!)
  stream: true  });

const backend = useBackendStore();

const {t} = useI18n()

// interface XrandrModeList {
//   [key: string]: number[];
// }

// interface XrandrDisplayInterface {
//   connector: string;
//   EDID: string;
//   model: string;
//   vendor: string;
//   auto: string;
//   current: string;
//   is_connected: boolean;
//   modelines: Map<string, string>;
//   modes: XrandrModeList;
//   preferred: string;
//   preferred_resolution: string;
//   preferred_refreshrate: number;
// }

interface ConnectorInterface {
    xrandr_name: string;
    is_connected: boolean;
    edid: string|null;
    xorg_modelines: Record<string, string>;
    edid_modelines: Record<string, string>;
    all_modelines: Record<string, string>;
    modes: Record<string, number[]>;
    bus_id: string|null;
    drm_name: string|null;
    card_name: string|null;
    vendor: string|null;
    model: string|null;
}

interface NestedConnectorInterface {
  [key: string]: ConnectorInterface;
}

interface MonitorConfigInterface {
  connector: string;
  resolution: string;
  refreshrate: number;
}

interface DisplayConfigInterface {
  primary?: MonitorConfigInterface;
  secondary?: MonitorConfigInterface;
}

// const xorgFacts: Ref<XorgDisplayMainInterface | undefined> = ref();
const displayOutputs: Ref<NestedConnectorInterface | undefined> = ref();
const displayConfig: Ref<DisplayConfigInterface | undefined> = ref();
const primaryDisplay: Ref<string | undefined> = ref();
const secondaryDisplay: Ref<string | undefined> = ref();

const primaryDisplayResolution: Ref<string | undefined> = ref();
const primaryDisplayRefreshRate: Ref<number | undefined> = ref();
const secondaryDisplayResolution: Ref<string | undefined> = ref();
const secondaryDisplayRefreshRate: Ref<number | undefined> = ref();

const isLookingForDisplays: Ref<boolean> = ref(false);
const isSettingConfig: Ref<boolean> = ref(false);

const playbookLogs: Ref<string[]> = ref([]);
const showLogDialog = ref(false);
const PlaybookAction = ref("")
// const enableSecondaryDisplay: Ref<boolean> = ref(true);

const updateDisplayConfig = async () => {
  const xorg_config_response = await backend.getRequest("/system/display_config");
  if (xorg_config_response?.data) {
    displayConfig.value = xorg_config_response.data;
    console.log("DisplayConfig:", displayConfig.value);
  }

  const xrandr_response = await backend.getRequest("/system/display_outputs");
  if (xrandr_response?.data) {
    displayOutputs.value = xrandr_response.data.connectors;
    console.log("DisplayOutputs:", xrandr_response.data);
  }

  if (displayConfig?.value?.primary) {
    primaryDisplay.value = displayConfig.value.primary.connector;
    primaryDisplayResolution.value = displayConfig.value.primary.resolution;
    primaryDisplayRefreshRate.value = displayConfig.value.primary.refreshrate;
  }
  if (displayConfig?.value?.secondary) {
    secondaryDisplay.value = displayConfig.value.secondary.connector;
    secondaryDisplayResolution.value = displayConfig.value.secondary.resolution;
    secondaryDisplayRefreshRate.value = displayConfig.value.secondary.refreshrate;
  }
};

onMounted(async () => {
  await updateDisplayConfig()
});

const primaryDisplayResolutionOptions = computed(() => {
  if (displayOutputs?.value && primaryDisplay?.value) {
    console.log("primary resolutions:", displayOutputs.value[primaryDisplay.value])
    const resolutions = Object.keys(
      displayOutputs.value[primaryDisplay.value].modes
    );
    resolutions.sort((a, b) => {
      const a_parts = a.split("x", 2).map((e) => Number(e));
      const b_parts = b.split("x", 2).map((e) => Number(e));
      const result = -a_parts[0] + b_parts[0];
      if (result === 0) return -a_parts[1] + b_parts[1];
      return result;
    }); // Sort the resolutions numerically
    return resolutions;
  } else {
    return [];
  }
});

const available_connectors = computed(() => {
  if (displayOutputs.value) {
    return Object.entries(displayOutputs.value)
      .filter(([, monitor]) => monitor.is_connected)
      .map(([connector, monitor]) => {
        const entry = {
          title: connector,
          subtitle: monitor.model,
        };
        return entry;
      });
  } else return [];
});

const secondaryDisplayOptions = computed(() => {
  const connectors = available_connectors.value.filter(
    (value) => value.title != primaryDisplay.value
  );
  connectors.push({ title: "", subtitle: "no second display" });
  return connectors;
});

const secondaryDisplayResolutionOptions = computed(() => {
  // TODO: why does the rescan-displays.yml playbook return the wrong connectors compared to running the yavdr-ansible07.yml playbook?
  if (displayOutputs.value && secondaryDisplay.value && displayOutputs.value[secondaryDisplay.value]?.modes) {
    const resolutions = Object.keys(
      displayOutputs.value[secondaryDisplay.value].modes
    );
    resolutions.sort((a, b) => {
      const a_parts = a.split("x", 2).map((e) => Number(e));
      const b_parts = b.split("x", 2).map((e) => Number(e));
      const result = -a_parts[0] + b_parts[0];
      if (result === 0) return -a_parts[1] + b_parts[1];
      return result;
    }); // Sort the resolutions numerically
    return resolutions;
  } else {
    return [];
  }
});

const secondaryDisplayRefreshrateOptions = computed(() => {
  if (
    displayOutputs.value &&
    secondaryDisplay.value &&
    secondaryDisplayResolution.value
  ) {
    return displayOutputs.value[secondaryDisplay?.value].modes[
      secondaryDisplayResolution.value
    ];
  } else {
    return [];
  }
});

function processPlaybookOutput(data: AnsibleJobEventInterface)
{
  console.log(data);
  console.log("Process data:", data, data.event?.stdout)
  if (data.event?.stdout && data.event.stdout.length > 0) {
    playbookLogs.value.push(convert.toHtml(data.event.stdout));
  } else if (data.status?.status) {
    playbookLogs.value.push(`<span class="text-info">Status: ${data.status.status}</span>`);
  }

}

async function scanDisplays() {
  PlaybookAction.value = t('actions.scan_displays')

  playbookLogs.value = []
  isLookingForDisplays.value = true;
  showLogDialog.value = true
  try {

    const result = await backend.postRequestWithStreamingResponse(
      "/system/playbook/rescan_displays",
      null,
      processPlaybookOutput,
      (chunk) => console.log("finished playbook:", chunk)
    );
    console.log("got rescan displays result", result);
  } catch(e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      playbookLogs.value.push(`<span class="text-error">Fehler: ${errorMessage}</span>`);
  } finally {
    await updateDisplayConfig()
    isLookingForDisplays.value = false;
    // showLogDialog.value = false;
  }
}

const logContainer = ref<InstanceType<typeof VCardText> | null>(null);
let isAutoScrolling = ref(true);

const handleScroll = (event: Event) => {
  const el = event.target as HTMLElement;
  // Toleranz von 10px, um Rundungsfehler bei High-DPI Displays zu vermeiden
  const buffer = 10;
  // Wenn der Abstand zum Boden größer als der Puffer ist, hat der User hochgescrollt
  isAutoScrolling.value = el.scrollHeight - el.scrollTop <= el.clientHeight + buffer;
};

const scrollToBottomManual = async () => {
  isAutoScrolling.value = true;
  await nextTick();
  const el = logContainer.value?.$el as HTMLElement | undefined;
  if (el) {
    el.scrollTop = el.scrollHeight;
  }
};

// auto scroll to latest line
watch(playbookLogs, () => {
  if (!isAutoScrolling.value) return;
  nextTick(() => {
    if (logContainer.value) {
      // Zugriff auf das native DOM-Element (bei Vuetify Komponenten evtl. .$el nutzen)
      const el = logContainer.value.$el as HTMLElement | undefined
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  });
}, { deep: true });

watch(primaryDisplay, async (newValue, oldValue) => {
  if (!newValue) return;
  console.log("changed primary display from", oldValue, "=>", newValue);
  if (primaryDisplay.value === secondaryDisplay.value) {
    secondaryDisplay.value = available_connectors.value.find(
      (item) => item.title != newValue
    )?.title;
    console.log(
      "changed primaryDisplay to ",
      newValue,
      "changed secondaryDisplay to",
      secondaryDisplay
    );
  }
  if (
    displayConfig.value &&
    displayOutputs.value &&
    primaryDisplay.value &&
    primaryDisplayResolution.value
  ) {
    console.log("xorgConfig.primary:", displayConfig.value.primary?.connector);
    // set the resolution and refreshrate according to the existing configuration if possible
    if (newValue === displayConfig.value.primary?.connector) {
      primaryDisplayResolution.value = displayConfig.value.primary.resolution;
      primaryDisplayRefreshRate.value = displayConfig.value.primary.refreshrate;
      console.log("use existing configuration for primary display");
    } else if (newValue === displayConfig.value.secondary?.connector) {
      primaryDisplayResolution.value = displayConfig.value.secondary.resolution;
      primaryDisplayRefreshRate.value = displayConfig.value.secondary.refreshrate;
      console.log("use existing configuration for secondary display");
    } else {
      primaryDisplayResolution.value =
        displayConfig.value.primary?.resolution
      primaryDisplayRefreshRate.value =
        displayConfig.value.primary?.refreshrate;
      console.log("fallback to default display", displayOutputs.value[newValue]);
    }
    console.log("changed primary resolution to", primaryDisplayResolution);
  }
});

watch(secondaryDisplay, async (newValue, oldValue) => {
  if (!newValue) return;
  console.log("watch secondaryDisplay", oldValue, "=>", newValue);
  if (
    displayConfig.value &&
    displayOutputs.value &&
    secondaryDisplay.value &&
    secondaryDisplayResolution.value
  ) {
    console.log("xorgConfig.secondary:", displayConfig.value.secondary?.connector);
    // set the resolution and refreshrate according to the existing configuration if possible
    if (newValue === displayConfig.value.primary?.connector) {
      secondaryDisplayResolution.value = displayConfig.value.primary.resolution;
      secondaryDisplayRefreshRate.value = displayConfig.value.primary.refreshrate;
      console.log("use existing configuration for primary display");
    } else if (newValue === displayConfig.value.secondary?.connector) {
      secondaryDisplayResolution.value = displayConfig.value.secondary.resolution;
      secondaryDisplayRefreshRate.value =
        displayConfig.value.secondary.refreshrate;
      console.log("use existing configuration for secondary display");
    } else {
      secondaryDisplayResolution.value =
        displayConfig.value?.secondary?.resolution;
      secondaryDisplayRefreshRate.value =
        displayConfig.value?.secondary?.refreshrate;
      console.log("fallback to default display", displayOutputs.value[newValue]);
    }
    console.log("changed secondary resolution to", primaryDisplayResolution);
  }
});

const setDisplayConfig = async () => {
  playbookLogs.value = []
  isSettingConfig.value = true;
  showLogDialog.value = true;
  PlaybookAction.value = t('actions.write_display_config')
  if (
    primaryDisplay.value &&
    primaryDisplayResolution.value &&
    primaryDisplayRefreshRate.value
  ) {
    isSettingConfig.value = true;
    const newXorgConfig: DisplayConfigInterface = (() => {
      if (
        secondaryDisplay.value &&
        secondaryDisplayResolution.value &&
        secondaryDisplayRefreshRate.value
      ) {
        return {
          primary: {
            connector: primaryDisplay.value,
            resolution: primaryDisplayResolution.value,
            refreshrate: primaryDisplayRefreshRate.value,
          },
          secondary: {
            connector: secondaryDisplay.value,
            resolution: secondaryDisplayResolution.value,
            refreshrate: secondaryDisplayRefreshRate.value,
          },
        };
      } else {
        return {
          primary: {
            connector: primaryDisplay.value,
            resolution: primaryDisplayResolution.value,
            refreshrate: primaryDisplayRefreshRate.value,
          }
        };
      }
    })();
    console.log("newXorgConfig:", newXorgConfig);
    // TODO: make the backend call
    try {
      const success = await backend.postRequestWithStreamingResponse('/system/xorg_config', newXorgConfig,
        processPlaybookOutput,
        (chunk) => console.log("finished playbook:", chunk)
      );
      console.log("got rescan displays result", success);
    } catch(e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      playbookLogs.value.push(`<span class="text-error">Fehler: ${errorMessage}</span>`);
    } finally {
      await updateDisplayConfig()
      isSettingConfig.value = false;
      // showLogDialog.value = false;
    }
  }
}
</script>

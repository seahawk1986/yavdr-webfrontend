<template>
  <v-card
    class="ma-2 pa-2 fill-height overflow-y-auto align-center"
    :disabled="isLookingForDisplays"
    :loading="isLookingForDisplays || isSettingConfig"
    prepend-icon="mdi-monitor-multiple"
    title="Display Configuration"
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
            >
              <template #title>
                Main Display
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
            v-if="secondaryDisplay"
            cols="12"
            sm="6"
          >
            <v-card
              class="ma-2 pa-2 w-100"
              variant="outlined"
            >
              <template #title>
                Secondary Display
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
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue";
import { useBackendStore } from "@/stores/backend";
import { useI18n } from "vue-i18n";
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
// const enableSecondaryDisplay: Ref<boolean> = ref(true);

const updateDisplayConfig = async () => {
  const xorg_config_response = await backend.getRequest("/system/display_config");
  if (xorg_config_response?.data) {
    displayConfig.value = xorg_config_response.data.display_config;
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

async function scanDisplays() {
  isLookingForDisplays.value = true;
  const result = await backend.postRequestWithStreamingResponse(
    "/system/playbook/rescan_displays",
    null,
    (data) => {
      console.log(data);
    },
    (chunk) => console.log("finished playbook:", chunk)
  );
  console.log("got rescan displays result", result);
  await updateDisplayConfig()
  isLookingForDisplays.value = false;
}

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
    const success = await backend.postRequestWithStreamingResponse('/system/xorg_config', newXorgConfig, (chunk) => {console.log("got chunk response:", chunk)}, () => {console.log("Setting xorg conf request finished")})
    console.log("success:", success)
    isSettingConfig.value = false;
  }
};
</script>

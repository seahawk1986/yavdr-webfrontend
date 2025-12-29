<template>
  <v-card
    class="ma-2"
    :disabled="isLookingForDisplays"
    :loading="isLookingForDisplays || isSettingConfig"
  >
    <template #title>
      <h1>Display Configuration</h1>
      <!-- </template>-->
    </template>
    <template #subtitle>
      <!--<template #actions> -->
      <!-- <v-container v-if="xorgFacts && xrandrFacts"> -->
      <!-- <v-row
          no-gutters
        >
          <v-col
            cols="12"
            sm="6"
          > -->

      <!-- TODO Button position - best if centered -->
      <v-btn
        class="px-5 mr-4"
        :disabled="isSettingConfig"
        :loading="isLookingForDisplays"
        prepend-icon="mdi-monitor-eye"
        color="primary"
        @click="scanDisplays()"
      >
        Rescan Displays
      </v-btn>
      <!-- </v-col>
        <v-col
          cols="12"
          sm="6"
        > -->
      <v-btn
        class="px-5"
        :disabled="isLookingForDisplays"
        :loading="isSettingConfig"
        prepend-icon="mdi-send"
        color="secondary"
        @click="setDisplayConfig()"
      >
        Apply Configuration
        <!-- TODO: how to save the configuration? -->
      </v-btn>
      <!-- </v-col>
        </v-row>
        </v-col> -->
      <!-- </v-container> -->
    </template>

    <template #text>
      <v-container v-if="xorgConfig && xrandrFacts">
        <v-row
          no-gutters
          justify="center"
        >
          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              class="flex-1-0 ma-2 pa-2 w-100"
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
                      xrandrFacts[primaryDisplay].modes[
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
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue";
import { useBackendStore } from "@/stores/backend";
const backend = useBackendStore();

interface XrandrModeList {
  [key: string]: number[];
}

interface XrandrDisplayInterface {
  connector: string;
  EDID: string;
  model: string;
  vendor: string;
  auto: string;
  current: string;
  is_connected: boolean;
  modelines: Map<string, string>;
  modes: XrandrModeList;
  preferred: string;
  preferred_resolution: string;
  preferred_refreshrate: number;
}

interface NestedXrandrDisplayInterface {
  [key: string]: XrandrDisplayInterface;
}

interface XorgMonitorConfigInterface {
  connector: string;
  resolution: string;
  refreshrate: number;
}

interface XorgConfigInterface {
  primary: XorgMonitorConfigInterface;
  secondary?: XorgMonitorConfigInterface;
}

// const xorgFacts: Ref<XorgDisplayMainInterface | undefined> = ref();
const xrandrFacts: Ref<NestedXrandrDisplayInterface | undefined> = ref();
const xorgConfig: Ref<XorgConfigInterface | undefined> = ref();
const primaryDisplay: Ref<string | undefined> = ref();
const secondaryDisplay: Ref<string | undefined> = ref();

const primaryDisplayResolution: Ref<string | undefined> = ref();
const primaryDisplayRefreshRate: Ref<number | undefined> = ref();
const secondaryDisplayResolution: Ref<string | undefined> = ref();
const secondaryDisplayRefreshRate: Ref<number | undefined> = ref();

const isLookingForDisplays: Ref<boolean> = ref(false);
const isSettingConfig: Ref<boolean> = ref(false);
// const enableSecondaryDisplay: Ref<boolean> = ref(true);

const updateXorgConfig = async () => {
  const xorg_config_response = await backend.getRequest("/system/xorg_config");
  if (xorg_config_response?.data) {
    xorgConfig.value = xorg_config_response.data;
    console.log("xorgConfig:", xorgConfig.value);
  }

  const xrandr_response = await backend.getRequest("/system/xrandr_facts");
  if (xrandr_response?.data) {
    xrandrFacts.value = xrandr_response.data.xrandr["Screen 0:"];
    console.log("xrandr facts:", xrandr_response.data);
  }

  if (xorgConfig?.value?.primary) {
    primaryDisplay.value = xorgConfig.value.primary.connector;
    primaryDisplayResolution.value = xorgConfig.value.primary.resolution;
    primaryDisplayRefreshRate.value = xorgConfig.value.primary.refreshrate;
  }
  if (xorgConfig?.value?.secondary) {
    secondaryDisplay.value = xorgConfig.value.secondary.connector;
    secondaryDisplayResolution.value = xorgConfig.value.secondary.resolution;
    secondaryDisplayRefreshRate.value = xorgConfig.value.secondary.refreshrate;
  }
};

onMounted(async () => {
  await updateXorgConfig()
});

const primaryDisplayResolutionOptions = computed(() => {
  if (xrandrFacts.value && primaryDisplay.value) {
    const resolutions = Object.keys(
      xrandrFacts.value[primaryDisplay.value].modes
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
  if (xrandrFacts.value) {
    return Object.entries(xrandrFacts.value)
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
  if (xrandrFacts.value && secondaryDisplay.value && xrandrFacts.value[secondaryDisplay.value]?.modes) {
    const resolutions = Object.keys(
      xrandrFacts.value[secondaryDisplay.value].modes
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
    xrandrFacts.value &&
    secondaryDisplay.value &&
    secondaryDisplayResolution.value
  ) {
    return xrandrFacts.value[secondaryDisplay.value].modes[
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
  await updateXorgConfig()
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
    xorgConfig.value &&
    xrandrFacts.value &&
    primaryDisplay.value &&
    primaryDisplayResolution.value
  ) {
    console.log("xorgConfig.primary:", xorgConfig.value.primary.connector);
    // set the resolution and refreshrate according to the existing configuration if possible
    if (newValue === xorgConfig.value.primary?.connector) {
      primaryDisplayResolution.value = xorgConfig.value.primary.resolution;
      primaryDisplayRefreshRate.value = xorgConfig.value.primary.refreshrate;
      console.log("use existing configuration for primary display");
    } else if (newValue === xorgConfig.value.secondary?.connector) {
      primaryDisplayResolution.value = xorgConfig.value.secondary.resolution;
      primaryDisplayRefreshRate.value = xorgConfig.value.secondary.refreshrate;
      console.log("use existing configuration for secondary display");
    } else {
      primaryDisplayResolution.value =
        xrandrFacts.value[newValue].preferred_resolution;
      primaryDisplayRefreshRate.value =
        xrandrFacts.value[newValue].preferred_refreshrate;
      console.log("fallback to default display", xrandrFacts.value[newValue]);
    }
    console.log("changed primary resolution to", primaryDisplayResolution);
  }
});

watch(secondaryDisplay, async (newValue, oldValue) => {
  if (!newValue) return;
  console.log("watch secondaryDisplay", oldValue, "=>", newValue);
  if (
    xorgConfig.value &&
    xrandrFacts.value &&
    secondaryDisplay.value &&
    secondaryDisplayResolution.value
  ) {
    console.log("xorgConfig.secondary:", xorgConfig.value.secondary?.connector);
    // set the resolution and refreshrate according to the existing configuration if possible
    if (newValue === xorgConfig.value.primary?.connector) {
      secondaryDisplayResolution.value = xorgConfig.value.primary.resolution;
      secondaryDisplayRefreshRate.value = xorgConfig.value.primary.refreshrate;
      console.log("use existing configuration for primary display");
    } else if (newValue === xorgConfig.value.secondary?.connector) {
      secondaryDisplayResolution.value = xorgConfig.value.secondary.resolution;
      secondaryDisplayRefreshRate.value =
        xorgConfig.value.secondary.refreshrate;
      console.log("use existing configuration for secondary display");
    } else {
      secondaryDisplayResolution.value =
        xrandrFacts.value[newValue].preferred_resolution;
      secondaryDisplayRefreshRate.value =
        xrandrFacts.value[newValue].preferred_refreshrate;
      console.log("fallback to default display", xrandrFacts.value[newValue]);
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
    const newXorgConfig: XorgConfigInterface = (() => {
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

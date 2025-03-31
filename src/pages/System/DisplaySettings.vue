<script setup lang="ts">
// TODO: use Backend to get monitor information
// TODO: choose defaults and switch secondary display
import { ref, type Ref } from "vue";
import { useBackendStore } from "@/stores/backend";
const backend = useBackendStore();

interface XorgDisplayInterface {
  connector: string;
  edid: string;
  mode: string;
  model: string;
  modelines: string[];
  refreshrate: number;
  resolution: string;
  vendor: string;
}

interface XorgDisplayMainInterface {
  primary: XorgDisplayInterface;
  secondary: XorgDisplayInterface;
}

interface XrandrModeList {
  [key: string]: number[];
}

interface XrandrDisplayInterface {
  EDID: string;
  model: string;
  vendor: string;
  auto: string;
  current: string;
  is_connected: boolean;
  modelines: Map<string, string>;
  modes: XrandrModeList;
  preferred: string;
}

interface NestedXrandrDisplayInterface {
  [key: string]: XrandrDisplayInterface;
}

const xorgFacts: Ref<XorgDisplayMainInterface | undefined> = ref();
const xrandrFacts: Ref<NestedXrandrDisplayInterface | undefined> = ref();
const primaryDisplay: Ref<string | undefined> = ref();
const secondaryDisplay: Ref<string | undefined> = ref();

const primaryDisplayResolution: Ref<string | undefined> = ref();
const primaryDisplayRefreshRate: Ref<number | undefined> = ref();
const secondaryDisplayResolution: Ref<string | undefined> = ref();
const secondaryDisplayRefreshRate: Ref<number | undefined> = ref();

const isLookingForDisplays: Ref<boolean> = ref(false);
// const enableSecondaryDisplay: Ref<boolean> = ref(true);

onMounted(async () => {
  const xorg_response = await backend.getRequest("/system/xorg_facts");
  if (xorg_response?.data) {
    xorgFacts.value = xorg_response.data.xorg;
    if (xorgFacts.value?.primary) {
      primaryDisplay.value = xorgFacts.value?.primary.connector;
      primaryDisplayResolution.value = xorgFacts.value?.primary.resolution;
      primaryDisplayRefreshRate.value = xorgFacts.value?.primary.refreshrate;
    }
    if (xorgFacts.value?.secondary) {
      secondaryDisplay.value = xorgFacts.value?.secondary.connector;
      secondaryDisplayResolution.value = xorgFacts.value?.secondary.resolution;
      secondaryDisplayRefreshRate.value =
        xorgFacts.value?.secondary.refreshrate;
    }
  }
  const xrandr_response = await backend.getRequest("/system/xrandr_facts");
  if (xrandr_response?.data) {
    xrandrFacts.value = xrandr_response.data.xrandr["Screen 0:"];
    console.log("xrandr facts:", xrandr_response.data);
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
  connectors.push({ title: '', subtitle: "no second display" });
  return connectors;
});

const secondaryDisplayResolutionOptions = computed(() => {
  if (xrandrFacts.value && secondaryDisplay.value) {
    const resolutions = Object.keys(xrandrFacts.value[secondaryDisplay.value].modes)
    resolutions.sort(
      (a, b) => - Number(a.split('x')[0]) + Number(b.split('x')[0])
    ) // Sort the resolutions numerically
    return resolutions
  } else {
    return []
  }
});

const secondaryDisplayRefreshrateOptions = computed(() => {
  if (xrandrFacts.value && secondaryDisplay.value && secondaryDisplayResolution.value) {
    return xrandrFacts.value[secondaryDisplay.value].modes[secondaryDisplayResolution.value]
  } else {
    return []
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
  isLookingForDisplays.value = false;
}
</script>

<template>
  <v-card
    class="ma-2"
    :disabled="isLookingForDisplays"
  >
    <template #title>
      <h1>Display Configuration</h1>
    </template>

    <template #text>
      <v-container v-if="xorgFacts && xrandrFacts">
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
                  @update:model-value="((value: string) => {
                    if (primaryDisplay === secondaryDisplay) {
                      secondaryDisplay = available_connectors.find((item) => item.title != value)?.title
                    }
                  })"
                />
                <div v-if="primaryDisplay">
                  <!-- Modes: {{ Object.keys(xrandrFacts[primaryDisplay].modes) }} -->
                  <v-select
                    v-model="primaryDisplayResolution"
                    :items="Object.keys(xrandrFacts[primaryDisplay].modes)"
                    @update:model-value="((value: number) => {
                      if ((xrandrFacts && primaryDisplay && primaryDisplayRefreshRate) &&!xrandrFacts[primaryDisplay].modes[value].includes(primaryDisplayRefreshRate) ) {
                        primaryDisplayRefreshRate = xrandrFacts[primaryDisplay].modes[value][0]
                      }
                    })"
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
              class="ma-2 pa-2"
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
                  :disabled="secondaryDisplayResolutionOptions.length==0"
                />
                <v-select
                  v-model="secondaryDisplayRefreshRate"
                  :disabled="secondaryDisplayRefreshrateOptions.length==0"
                  :items="secondaryDisplayRefreshrateOptions"
                />
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template #actions>
      <v-container v-if="xorgFacts && xrandrFacts">
        <v-row
          no-gutters
          justify="space-between"
        >
          <v-col
            cols="12"
            sm="6"
          >
            <!-- TODO Button position - best if centered -->
            <v-btn
              class="px-5"
              :loading="isLookingForDisplays"
              prepend-icon="mdi-monitor-eye"
              color="primary"
              @click="scanDisplays()"
            >
              Rescan Displays
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-btn
              class="px-5"

              :disabled="isLookingForDisplays"
              prepend-icon="mdi-send"
              color="secondary"
            >
              Apply Configuration
            <!-- TODO: how to save the configuration? -->
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-card>
</template>

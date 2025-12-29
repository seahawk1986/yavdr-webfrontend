<template>
  <v-card
    class="scrollable-container overflow-auto"
    :height="height - store.titlebarHeight"
  >
    <v-card-item>
      <v-card-title>
        VDR Plugins
        <v-btn
          prepend-icon="mdi-reload"
          @click="loadPlugins()"
        >
          {{ $t("actions.reload") }}
        </v-btn>
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <v-expansion-panels
        class="mb-6"
        variant="popout"
      >
        <v-expansion-panel
          v-for="plugin in sortedPluginConfig"
          :key="plugin.name"
          focusable
          density="compact"
        >
          <v-expansion-panel-title
            :aria-label="plugin.name"
            class="my-0 py-0"
          >
            <!-- <v-btn prepend-icon="mdi-pencil" text="edit"/> -->
            <v-switch
              v-model="plugin.enabled"
              :aria-label="
                plugin.enabled
                  ? `Disable ${plugin.name}`
                  : `Enable ${plugin.name}`
              "
              class="ml-2 mb-n4"
              color="success"
              :label="plugin.name"
              inset
              :center-affix="true"
              density="compact"
              @click.stop="plugin.enabled = !plugin.enabled"
            />
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-container>
              <v-row>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-textarea
                    v-model="plugin.arguments"
                    class="monospace"
                    :label="`[${plugin.name}]`"
                    rows="10"
                    variant="outlined"
                    hide-details="auto"
                  />
                  <div class="pa-4 text-center">
                    <v-btn
                      class="text-none ma-2"
                      color="primary"
                      min-width="92"
                      variant="outlined"
                      rounded
                      :disabled="
                        plugin.arguments === originalArgs.get(plugin.name)
                      "
                      prepend-icon="mdi-send"
                      @click="
                        store.postRequest('/vdr/plugin_config', {
                          name: plugin.name,
                          priority: plugin.prio,
                          arguments: plugin.arguments,
                          enabled: plugin.enabled,
                        })
                      "
                    >
                      {{ $t("actions.saveChanges") }}
                    </v-btn>
                    <!-- <v-divider
                      vertical
                      thickness="10"
                      opacity="0"
                    /> -->
                    <v-btn
                      color="red-darken-4"
                      min-width="92"
                      variant="outlined"
                      :disabled="
                        plugin.arguments === originalArgs.get(plugin.name)
                      "
                      rounded
                      prepend-icon="mdi-restore"
                      @click="plugin.arguments = originalArgs.get(plugin.name)"
                    >
                      {{ $t("actions.reset") }}
                    </v-btn>
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-textarea
                    v-model="plugin.help"
                    class="monospace"
                    label="Help"
                    rows="10"
                    variant="outlined"
                    hide-details="auto"
                    readonly
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useBackendStore } from "@/stores/backend";
import { onMounted, ref, type Ref } from "vue";
import { useDisplay } from "vuetify";

const { height } = useDisplay();

const store = useBackendStore();

interface VDRPlugin {
  name: string;
  version: string;
  // priority: number
  // config: string
  // config_file: string
  // isEnabled: boolean
}

interface argumentFile {
  filename: string;
  arguments: string;
}

interface vdrPluginConfig {
  pluginName: string;
  enable: boolean;
  static: boolean;
  argumentFiles: argumentFile[];
}

interface PluginConfig {
  name: string;
  enabled: boolean;
  prio: number;
  arguments: string;
  help: string;
}

const originalArgs = new Map();

const vdrPlugins: Ref<Array<VDRPlugin>> = ref([]);
const vdrPluginConfig: Ref<PluginConfig[]> = ref([]);

async function loadPlugins() {
  {
    const response = await store.getRequest("/vdr/plugins");
    if (response) {
      console.log("Plugins:", response.data);
      vdrPlugins.value = response.data;
    }
  }
  const response = await store.getRequest("/vdr/plugin_config");
  if (response) {
    const config = response.data;
    console.log("Plugin Config:", response.data);

    config.map((item: PluginConfig) => {
      originalArgs.set(item.name, item.arguments);
    });
    vdrPluginConfig.value = config;
  }
}

const sortedPluginConfig = computed(() => {
  return vdrPluginConfig.value.sort((a, b) => a.name.localeCompare(b.name));
});

onMounted(() => {
  loadPlugins();
});
</script>


<style scoped>
.monospace {
  font-family: monospace;
  text-wrap-style: balance;
}
</style>

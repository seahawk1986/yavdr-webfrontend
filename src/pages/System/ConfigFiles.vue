<template>
  <v-sheet fill-horizonal height="100%">
    <v-container fluid>
      <v-row density="comfortable">
        <v-col
          v-for="config in existingConfigFiles"
          :key="config.filename"
          cols="12"
          md="4"
          sm="6"
        >
          <v-card
            :prepend-icon="config.icon"
            :title="config.filename"
            class="d-flex flex-column fill-height"
          >
            <v-card-text class="fill-height">
              {{ t(config.description) }}
            </v-card-text>

            <v-card-actions class="mt-auto">
              <v-btn
                prepend-icon="mdi-pencil"
                @click="config.showEditor = true"
              >
                Edit
              </v-btn>
            </v-card-actions>
          </v-card>
          <v-dialog
            v-model="config.showEditor"
            persistent
            fullscreen
            scrollable
          >
            <FileEditor
              :fileconfig="config"
              height="80vh"
              @abort="config.showEditor = false"
              @saved="config.showEditor = false"
            />
          </v-dialog>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script lang="ts" setup>
import type { configFileInterface } from "@/components/FileEditor/interfaces";
import { useBackendStore } from "@/stores/backend";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const backend = useBackendStore();

const existingConfigFileSet: Ref<Set<string>> = ref(new Set());

const configurationFiles: Ref<configFileInterface[]> = ref([
  {
    filename: "/etc/avahi-linker/default.cfg",
    url: "system/configfile",
    title: "avahi-linker",
    description: "descriptions.avahi-linker",
    icon: "mdi-link-box",
    showEditor: false,
  },
  {
    filename: "/etc/yavdr-frontend/config.yml",
    url: "system/configfile",
    title: "yavdr-frontend",
    description: "descriptions.yavdr-frontend",
    icon: "mdi-monitor-dashboard",
    showEditor: false,
  },
  {
    filename: "/etc/vdr/vdr-addon-acpiwakeup.conf",
    url: "system/configfile",
    title: "vdr-addon-acpiwakeup",
    description: "descriptions.acpiwakeup",
    icon: "mdi-clock-fast",
    showEditor: false,
  },

  {
    filename: "/etc/vdr/vdr-addon-stm32irmp-wakeup.conf",
    url: "system/configfile",
    title: "vdr-addon-stm32irmp-wakeup",
    description: "descriptions.stm32_wakeup",
    icon: "mdi-clock-fast",
    showEditor: false,
  },

  {
    filename: "/etc/vdr/vdr-addon-picoirmp-wakeup.conf",
    url: "system/configfile",
    title: "irmpalarm",
    description: "descriptions.picoirmp_wakeup",
    icon: "mdi-clock-fast",
    showEditor: false,
  },
  {
    filename: "/etc/lifeguard.conf",
    url: "system/configfile",
    title: "lifeguard",
    description: "descriptions.lifeguard",
    icon: "mdi-lifebuoy",
    showEditor: false,
  },
  {
    filename: "/etc/lifeguard.yml",
    url: "system/configfile",
    title: "lifeguard-ng",
    description: "descriptions.lifeguard-ng",
    icon: "mdi-lifebuoy",
    showEditor: false,
  },
]);

const existingConfigFiles = computed(() => {
  return configurationFiles.value.filter((data) => {
    if (existingConfigFileSet.value.has(data.filename)) return data;
  });
});

onMounted(async () => {
  try {
    const r = await backend.getRequest("/system/configfiles");
    if (r) {
      existingConfigFileSet.value = new Set(r.data);
    }
  } catch (error) {
    console.log("getting list of existing configuration files failed:", error);
  }
});
</script>

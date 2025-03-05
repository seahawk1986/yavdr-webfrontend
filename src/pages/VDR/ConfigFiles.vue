<template>
  <v-sheet
    fill-horizonal
    :height="height - store.titlebarHeight"
  >
    <v-container
      fluid
    >
      <v-row dense>
        <v-col
          v-for="config in configurationFiles"
          :key="config.filename"
          cols="12"
          md="4"
          sm="6"
        >
          <v-card
            :prepend-icon="config.icon"
            :title="config.filename"
            :min-height="180"
          >
            <v-card-text>
              {{ config.description }}
            </v-card-text>
            <v-card-actions>
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
import type { configFileInterface } from '@/components/FileEditor/interfaces';
import { useBackendStore } from '@/stores/backend';
import { useDisplay } from "vuetify";

const store = useBackendStore()
const {height} = useDisplay()
// import { useI18n } from 'vue-i18n';
// const { t } = useI18n()



const configurationFiles: Ref<configFileInterface[]> = ref([
  {
    filename: "channels.conf",
    url: "vdr/configfile",
    title: "channels.conf",
    description: "Channel entries for VDR",
    icon: "mdi-list-box",
    showEditor: false,
  },
  {
    filename: "remote.conf",
    url: "vdr/configfile",
    title: "remote.conf",
    description: "Remote control entries for VDR. Be aware that yaVDR uses a special naming scheme.",
    icon: "mdi-remote-tv",
    showEditor: false,
  },
  {
    filename: "keymacros.conf",
    url: "vdr/configfile",
    title: "keymacros.conf",
    description: "Map remote control button presses to VDR actions",
    icon: "mdi-keyboard",
    showEditor: false,
  },
  {
    filename: "diseqc.conf",
    url: "vdr/configfile",
    title: "diseqc.conf",
    description: "Advanced LNB configuration",
    icon: "mdi-satellite-variant",
    showEditor: false,
  },
  {
    filename: "sources.conf",
    url: "vdr/configfile",
    title: "sources.conf",
    description: "Map satellite positions",
    icon: "mdi-satellite-uplink",
    showEditor: false,
  },
  {
    filename: "setup.conf",
    url: "vdr/configfile",
    title: "setup.conf",
    description: "VDR settings",
    icon: "mdi-cog",
    showEditor: false,
  },
  {
    filename: "plugins/menuorg.xml",
    url: "vdr/configfile",
    title: "plugins/menuorg.xml",
    description: "menuorg configuration",
    icon: "mdi-list-box-outline",
    showEditor: false,
  },

])
</script>
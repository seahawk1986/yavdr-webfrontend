<template>
  <v-sheet
    fill-horizonal
    height="100%"
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
            class="d-flex flex-column fill-height"
          >
            <v-card-text class="fill-height">
              {{ config.description }}
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
import type { configFileInterface } from '@/components/FileEditor/interfaces';
import { useI18n } from 'vue-i18n';


const { t } = useI18n()



const configurationFiles: Ref<configFileInterface[]> = ref([
  {
    filename: "channels.conf",
    url: "vdr/configfile",
    title: "channels.conf",
    description: t("descriptions.channels_conf"),
    icon: "mdi-list-box",
    showEditor: false,
  },
  {
    filename: "remote.conf",
    url: "vdr/configfile",
    title: "remote.conf",
    description: t("descriptions.remote_conf"),
    icon: "mdi-remote-tv",
    showEditor: false,
  },
  {
    filename: "keymacros.conf",
    url: "vdr/configfile",
    title: "keymacros.conf",
    description: t("descriptions.keymacros_conf"),
    icon: "mdi-keyboard",
    showEditor: false,
  },
  {
    filename: "diseqc.conf",
    url: "vdr/configfile",
    title: "diseqc.conf",
    description: t("descriptions.diseqc_conf"),
    icon: "mdi-satellite-variant",
    showEditor: false,
  },
  {
    filename: "sources.conf",
    url: "vdr/configfile",
    title: "sources.conf",
    description: t("descriptions.sources_conf"),
    icon: "mdi-satellite-uplink",
    showEditor: false,
  },
  {
    filename: "setup.conf",
    url: "vdr/configfile",
    title: "setup.conf",
    description: t("descriptions.setup_conf"),
    icon: "mdi-cog",
    showEditor: false,
  },
  {
    filename: "menuorg.xml",
    url: "vdr/configfile",
    title: "plugins/menuorg.xml",
    description: t("descriptions.menuorg_xml"),
    icon: "mdi-list-box-outline",
    showEditor: false,
  },

])
</script>

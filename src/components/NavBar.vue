<template>
  <v-navigation-drawer
    v-model:model-value="store.showNavigation"
  >
    <v-list>
      <v-list-item
        prepend-icon="mdi-home"
        to="/"
        title="Home"
      />
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        to="/dashboard"
        :title="t('systeminfo.SystemInfo')"
      />
      <!-- <v-list-item
        prepend-icon="mdi-cog"
        to="/system/settings"
        title="System"
        subtitle="Settings"
      /> -->
      <!-- <v-list-item
        prepend-icon="mdi-tune"
        to="/vdr/setup"
        title="VDR"
        subtitle="Settings"
      /> -->
      <v-divider />
      <v-list-item
        prepend-icon="mdi-monitor"
        to="/system/DisplaySettings"
        title="Display"
      />
      <v-list-item
        prepend-icon="mdi-speaker"
        to="/system/AudioSettings"
        :title="t('category.audioSettings')"
      />
      <v-list-item
        prepend-icon="mdi-link-box"
        link
        title="Avahi-Linker"
      />
      <v-list-item
        prepend-icon="mdi-power"
        link
        title="Power Settings"
      />
      <v-divider />
      <v-divider />
      <!-- <v-list-item
        prepend-icon="mdi-playlist-edit"
        to="/vdr/channels"
        title="Channels"
      /> -->
      <v-list-item
        prepend-icon="mdi-playlist-edit"
        to="/vdr/ChannelpediaEditor"
        title="Channelpedia"
      />
      <v-list-item 
        prepend-icon="mdi-list-box-outline"
        to="/VDR/EPGViewer"
        title="VDR EPG"
      />
      <v-list-item
        prepend-icon="mdi-code-braces"
        to="/vdr/ConfigFiles"
        title="VDR Config files"
      />
      <v-list-item
        prepend-icon="mdi-code-braces"
        to="/vdr/SetupEditor"
        title="Setup"
      />
      <v-list-item
        prepend-icon="mdi-toy-brick"
        to="/vdr/PluginSettings"
        title="Plugins"
      />
      <v-list-item
        prepend-icon="mdi-list-box-outline"
        to="/System/LogViewer"
        title="Syslog"
      />
      <v-list-item
        prepend-icon="mdi-upload"
        to="/System/UploadFile"
        title="Upload file"
      />
      <!-- <v-list-item
        prepend-icon="mdi-video-input-component"
        to="/system/yavdr-frontend"
        title="yaVDR Frontend"
      /> -->
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
  import { useBackendStore } from "@/stores/backend"
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
  const store = useBackendStore()

</script>
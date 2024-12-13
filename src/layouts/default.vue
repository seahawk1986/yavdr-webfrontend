<template>
  <v-app>
    <v-app-bar
      :elevation="2"
      scrim
      :location="$vuetify.display.mobile ? 'bottom' : undefined"
    >
      <template #prepend>
        <v-app-bar-nav-icon
          variant="text"
          :aria-label="t('actions.openNavbar')"
          @click.stop="showNavigation = !showNavigation"
        />
        <v-btn
          icon="mdi-remote-tv"
          :color="showRemote ? 'primary' : 'white'"
          @click="showRemote=!showRemote"
        />
      </template>

      <v-app-bar-title>yaVDR</v-app-bar-title>
      <!-- <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav> -->

      <template #append>
        <RemoteIconButton
          name="Power"
          tooltip="Send Power Button press to VDR"
          icon-name="mdi-power"
          keyname="KEY_POWER2"
          icon-color="red"
        />
        <v-btn
          icon="mdi-logout"
          aria-label="Logout"
          @click="store.logout()"
        />

        <!-- <v-btn icon="mdi-magnify"></v-btn> -->

        <!-- <v-btn icon="mdi-dots-vertical"></v-btn> -->
      </template>
    </v-app-bar>
    <v-navigation-drawer
      v-model:model-value="showNavigation"
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
          title="System Info"
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
          title="Audio"
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
    <v-main>
      <LoginMask v-if="!store.hasToken" />
      <RemoteControl v-else-if="showRemote" />
      <router-view v-else />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { useDisplay } from 'vuetify'
  import { useI18n } from "vue-i18n";
  import { onMounted } from 'vue'
  import { useBackendStore } from '@/stores/backend'
  
  import RemoteIconButton from '@/components/remote/RemoteIconButton.vue'
  import RemoteControl from '@/components/RemoteControl.vue'
  
  const { t } = useI18n();
  const store = useBackendStore()
  store.isOnMobile = useDisplay().mobile.value

  const showNavigation: Ref<boolean> = ref(false)
  const showRemote: Ref<boolean> = ref(false)

  onMounted(() => {
    console.log("App runs on a mobile device:", store.isOnMobile) // false
  })
</script>

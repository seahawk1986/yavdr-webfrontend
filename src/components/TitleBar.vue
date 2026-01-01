<template>
  <v-app-bar
    id="appbar"
    :elevation="2"
    scrim
  >
    <template #prepend>
      <v-app-bar-nav-icon
        variant="text"
        :aria-label="t('actions.openNavbar')"
        @click.stop="store.showNavigation = !store.showNavigation"
      />
    </template>
    <v-app-bar-title text="yaVDR Webfrontend" />
    <!-- <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav> -->

    <template #append>
      <v-btn
        v-tooltip="ui.showRemote ? 'Hide remote': 'Show remote'"
        :aria-label="ui.showRemote ? t('remote.hideRemote') : t('remote.showRemote')"
        icon="mdi-remote-tv"
        :color="ui.showRemote ? 'primary' : 'secondary'"
        @click="ui.showRemote=!ui.showRemote"
      />

      <RemoteIconButton
        name="Power"
        tooltip="Power Button"
        :aria-label="t('actions.shutdown')"
        icon-name="mdi-power"
        keyname="KEY_POWER2"
        icon-color="red"
      />
      <v-speed-dial
        location="top center"
        transition="fade-transition"
      >
        <template #activator="{ props: activatorProps }">
          <v-fab
            v-bind="activatorProps"
            :aria-label="t('descriptions.additionalActions')"
            size="default"
            icon="mdi-dots-vertical"
          />
        </template>

        <v-icon-btn
          key="1"
          v-tooltip="t('actions.logout')"
          icon="mdi-logout"
          color="warning"
          :aria-label="t('actions.logout')"
          @click="store.logout()"
        />
        <v-btn
          key="2"
          v-tooltip="t('language.selectLanguage')"
          :aria-label="t('language.selectLanguage')"
          icon="mdi-translate-variant"
          @click="store.showLanguageOverlay = true"
        />
      </v-speed-dial>

      <!-- <v-btn icon="mdi-magnify"></v-btn> -->

      <!-- <v-btn icon="mdi-dots-vertical"></v-btn> -->
    </template>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useBackendStore } from '@/stores/backend';
import { useUIStore } from '@/stores/ui';

const { t } = useI18n()
const store = useBackendStore()
const ui = useUIStore()

</script>

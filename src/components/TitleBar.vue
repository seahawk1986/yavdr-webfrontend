<template>
  <v-app-bar
    id="appbar"
    :elevation="2"
    scrim
    :location="$vuetify.display.mobile ? 'bottom' : undefined"
  >
    <template #prepend>
      <v-app-bar-nav-icon
        variant="text"
        :aria-label="t('actions.openNavbar')"
        @click.stop="store.showNavigation = !store.showNavigation"
      />
      <v-btn
        :aria-label="store.showRemote ? t('remote.hideRemote') : t('remote.showRemote')"
        icon="mdi-remote-tv"
        :color="store.showRemote ? 'primary' : 'white'"
        @click="store.showRemote=!store.showRemote"
      />
    </template>
    <v-app-bar-title text="yaVDR" />
    <!-- <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav> -->

    <template #append>
      <LanguageSwitcher />
      <RemoteIconButton
        name="Power"
        tooltip="Send Power Button press to VDR"
        :aria-label="t('actions.shutdown')"
        icon-name="mdi-power"
        keyname="KEY_POWER2"
        icon-color="red"
      />
      <v-btn
        icon="mdi-logout"
        :aria-label="t('actions.logout')"
        @click="store.logout()"
      />

      <!-- <v-btn icon="mdi-magnify"></v-btn> -->

      <!-- <v-btn icon="mdi-dots-vertical"></v-btn> -->
    </template>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useBackendStore } from '@/stores/backend';

const { t } = useI18n()
const store = useBackendStore()


</script>

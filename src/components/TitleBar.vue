<template>
  <v-app-bar
    id="appbar"
    app
    :elevation="2"
    class="mx-auto"
    scroll-behavior="fully-hide"
    density="compact"
    scroll-target=""
  >
    <template #prepend>
      <v-app-bar-nav-icon
        variant="text"
        :aria-label="t('actions.openNavbar')"
        density="compact"
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
      <RemoteIconButton
        name="Power"
        tooltip="Power Button"
        :aria-label="t('actions.shutdown')"
        icon-name="mdi-power"
        keyname="KEY_POWER2"
        color="red"
        variant="tonal"
        :size="null"
      />
      <v-divider
        vertical
        thickness="5px"
        opacity="0"
      />
      <v-btn
        v-tooltip="ui.showRemote ? 'Hide remote': 'Show remote'"
        :aria-label="ui.showRemote ? t('remote.hideRemote') : t('remote.showRemote')"
        icon="mdi-remote-tv"
        :color="ui.showRemote ? 'primary' : 'secondary'"
        @click="ui.showRemote=!ui.showRemote"
      />
      <v-divider
        vertical
        thickness="5px"
        opacity="0"
      />
      <v-speed-dial
        location="top center"
        transition="fade-transition"
      >
        <template #activator="{ props: activatorProps }">
          <v-fab
            v-bind="activatorProps"
            :aria-label="t('descriptions.additionalActions')"
            size="small"
            icon="mdi-dots-vertical"
            variant="flat"
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

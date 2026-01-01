<template>
  <v-app class="rounded rounded-md border">
    <TitleBar />
    <NavBar />
    <notification-queue-display />

    <v-main
      class="d-flex flex-column w-100"
      style="height: 100dvh; position: relative;"
    >
      <router-view />
      <RemoteOverlay />
    </v-main>
    <LoginOverlay />
    <LanguageOverlay />
  </v-app>
</template>



<script lang="ts" setup>
  import { useDisplay } from 'vuetify'
  // import { useI18n } from "vue-i18n";
  import { onMounted, } from 'vue'
  import { useBackendStore } from '@/stores/backend'

  import NavBar from '@/components/NavBar.vue';

  // const { t } = useI18n();
  const store = useBackendStore()
  const { height, mobile } = useDisplay()
  store.isOnMobile = mobile.value


  onMounted(async () => {
    //   consolse.log("App runs on a mobile device:", store.isOnMobile) // false
    const titlebarHeight = document.getElementById('titlebar')?.clientHeight
    if (titlebarHeight) {
      store.titlebarHeight = titlebarHeight
      store.mainAreaHeight = height.value - titlebarHeight
    }
  })

</script>

<style lang="css" scoped>
  .main-overlay-container {
  position: relative;
  height: 100%;
  width: 100%;
}

</style>

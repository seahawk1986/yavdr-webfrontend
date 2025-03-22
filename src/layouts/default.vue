<template>
  <TitleBar id="titlebar" />
  <NavBar />
  <notification-queue-display />
  <v-main>
    <router-view
      v-slot="{ Component }"
    >
      <keep-alive>
        <component
          :is="getView(Component)"
          id="mainArea"
        />
      </keep-alive>
    </router-view>
  </v-main>
</template>

<script lang="ts" setup>
  import { useDisplay } from 'vuetify'
  // import { useI18n } from "vue-i18n";
  import { onMounted, type RendererElement, type RendererNode } from 'vue'
  import { useBackendStore } from '@/stores/backend'

  import NavBar from '@/components/NavBar.vue';
  import RemoteControl from '@/components/RemoteControl.vue'
  import LoginMask from '@/components/LoginMask.vue'

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

 function getView(Component: globalThis.VNode<RendererNode, RendererElement, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}>) {
    if (!store.hasToken) {
      return LoginMask
    } else if (store.showRemote) {
      return RemoteControl
    } else {
      return Component
    }
  }
</script>

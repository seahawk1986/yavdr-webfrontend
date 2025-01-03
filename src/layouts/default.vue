<template>
  <v-app>
    <TitleBar />
    <NavBar />
    <v-main>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="getView(Component)" />
        </keep-alive>
      </router-view>
    </v-main>
  </v-app>
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
  store.isOnMobile = useDisplay().mobile.value

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

  onMounted(() => {
    console.log("App runs on a mobile device:", store.isOnMobile) // false
  })
</script>

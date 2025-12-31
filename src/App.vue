<template>
  <router-view v-slot="{ Component, route }">
    <transition
      name="slide"
      mode="out-in"
    >
      <component
        :is="Component"
        :key="route.fullPath"
      />
    </transition>
  </router-view>
</template>

<script setup lang="ts">

import { useLocale } from 'vuetify'
const { current } = useLocale()

onMounted(() => {
  document.documentElement.setAttribute('lang', current.value) // for some reason this is needed
})

</script>

<style lang="css">
  html, body {
  overflow: hidden !important;
  height: 100%;
}
</style>

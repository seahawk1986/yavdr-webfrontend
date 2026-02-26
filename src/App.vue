<template>
  <router-view />
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
const { current } = useLocale();

onMounted(() => {
  document.documentElement.setAttribute("lang", current.value); // for some reason this is needed
});
</script>

<style lang="css">
/* Enable page scrolling ONLY on mobile */
@media (max-width: 599px) {
  html,
  body {
    overflow-y: auto !important;
    height: auto !important; /* Critical to let the page grow */
  }
}

/* Keep internal scrolling for desktop */
@media (min-width: 600px) {
  html,
  body {
    overflow: hidden !important;
  }
}
/* allow for overriding the scroll lock */
.lock-scroll {
  overflow: hidden !important;
  height: 100dvh !important;
  position: fixed; /* Extra security for iOS mobile browsers */
  width: 100%;
}
</style>

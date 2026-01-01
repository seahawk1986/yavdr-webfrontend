<script setup lang="ts">
import { useUIStore } from '@/stores/ui';

const ui = useUIStore()


</script>

<template>
  <v-dialog
    v-model="ui.showRemote"
    contained
    persistent
    scroll-strategy="block"
    class="remote-overlay d-flex align-center justify-center bg-background pa-0 ma-0"
    style="z-index: 1000;"
  >
    <RemoteControl
      class="pa-0 ma-0"
      style="position: relative; top: 4dvh;"
    />
  </v-dialog>
</template>

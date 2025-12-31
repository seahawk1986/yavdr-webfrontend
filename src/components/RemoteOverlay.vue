<script setup lang="ts">
import { useUIStore } from '@/stores/ui';

const ui = useUIStore()
</script>

<template>
  <div
    v-if="ui.showRemote"
    class="remote-overlay bg-background"
  >
    <RemoteControl />
</div>
</template>

<style lang="css" scoped>
.remote-overlay {
  position: absolute;
  inset: 0;              /* cover only v-main */
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: auto;
  overscroll-behavior: contain;
}
</style>

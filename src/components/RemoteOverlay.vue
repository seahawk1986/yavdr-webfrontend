<script setup lang="ts">
import { useUIStore } from '@/stores/ui';

const ui = useUIStore()


</script>

<template>
  <v-dialog
    v-model="ui.showRemote"
    :fullscreen="true"

    color=""
  >
    <v-sheet
      class="ma-0 pa-0 ga-0 d-flex flex-column justify-center align-center fill-height"
    >
      <RemoteControl />
    </v-sheet>
  </v-dialog>
</template>

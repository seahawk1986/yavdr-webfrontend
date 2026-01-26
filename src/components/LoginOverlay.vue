<script setup lang="ts">
import { useBackendStore } from '@/stores/backend';

const backend = useBackendStore()
</script>

<template>
  <v-dialog
    v-model="backend.requiresLogin"
    persistent
    :fullscreen="true"
    class="ma-0 pa-0"
    color=""
  >
    <v-sheet class="d-flex justify-center align-center">
      <LoginMask
        max-width="420"
        class="ma-0 pa-0"
      />
    </v-sheet>
  </v-dialog>
</template>

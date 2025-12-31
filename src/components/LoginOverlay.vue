<script setup lang="ts">
import { useBackendStore } from '@/stores/backend';

const backend = useBackendStore()
</script>

<template>
  <v-dialog
    v-model="backend.requiresLogin"
    persistent
    max-width="420"
  >
    <LoginMask />
  </v-dialog>
</template>

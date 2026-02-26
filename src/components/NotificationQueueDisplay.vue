<template>
  <v-snackbar-queue
    v-model="notifications.messages"
    :closable="true"
    collapsed
    close-text="Close"
    color="primary"
  >
  </v-snackbar-queue>
</template>

<script lang="ts" setup>
import { useNotificationStore } from "@/stores/notifications";
const notifications = useNotificationStore();
</script>

<template>
  <div>
    <v-snackbar-queue
      :v-model="notifications.messages"
      :closable="true"
      close-text="Close"
      color="primary"
    >
    <!-- how to place text? -->
    </v-snackbar-queue>
  </div>
</template>

<script lang="ts" setup>
import { useNotificationStore } from '@/stores/notifications';
const notifications = useNotificationStore()
</script>
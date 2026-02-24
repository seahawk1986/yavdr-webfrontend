<template>
  <v-card>
    <v-card-title>Shutdown & Reboot</v-card-title>
    <v-card-text>
      <v-icon-btn
        v-tooltip="'Poweroff'"
        icon="mdi-power"
        color="red"
        :loading="shuttingDown"
        @click="poweroff"
      />
      <v-divider vertical thickness="20" opacity="0"></v-divider>
      <v-icon-btn
        v-tooltip="'Reboot'"
        icon="mdi-restart"
        color="green"
        :loading="restarting"
        @click="restart"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useBackendStore } from "@/stores/backend";
const backend = useBackendStore();

const shuttingDown = ref(false);
const restarting = ref(false);

async function restart() {
  restarting.value = true;
  try {
    await backend.postRequest("/system/power/restart", {});
  } catch (error) {
    console.log("could not send restart request:", error);
  } finally {
    restarting.value = false;
  }
}

async function poweroff() {
  shuttingDown.value = true;
  try {
    await backend.postRequest("/system/power/poweroff", {});
  } catch (error) {
    console.log("could not send poweroff request:", error);
  } finally {
    shuttingDown.value = false;
  }
}
</script>

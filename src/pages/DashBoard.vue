<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
import { onMounted, onUnmounted } from 'vue'
import MemoryInfo from '@/components/MemoryInfo.vue'
import CpuUsageCard from '@/components/CpuUsageInfo.vue'
import DiscUsageInfo from '@/components/DiscUsageInfo.vue'
import TemperatureCard from '@/components/TemperatureCard.vue'
import FanCard from '@/components/FanCard.vue'
import SystemInfo from '@/components/SystemInfo.vue'

const store = useBackendStore()

let scheduledUpdates = 0

onMounted(() => {
  store.getSystemStatus()
  if (scheduledUpdates === 0) {
    scheduledUpdates = setInterval(store.getSystemStatus, 1000)
  }
})

onUnmounted(() => {
  if (scheduledUpdates > 0) {
    clearInterval(scheduledUpdates)
    scheduledUpdates = 0
  }
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col class="xs-1 sm-1 lg-3">
        <v-sheet
          class="pa-2 ma-2"
          rounded
        >
          <SystemInfo />
        </v-sheet>
      </v-col>
      <v-col class="xs-1 sm-1 lg-3">
        <v-sheet
          class="pa-2 ma-2"
          rounded
        >
          <MemoryInfo />
        </v-sheet>
      </v-col>
      <v-col
        class="xs-1 sm-1 lg-3"
        rounded
      >
        <v-sheet class="pa-2 ma-2">
          <CpuUsageCard />
        </v-sheet>
      </v-col>
      <v-col
        class="xs-1 sm-1 lg-3"
        rounded
      >
        <v-sheet class="pa-2 ma-2">
          <DiscUsageInfo />
        </v-sheet>
      </v-col>
      <!-- <v-responsive width="100%"></v-responsive> -->
      <v-col class="xs-1 sm-1 lg-3">
        <v-sheet
          class="pa-2 ma-2"
          rounded
        >
          <FanCard />
        </v-sheet>
      </v-col>
      <v-col class="xs-1 sm-1 lg-3">
        <v-sheet
          class="pa-2 ma-2"
          rounded
        >
          <TemperatureCard />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
  <!-- <v-card>{{ store.systemStatus }} </v-card> -->
  <!-- </v-sheet> -->
</template>

<style>
.v-sheet {
  min-width: 30ch;
  /* min-height: 20ch; */
}
</style>

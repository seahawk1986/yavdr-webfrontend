<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const store = useBackendStore()
const {t} = useI18n()

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
  <v-sheet
    class="overflow-auto fill-height d-flex flex-wrap flex-row justify-center align-self-start"
    color="background"
  >
    <v-card
      class="pa-2 ma-2"
      min-width="375"
      rounded
      prepend-icon="mdi-information"
      :title="t('systeminfo.SystemInfo')"
    >
      <SystemInfo />
    </v-card>

    <v-card
      class="pa-2 ma-2"
      min-width="375"
      rounded
      prepend-icon="mdi-memory"
      :title="t('systeminfo.Memory')"
    >
      <MemoryInfo />
    </v-card>

    <v-card
      rounded
      class="pa-2 ma-2"
      min-width="375"
      :title="t('systeminfo.CPU')"
      prepend-icon="mdi-chip"
    >
      <CpuUsageInfo />
    </v-card>

    <v-card
      rounded
      class="pa-2 ma-2 "
      min-width="375"
      :title="t('systeminfo.DiskUsage')"
      prepend-icon="mdi-chart-donut"
    >
      <DiscUsageInfo />
    </v-card>

    <v-card
      rounded
      class="pa-2 ma-2 "
      min-width="375"
      :title="t('systeminfo.Fans')"
      prepend-icon="mdi-fan"
    >
      <FanInfo />
    </v-card>

    <v-card
      rounded
      class="pa-2 ma-2 "
      min-width="375"
      :title="t('systeminfo.Temperature')"
      prepend-icon="mdi-thermometer"
    >
      <TemperatureInfo />
    </v-card>
  </v-sheet>
</template>

<style lang="scss">
.v-card {
  min-width: 30ch;
}
.sensor-description {
  width: 10ch
}
</style>

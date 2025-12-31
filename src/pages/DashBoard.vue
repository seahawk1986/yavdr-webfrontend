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
  <v-card
    class="overflow-y-auto ma-2 pa-2 fill-height"
    color="background"
  >
    <v-row>
      <v-col class="xs-1 sm-1 lg-3">
        <v-card
          class="pa-2 fill-height"
          rounded
          prepend-icon="mdi-information"
          :title="t('systeminfo.SystemInfo')"
        >
          <SystemInfo />
        </v-card>
      </v-col>
      <v-col class="xs-1 sm-1 lg-3">
        <v-card
          class="pa-2 fill-height"
          rounded
          prepend-icon="mdi-memory"
          :title="t('systeminfo.Memory')"
        >
          <MemoryInfo />
        </v-card>
      </v-col>
      <v-col
        class="xs-1 sm-1 lg-3"
      >
        <v-card
          rounded
          class="pa-2 fill-height"
          :title="t('systeminfo.CPU')"
          prepend-icon="mdi-chip"
        >
          <CpuUsageInfo />
        </v-card>
      </v-col>
      <v-col
        class="xs-1 sm-1 lg-3"
      >
        <v-card
          rounded
          class="pa-2 fill-height"
          :title="t('systeminfo.DiskUsage')"
          prepend-icon="mdi-chart-donut"
        >
          <DiscUsageInfo />
        </v-card>
      </v-col>
      <!-- <v-responsive width="100%"></v-responsive> -->
      <v-col class="xs-1 sm-1 lg-3">
        <v-card
          rounded
          class="pa-2 fill-height"
          :title="t('systeminfo.Fans')"
          prepend-icon="mdi-fan"
        >
          <FanInfo />
        </v-card>
      </v-col>
      <v-col class="xs-1 sm-1 lg-3">
        <v-card
          rounded
          class="pa-2 fill-height"
          :title="t('systeminfo.Temperature')"
          prepend-icon="mdi-thermometer"
        >
          <TemperatureInfo />
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<style lang="scss">
.v-card {
  min-width: 30ch;
}
.sensor-description {
  width: 10ch
}
</style>

<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
const store = useBackendStore()
</script>

<template>
  <h2><v-icon>mdi-thermometer</v-icon>Temperatures</h2>
  <v-table density="compact">
    <thead>
      <tr>
        <!-- <th class="text-left" width="10%">Module</th> -->
        <th
          class="text-left"
          width="10%"
        >
          Sensor
        </th>
        <th class="text-middle">
          Temperature
        </th>
      </tr>
    </thead>
    <tbody>
      <template
        v-for="(sensorData, device_name, idx) in store.systemStatus?.temperatures.sensors"
        :key="idx"
      >
        <tr
          v-for="(sensor, sensor_id) in sensorData"
          :key="sensor_id"
        >
          <!-- <td>
            {{ device_name }}
          </td> -->
          <td>
            <v-tooltip
              :text="`${device_name}`"
              location="start"
            >
              <template #activator="{ props }">
                <div v-bind="props">
                  {{ sensor.label }}
                </div>
              </template>
            </v-tooltip>
          </td>
          <td>
            <v-progress-linear
              :color="
                sensor.current < (sensor.high > 0 ? sensor.high : 60)
                  ? 'primary'
                  : sensor.current < (sensor.critical > 0 ? sensor.critical : 80)
                    ? 'warning'
                    : 'red'
              "
              :rotate="360"
              :size="100"
              :height="25"
              :model-value="sensor.current"
              :max="sensor.critical"
            >
              <template #default>
                <strong>{{ sensor.current }} °C</strong>
              </template>
            </v-progress-linear>
          </td>
        </tr>
      </template>
    </tbody>
  </v-table>
</template>

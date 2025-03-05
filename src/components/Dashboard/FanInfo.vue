<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
import { useI18n } from 'vue-i18n';
const store = useBackendStore()
const { t } = useI18n()

</script>

<template>
  <v-table density="compact">
    <thead>
      <tr>
        <th
          class="text-left"
          width="10%"
        >
          {{ t('systeminfo.Module') }}
        </th>
        <th
          class="text-left"
          width="10%"
        >
          {{ t('systeminfo.Sensor') }}
        </th>
        <th
          class="text-middle"
          width="40%"
        >
          {{ $t('systeminfo.RPM') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template
        v-for="(sensorData, device_name, idx) in store.systemStatus?.fans.sensors"
        :key="idx"
      >
        <tr
          v-for="(sensor, sensor_id) in sensorData"
          :key="sensor_id"
        >
          <td>
            {{ device_name }}
          </td>
          <td>
            {{ sensor.label ? sensor.label : `${t('systeminfo.Fan')}&nbsp;${sensor_id}` }}
          </td>
          <td>
            <v-progress-linear
              :color="sensor.current > 0 ? 'primary' : 'red'"
              :rotate="360"
              :size="100"
              :height="25"
              max="3000"
              :model-value="sensor.current"
            >
              <template #default>
                <strong>{{ sensor.current }}</strong>
              </template>
            </v-progress-linear>
          </td>
        </tr>
      </template>
    </tbody>
  </v-table>
</template>

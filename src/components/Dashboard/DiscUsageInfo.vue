<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
const store = useBackendStore()
const cleanIDRegex = new RegExp('/', 'g')
</script>

<template>
  <v-table density="compact">
    <thead>
      <tr>
        <th class="text-left sensor-description">
          {{ $t('systeminfo.Device') }}
        </th>
        <th class="text-left">
          {{ $t('systeminfo.Mount') }}
        </th>
        <th
          class="text-middle"
          width="40%"
        >
          {{ $t('systeminfo.DiskUsage') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="disk in store.systemStatus?.disk_usage"
        :key="disk.device"
      >
        <td>
          {{ disk.device }}
        </td>
        <td>{{ disk.mountpoint }}</td>
        <v-progress-linear
          :id="disk.device.replace(cleanIDRegex, '-')"
          :color="disk.percent < 80 ? 'primary' : disk.percent < 95 ? 'warning' : 'red'"
          :rotate="360"
          :size="100"
          :height="25"
          :model-value="disk.percent"
        >
          <template #default>
            <v-tooltip :activator="`#${disk.device.replace(cleanIDRegex, '-')}`">
              {{ disk.used_human.value }} {{ disk.used_human.unit }}
              /
              {{ disk.total_human.value }} {{ disk.total_human.unit }}
            </v-tooltip>
            <strong>{{ disk.percent }}%</strong>
          </template>
        </v-progress-linear>
      </tr>
    </tbody>
  </v-table>
</template>

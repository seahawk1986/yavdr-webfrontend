<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const store = useBackendStore()

const gradients = [
  ['#222'],
  ['#42b3f4'],
  ['red', 'orange', 'yellow'],
  ['purple', 'violet'],
  ['#00c6ff', '#F0F', '#FF0'],
  ['#f72047', '#ffd200', '#1feaea']
]
</script>

<template>
  <v-table density="compact">
    <thead>
      <tr>
        <th
          class="text-left"
          width="10ch"
        >
          {{ t('systeminfo.Core') }}
        </th>
        <th class="text-middle">
          {{ t('systeminfo.Usage') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(cpu_usage, cpu_id) in store.systemStatus?.cpu_usage"
        :key="cpu_id"
      >
        <td>{{ cpu_id }}</td>
        <td>
          <v-progress-linear
            :color="cpu_usage < 80 ? 'primary' : cpu_usage < 95 ? 'warning' : 'red'"
            :rotate="360"
            :size="100"
            :height="25"
            :model-value="cpu_usage"
          >
            <template #default>
              <strong> {{ cpu_usage }}% </strong>
            </template>
          </v-progress-linear>
        </td>
      </tr>
    </tbody>
  </v-table>
  <v-sparkline
    :auto-line-width="true"
    :fill="true"
    :gradient="gradients[2]"
    gradient-direction="top"
    :line-width="2"
    :model-value="store.cpu_average_load"
    :padding="2"
    :smooth="true"
    stroke-linecap="round"
    type="trend"
    auto-draw
    height="80px"
    min="0"
    :max="store.systemStatus?.cpu_num"
  />
   <!-- {{ store.cpu_average_load[store.cpu_average_load.length - 1] }} -->
  <!-- CPU 10 minute average load: {{ store.systemStatus?.load_average.last_10_min.toFixed(1) }} % -->
</template>

<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
const store = useBackendStore()
</script>

<template>
  <div>
    <v-spacer />

    <v-table density="compact">
      <thead>
        <tr>
          <th
            class="text-left sensor-description"
          >
            {{ $t('systeminfo.Type') }}
          </th>
          <th class="text-middle">
            {{ $t('systeminfo.Usage') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>RAM</td>
          <td>
            <v-progress-linear
              id="memory_usage"
              color="primary"
              :rotate="360"
              :size="100"
              :width="15"
              :height="25"
              :model-value="store.systemStatus?.memory_usage.percent"
            >
              <template #default>
                <v-tooltip activator="#memory_usage">
                  {{ store.systemStatus?.memory_usage.used_human.value
                  }}{{ store.systemStatus?.memory_usage.used_human.unit }}
                  /
                  {{ store.systemStatus?.memory_usage.total_human.value
                  }}{{ store.systemStatus?.memory_usage.total_human.unit }}
                </v-tooltip>
                <strong> {{ store.systemStatus?.memory_usage.percent }}% </strong>
              </template>
            </v-progress-linear>
          </td>
        </tr>
        <tr>
          <td>SWAP</td>
          <td>
            <v-progress-linear
              id="swap_usage"
              color="primary"
              :rotate="360"
              :size="100"
              :width="15"
              :height="25"
              :model-value="store.systemStatus?.swap_usage.percent"
            >
              <template #default>
                <v-tooltip activator="#swap_usage">
                  {{ store.systemStatus?.swap_usage.used_human.value }}
                  {{ store.systemStatus?.swap_usage.used_human.unit }}
                  /
                  {{ store.systemStatus?.swap_usage.total_human.value }}
                  {{ store.systemStatus?.swap_usage.total_human.unit }}
                </v-tooltip>
                <strong> {{ store.systemStatus?.swap_usage.percent }}% </strong>
              </template>
            </v-progress-linear>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

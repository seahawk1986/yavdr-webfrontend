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
          />
          <th class="text-middle" />
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Release</td>
          <td>
            {{ store.systemStatus?.release.join(' ') }}
          </td>
        </tr>
        <tr>
          <td>Kernel</td>
          <td>
            {{ store.systemStatus?.kernel }}
          </td>
        </tr>
        <tr>
          <td>Uptime</td>
          <td>
            {{ store.systemStatus?.uptime }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

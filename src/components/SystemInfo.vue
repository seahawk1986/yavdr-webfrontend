<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
const store = useBackendStore()
</script>

<template>
  <h2><v-icon>mdi-information</v-icon>System Info</h2>
  <v-spacer />

  <v-table density="compact">
    <tbody>
      <tr>
        <td>Release</td>
        <td>
          {{ store.systemStatus?.release.join(' ') }}
        </td>
      </tr>
      <tr>
        <td>Kernel:</td>
        <td>
          {{ store.systemStatus?.kernel }}
        </td>
      </tr>
      <tr>
        <td>Uptime:</td>
        <td>
          {{ store.systemStatus?.uptime }}
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
const store = useBackendStore()
const props = defineProps<{
  name: string
  iconName: string
  tooltip: string
  keyname: string
  iconColor?: string
}>()
</script>

<template>
  <v-icon-btn
    class="remote-icon-btn mx-2"
    icon=""
    :aria-label="props.name"
    @click="store.onKeypress(props.keyname)"
  >
    <v-tooltip
      location="bottom"
      :text="tooltip"
      :close-on-content-click="true"
      activator="parent"
    >
      {{ props.tooltip }}
    </v-tooltip>
    <v-icon
      :icon="props.iconName"
      :color="props.iconColor"
    />
  </v-icon-btn>
</template>

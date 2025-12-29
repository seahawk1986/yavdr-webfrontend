<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
const store = useBackendStore()
export interface Props {
  name: string
  tooltip: string
  keyname: string
  color?: string
}
const props = withDefaults(defineProps<Props>(), {
  color: ""
})
</script>

<template>
  <v-btn
    class="remote-icon-btn mx-2"
    :color="props.color"
    :aria-label="props.name ? props.name : props.tooltip"
    rounded="pill"
    @click="store.onKeypress(props.keyname)"
  >
    {{ name }}
    <v-tooltip
      location="bottom"
      :text="tooltip"
      activator="parent"
    >
      {{ props.tooltip }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { useBackendStore } from "@/stores/backend";
const store = useBackendStore();
export interface Props {
  name: string;
  tooltip: string;
  keyname: string;
  color?: string;
}
const props = withDefaults(defineProps<Props>(), {
  color: "",
});
</script>

<template>
  <v-btn
    v-tooltip="props.tooltip"
    class="remote-icon-btn mx-2"
    :color="props.color"
    :aria-label="props.name ? props.name : props.tooltip"
    rounded="pill"
    variant="outlined"
    @click="store.onKeypress(props.keyname)"
  >
    {{ props?.name }}
  </v-btn>
</template>

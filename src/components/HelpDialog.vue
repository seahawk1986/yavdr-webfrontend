<template>
  <v-dialog
    :fullscreen="store.isOnMobile"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        icon="mdi-help"
        text="Help"
        size="small"
        variant="tonal"
        color="info"
      />
    </template>
    <template #default="{ isActive }">
      <v-card
        class="mx-auto"
        :min-width="store.isOnMobile ? '100%' : '100ch'"
      >
        <template #title>
          <v-toolbar
            color="surface"
            density="compact"
          >
            <v-btn
              icon="mdi-close"
              text="Close"
              size="small"
              variant="tonal"
              color="red"
              @click="isActive.value = false"
            />
            <v-toolbar-title :text="props.name" />
          </v-toolbar>
        </template>
        <template #text>
          <slot name="help">
            Help Text
          </slot>
        </template>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text="Close"
            @click="isActive.value = false"
          />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useBackendStore } from '@/stores/backend';

const store = useBackendStore()
const props = defineProps<{
  name: string
}>()
</script>

<style scoped>
.monospace {
  font-family: monospace;
  text-wrap-style: pretty;
}
</style>

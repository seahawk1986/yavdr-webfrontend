<template>
  <v-card
    variant="outlined"
    append-icon="$close"
  >
    <template #append>
      <v-btn
        icon="$close"
        variant="text"
        @click="emit('abort')"
      />
    </template>
    <template #title>
      <v-switch
        v-model="isEnabled"
        class="ml-2 mb-n4"
        hide-details
        inset
        color="success"
        :label="`${props.name} (${props.version})`"
      />
    </template>
    <!-- <v-card-text> -->
    <div
      class="ma-5 text-center"
      max-height="80vh"
    >
      <v-textarea
        :model-value="pluginConfig"
        :label="`[${pluginName}]`"
        rows="10"
        variant="outlined"
      />
    </div>
    <!-- </v-card-text> -->
    <div class="pa-4 text-end">
      <v-btn
        class="text-none"
        color="primary"
        min-width="92"
        variant="outlined"
        rounded
        prepend-icon="mdi-send"
      >
        Save
      </v-btn>
      <v-divider
        vertical
        thickness="10"
        opacity="0"
      />
      <v-btn
        color="red-darken-4"
        min-width="92"
        variant="outlined"
        rounded
        prepend-icon="mdi-cancel"
        @click="emit('abort')"
      >
        Cancel
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
const pluginConfig = ref("")
const isEnabled = ref(true)
const pluginName = "foo"

const props = defineProps<{
  name: string
  version: string
  enabled: boolean
  config: string
}>()

const emit = defineEmits<{
  confirm: [enabled: boolean, config: string]
  abort: []
}>()

onMounted(() => {
  pluginConfig.value = props.config
  isEnabled.value = props.enabled
})
</script>
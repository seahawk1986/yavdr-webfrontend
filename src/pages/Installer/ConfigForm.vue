<script setup lang="ts">
import { ref } from 'vue'
import { useConfigStore } from '@/stores/ansible_config'
import SchemaField from '@/components/SchemaField.vue'

const store = useConfigStore()
const schemaText = ref('')

function loadSchema() {
  if (!schemaText.value.trim()) return   // 👈 REQUIRED

  try {
    const schema = JSON.parse(schemaText.value)
    store.loadSchema(schema)
  } catch (e) {
    console.error('Invalid schema JSON', e)
  }
}
</script>

<template>
  <v-container>
    <v-textarea
      v-model="schemaText"
      label="Paste JSON Schema"
      rows="8"
    />

    <v-btn
      class="my-2"
      @click="loadSchema"
    >
      Parse schema
    </v-btn>

    <SchemaField
      v-if="store.schema"
      :schema="store.schema"
      :path="[]"
      :label="store.schema.title ?? 'Configuration'"
    />
  </v-container>
</template>

<style lang="css" scoped>
    .v-text-input {
        font-family: monospace;
    }

</style>

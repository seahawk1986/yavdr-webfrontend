<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/ansible_config'

const props = defineProps<{
  schema: any
  path: (string | number)[]
  label: string
}>()

const store = useConfigStore()

const value = computed({
  get: () => store.getValue(props.path),
  set: v => store.setValue(props.path, v),
})
</script>

<template>
  <!-- STRING -->
  <v-text-field
    v-if="schema.type === 'string' && !schema.enum"
    v-model="value"
    :label="label"
    :hint="schema.description"
    persistent-hint
    variant="outlined"
    prepend-icon="mdi-drag"
  />

  <!-- ENUM -->
  <v-select
    v-else-if="schema.enum"
    v-model="value"
    :items="schema.enum"
    :label="label"
    :hint="schema.description"
    persistent-hint
  />

  <!-- NUMBER / INTEGER -->
  <v-number-input
    v-else-if="schema.type === 'number' || schema.type === 'integer'"
    v-model.number="value"
    type="number"
    :label="label"
    :hint="schema.description"
    persistent-hint
  />

  <!-- BOOLEAN -->
  <v-switch
    v-else-if="schema.type === 'boolean'"
    v-model="value"
    :label="label"
    :hint="schema.description"
    persistent-hint
  />

  <!-- ARRAY -->
  <ArrayField
    v-else-if="schema.type === 'array'"
    :schema="schema"
    :path="path"
    :label="label"
  />

  <!-- OBJECT -->
  <v-expansion-panels v-else-if="schema.type === 'object'">
    <v-expansion-panel>
      <v-expansion-panel-title>{{ label }}</v-expansion-panel-title>
      <v-expansion-panel-text>
        <p
          v-if="schema.description"
          class="text-caption mb-2"
        >
          {{ schema.description }}
        </p>

        <!-- declared properties -->
        <SchemaField
          v-for="(s, key) in schema.properties ?? {}"
          :key="key"
          :schema="s"
          :path="[...path, key]"
          :label="key.toString()"
        />

        <!-- additionalProperties -->
        <template
          v-if="schema.additionalProperties"
        >
          <SchemaField
            v-for="(v, key) in value ?? {}"
            :key="key"
            :schema="schema.additionalProperties"
            :path="[...path, key]"
            :label="key.toString()"
          />
        </template>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { useConfigStore } from '@/stores/ansible_config'
import SchemaField from './SchemaField.vue'

const props = defineProps<{
  schema: any
  path: (string | number)[]
  label: string
}>()

const store = useConfigStore()

const value = computed({
  get: () => store.getValue(props.path) ?? [],
  set: v => store.setValue(props.path, v),
})

const [ parent, items ] = useDragAndDrop(value.value)
</script>

<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title>{{ label }}</v-expansion-panel-title>
      <v-expansion-panel-text>
        <p
          v-if="schema.description"
          class="text-caption mb-2"
        >
          {{ schema.description }}
        </p>

        <div ref="parent">
          <v-card
            v-for="(item, index) in items"
            :key="index"
            class="mb-2 pa-2"
          >
            <SchemaField
              :schema="schema.items"
              :path="[...path, index]"
              :label="`${label}[${index}]`"
              append-icon="mdi-delete"
              @click:append="value.splice(index, 1)"
            />

            <!-- <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              @click="value.splice(index, 1)"
            /> -->
          </v-card>
        </div>

        <v-btn
          size="small"
          class="mt-2"
          @click="value.push(schema.items.default ?? null)"
        >
          Add item
        </v-btn>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

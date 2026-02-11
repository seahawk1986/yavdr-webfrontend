<template>
  <!-- FALL 1: OBJEKT (Rekursion) -->
  <template v-if="schema.type === 'object' && schema.properties">
    <v-list-group :value="label">
      <template #activator="{ props: vProps }">
        <v-list-item
          v-bind="vProps"
          :title="label"
          prepend-icon="mdi-folder-outline"
        />
      </template>

      <!-- REKURSION: Direkt die nächsten Items rendern -->
      <!-- KEIN div oder v-list hier! v-list-group erwartet v-list-item/group als direkte Kinder -->
      <ConfigComponent
        v-for="(subSchema, subKey) in schema.properties"
        :key="subKey"
        v-model="internalValue[subKey]"
        :label="subKey"
        :schema="subSchema"
      />
    </v-list-group>
  </template>

  <!-- FALL 2: ANDERE TYPEN (Blatt-Knoten) -->
  <v-list-item
    v-else
    :ripple="false"
  >
    <v-list-item-title class="text-caption text-grey mb-1">
      {{ label }}
    </v-list-item-title>

    <!-- INTEGER CASE -->
    <template v-if="schema.type === 'integer' || ('anyOf' in schema && schema.anyOf.find((item) => {return item.type === 'integer'}))">
      <v-number-input
        class="mt-1"
        :model-value="modelValue"
        :label="label"
        :min="schema.minimum"
        :max="schema.maximum"
        :step="1"
        :precision="0"
        density="compact"
        hide-details="auto"
        variant="outlined"
        control-variant="stacked"
        @update:model-value="updateValue"
      />
    </template>

    <!-- String / Enum -->
    <template v-else-if="schema.type === 'string' && Array.isArray(schema.enum)">
      <v-select
        class="mt-1"
        :model-value="modelValue"
        :items="schema.enum"
        :label="schema.title"
        density="compact"
        hide-details="auto"
        variant="outlined"
        @update:model-value="updateValue"
      />
    </template>

    <!-- String -->
    <template v-else-if="schema.type === 'string' || (schema.type === undefined && schema.anyOf && schema.anyOf.find((element) => {return element.type === 'string'}))">
      {{ schema.description || schema.title }}
      <v-text-field
        class="mt-1"
        :model-value="modelValue"
        :label="schema.title"
        density="compact"
        hide-details="auto"
        variant="outlined"
        @update:model-value="updateValue"
      />
    </template>

    <!-- Boolean -->
    <template v-else-if="schema.type === 'boolean'">
      <v-switch
        :model-value="modelValue"
        inset
        :label="schema.title"
        color="primary"
        density="compact"
        hide-details="auto"
        @update:model-value="updateValue"
      />
    </template>

    <!-- String Array -->
    <template v-else-if="isStringArray(schema)">
      <v-list-item
        v-for="(item, index) in modelValue"
        :key="item.title"
      >
        <v-text-field
          :model-value="item"
          :rules="[v => !!v || 'This field must not be empty. Delete empty fields']"
          density="compact"
          append-icon="mdi-delete"
          @update:model-value="(val) => updateArrayItem(index, val)"
          @click:append="remove(modelValue, index)"
        />
      </v-list-item>
      <v-list-item>
        <v-btn
          icon="mdi-plus"
          block
          variant="outlined"
          @click="add(modelValue, '')"
        />
      </v-list-item>
    </template>


    <!-- <template v-else-if="isStringArray(schema)">
      <v-list>
        <v-list-item
          v-for="(item, index) in modelValue"
          :key="index"
        >
          <v-text-field
            :model-value="item"
            density="compact"
            hide-details="auto"
            variant="outlined"
            @update:model-value="(val) => updateArrayItem(index, val)"
          />
        </v-list-item>
        <v-list-item>
          <v-btn
            icon="mdi-plus"
            block
            variant="outlined"
            @click="add(modelValue, '')"
          />
        </v-list-item>
      </v-list>
    </template> -->

    <!-- integer Array -->
    <template v-else-if="isIntegerArray(schema, modelValue)">
      <v-list>
        <v-list-item
          v-for="(item, index) in modelValue"
          :key="index"
        >
          <v-number-input
            :model-value="modelValue[index]"
            :min="schema.minimum"
            :max="schema.maximum"
            :step="1"
            :precision="0"
            append-icon="mdi-delete"
            prepend-icon="mdi-arrow-up"
            density="compact"
            hide-details="auto"
            variant="outlined"
            control-variant="stacked"
            @update:model-value="(val) => updateArrayItem(index, val)"
            @click:append="remove(modelValue, index)"
          />
        </v-list-item>
        <v-list-item>
          <v-btn
            icon="mdi-plus"
            block
            variant="outlined"
            @click="add(modelValue, label === 'wait_for_dvb_devices' ? (Math.max(...modelValue, -1) +1): 0)"
          />
        </v-list-item>
      </v-list>
    </template>

    <template v-else-if="isStringHashmap(schema)">
      <v-list>
        <v-list-item
          v-for="(val, key) in modelValue"
          :key="key"
        >
          Hashmap
          <v-row>
            <v-col cols="5">
              <v-text-field
                v-model="modelValue[key]"
                label="Key"
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="modelValue[key]"
                label="Value"
              />
            </v-col>
            <v-col cols="2">
              <v-btn
                icon="mdi-delete"
                @click="removePair(modelValue, key)"
              />
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </template>

    <template v-else-if="isIntegerHashmap(schema)">
      <v-list-group
        v-for="(values, key) in modelValue"
        :key="key"
        :value="key"
      >
        <template #activator="{ props: groupActivatorProps }">
          <v-list-item
            v-bind="groupActivatorProps"
            :title="key"
          />
        </template>

        <v-list-item
          v-for="(title, index) in values"
          :key="index"
          :title="$t('Port')"
          :value="title"
        >
          <v-number-input :model-value="modelValue[key][index]" />
        </v-list-item>
      </v-list-group>
    </template>
    <template v-else>
      Fallback for
      <pre>
{{ JSON.stringify(schema , null, 2) }}
      </pre>

      current value:
      <pre>
{{ JSON.stringify(modelValue , null, 2) }}
      </pre>
      isStringHashmap: {{ isStringHashmap(schema) }}
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, Array, Object] },
  schema: { type: Object, required: true },
  label: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);

const internalValue = computed({
  get: () => props.modelValue || {},
  set: (val) => emit('update:modelValue', val)
});

const updateValue = (val: Any) => emit('update:modelValue', val);

const isIntegerArray = (schema: object, modelValue: Any) => {
  return schema.type === 'array' && 'items' in schema && (schema.items.type === 'integer') && Array.isArray(modelValue)
}

const isStringArray = (schema: object) => {
    return 'type' in schema && schema.type === 'array' && ((schema.type === 'array' && schema.items.type === 'string')) || ('anyOf' in schema && schema.anyOf.filter((item) => { return item.type === 'string'}) || schema.items?.anyOf?.filter((item) => {return item.type === 'string'}))
}

const isStringHashmap = (schema: Any) => {
    return (
      'type' in schema && schema.type === 'object' &&
      'additionalProperties' in schema &&
      schema.additionalProperties.type === 'string'
    )
}

const isIntegerHashmap = (schema: Any) => {
  return (
    'type' in schema && schema.type === 'object' &&
    'additionalProperties' in schema &&
    schema.additionalProperties.type === 'array' &&
    'items' in schema.additionalProperties &&
    schema.additionalProperties.items.type === 'integer'
  )
}

const updateArrayItem = (index: number, newValue: Any) => {
  // Erstelle eine flache Kopie des Arrays
  const newList = [...(props.modelValue || [])];
  // Ersetze den Wert am Index
  newList[index] = newValue;
  // Emittiere das komplette neue Array an den Parent
  emit('update:modelValue', newList);
};

function add(modelValue: Any[], value: Any) {
    console.log("add entry", value)
    modelValue.push(value)
}
const remove = (modelValue: Any[], index: number) => {console.log("remove index", index), modelValue.splice(index, 1)}

const removePair = (modelValue: Any, key: Any) => {modelValue.delete(key)}
</script>

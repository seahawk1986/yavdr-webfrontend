<template>
  <v-dialog
    :title="name"
    height="100svh"
    persistent
    :fullscreen="store.isOnMobile"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        prepend-icon="mdi-pencil"
        text="Edit"
      />
    </template>
    <template #default="{ isActive }">
      <v-card
        class="mx-auto overflow-auto"
        :min-width="store.isOnMobile ? '100%' : '100ch'"
      >
        <template #title>
          <v-toolbar
            color="surface"
            density="compact"
          >
            <help-dialog :name="`Help for ${name}`">
              <template #help>
                <v-textarea
                  v-model="help"
                  readonly
                  class="monospace overflow-auto"
                  auto-grow
                  hide-details="auto"
                  variant="plain"
                />
              </template>
            </help-dialog>
            <v-toolbar-title :text="props.pluginConfig.name" />
            <v-btn
              icon="mdi-close"
              text="Close"
              size="small"
              variant="tonal"
              @click="isActive.value = false"
            />
          </v-toolbar>
        </template>

        <v-card-text class="overflow-auto">
          <v-number-input
            v-if="!is_static"
            label="Priority"
            :min="10"
            :max="99"
            :model-value="prio"
          />
          <v-textarea
            v-model="args"
            class="monospace overflow-auto"
            label="Start Arguments"
            auto-grow
            max-rows="20"
            hide-details="auto"
          />
        </v-card-text>
        <template #actions>
          <v-spacer />
          <v-btn
            text="Cancel"
            color="red"
            @click="isActive.value = false"
          />
          <v-btn
            color="primary"
            text="Save"
            @click="
              {
                save();
                isActive.value = false;
              }
            "
          />
        </template>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts" setup>
import { VNumberInput } from "vuetify/labs/VNumberInput";
import type { ArgumentFileInterface, ArgumentSaveInterface } from "@/pages/VDR/VDRStartArgumentInterface";
import { useBackendStore } from "@/stores/backend";

const store = useBackendStore();
const props = defineProps<{
  pluginConfig: ArgumentFileInterface;
}>();

const emit = defineEmits<{
  (e: "save", data: ArgumentSaveInterface): void;
  (e: "abort"): void;
}>();

const name = props.pluginConfig.name;
const args = ref(props.pluginConfig.args);
const prio = ref(props.pluginConfig.prio);
const is_static = ref(props.pluginConfig.static)
const help = ref(props.pluginConfig.help);

function save() {
  const data: ArgumentSaveInterface = {
    name: props.pluginConfig.name,
    prio: prio.value,
    enabled: props.pluginConfig.enabled,
    static: props.pluginConfig.static,
    args: args.value,
  };
  emit("save", data);
}
</script>

<style scoped>
.monospace {
  font-family: monospace;
  text-wrap-style: balance;
}
</style>

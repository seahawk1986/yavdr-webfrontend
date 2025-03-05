<script lang="ts" setup>
import { useBackendStore } from "@/stores/backend";
import { onMounted, ref, type Ref } from "vue";
import { useDisplay } from "vuetify";
import { type ArgumentSaveInterface, type startArgumentsInterface } from "./VDRStartArgumentInterface";

const {height} = useDisplay()

const backend = useBackendStore();

const startArguments: Ref<startArgumentsInterface> = ref({})

async function saveConfig(config: ArgumentSaveInterface) {
  console.debug("saving config:", config)
  backend.putRequest('/vdr/start_arguments', config)
  
}

onMounted(async () => {
    const response = await backend.getRequest('/vdr/start_arguments')
    if (response?.data) {
      console.log(response.data)
        startArguments.value = response.data
    }
})
</script>

<template>
  <v-container class="ma-0 pa-0">
    <v-card
      class="mx-auto overflow-y-auto ma-2"
      max-width="700"
      :height="height - backend.titlebarHeight - 20"
    >
      <v-list>
        <v-list-group
          v-for="(configs, name) in startArguments"
          :key="name"
          :value="name"
        >
          <template #activator="{ props }">
            <v-list-item
              v-for="config in configs"
              v-bind="props"
              :key="config.filename"
            >
              <span class="ma-5">
                {{ config.prio.toString().padStart(2, '0') }}-{{ config.name }}.conf
              </span>
              <v-tooltip
                v-if="config.warning && config.warning.length > 0"
                :text="config.warning"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-icon
                    v-bind="tooltipProps"
                    icon="mdi-alert"
                  />
                </template>
              </v-tooltip>
              <template #prepend>
                <v-switch
                  v-model="config.enabled"
                  :readonly="config.static"
                  :disabled="config.static"
                  color="primary"
                  hide-details="auto"
                  inset
                  :center-affix="true"
                  density="compact"
                  :aria-label="config.filename"
                />
              </template>
              <template #append>
                <start-argument-dialog
                  :plugin-config="config"
                  @save="async (config) => {
                    saveConfig(config)
                  }"
                />
              </template>
            </v-list-item>
          </template>
        </v-list-group>
      </v-list>
    </v-card>
  </v-container>
</template>


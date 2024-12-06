<script setup lang="ts">
import { useBackendStore } from '@/stores/backend'
import { onMounted, ref, type Ref } from 'vue'

const store = useBackendStore()

interface VDRPlugin {
  name: string
  version: string
  // priority: number
  // config: string
  // config_file: string
  // isEnabled: boolean
}

const vdrPlugins: Ref<Array<VDRPlugin>> = ref([])

async function loadPlugins() {
  const data = await store.getRequest('/vdr/plugins')
  if (data) {
    console.log(data)
    vdrPlugins.value = data
  }
}

onMounted(() => {
  loadPlugins()
})
</script>

<template>
  <v-sheet>
    <v-list>
      <v-list-item
        v-for="(plugin, idx) in vdrPlugins"
        :key="idx"
        :title="plugin.name + ' (version: ' + plugin.version + ')'"
        prepend-icon="mdi-toy-brick"
      />
    </v-list>
    <v-btn
      prepend-icon="mdi-reload"
      @click="loadPlugins()"
    >
      {{ $t('actions.reload') }}
    </v-btn>
  </v-sheet>
</template>

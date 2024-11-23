<script setup lang="ts">
import { ref } from 'vue'
import { useBackendStore } from '@/stores/backend'
import LoginMask from './LoginMask.vue'
import DashBoard from './DashBoard.vue'
import RemoteControl from './RemoteControl.vue'

const store = useBackendStore()
const tab = ref(null)
</script>

<template>
  <!-- <h1>Welcome to the yaVDR Webfrontend</h1> -->
  <LoginMask v-if="!store.hasToken" />
  <v-sheet v-else>
    <v-tabs
      v-model="tab"
      bg-color="primary"
      align-tabs="center"
    >
      <v-tab value="VDR">
        VDR
      </v-tab>
      <v-tab value="Remote">
        <v-icon aria-label="Remote Control">
          mdi-remote-tv
        </v-icon>
      </v-tab>
      <v-tab value="System">
        <v-icon aria-label="System Info">
          mdi-view-dashboard
        </v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="VDR">
        VDR Timer and Recordings
      </v-tabs-window-item>
      <v-tabs-window-item value="Remote">
        <RemoteControl />
      </v-tabs-window-item>
      <v-tabs-window-item value="System">
        <DashBoard />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-sheet>
</template>

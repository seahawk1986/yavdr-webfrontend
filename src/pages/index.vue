<script setup lang="ts">
import { ref } from 'vue'
import { useBackendStore } from '@/stores/backend'
import LoginMask from '@/components/LoginMask.vue'
import DashBoard from '@/pages/DashBoard.vue'
// import RemoteControl from '@/components/RemoteControl.vue'

const store = useBackendStore()
const tab = ref(null)
</script>

<template>
  <LoginMask v-if="!store.hasToken" />
  <v-sheet
    v-else
  >
    <v-tabs
      v-model="tab"
      bg-color="blue-darken-4"
      align-tabs="title"
    >
      <v-tab
        value="VDR"
        text="VDR"
      />
      <v-tab
        value="System"
        icon="mdi-view-dashboard"
        text="System"
      />
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="VDR">
        <v-container style="max-height: 89vh">
          <v-row no-gutters>
            <v-col
              sm="12"
              lg="6"
            >
              <v-card>
                <v-card-title>
                  {{ $t('category.timer', 2) }}
                </v-card-title>
                <v-card-text>
                  <TimerList />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col
              sm="12"
              lg="6"
            >
              <v-card>
                <v-card-title>
                  {{ $t('category.recording', 2) }}
                </v-card-title>
                <v-card-text>
                  <RecordingsList />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tabs-window-item>
      <v-tabs-window-item value="System">
        <DashBoard />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-sheet>
</template>

<style lang="scss">
    .status-column {
      width: 1%;
    }
    .date-column {
      width: 24%
    }
    .duration-column {
      width: 5%;
    }
    .title-column {
      width: 400vw;
    }
    .channel-column {
      width: 20%;
    }
    .vdr-item-list {
      max-height: 80vh;
      height: max-content;
    }
</style>

<script setup lang="ts">
import TimerList from '@/components/TimerList.vue';
import DashBoard from '@/pages/DashBoard.vue'

const tab = ref(null)
</script>

<template>
  <v-sheet
    class="fill-height"
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
              class="pa-1"
              cols="12"
              lg="6"
            >
            <TimerList />
            </v-col>
            <v-col
              class="pa-1"
              cols="12"
              lg="6"
            >
            <RecordingsList />
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

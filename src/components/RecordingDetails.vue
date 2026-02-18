<template>
  <v-dialog>
    <template #activator="{ props: activatorProps }">
      <v-icon-btn
        :v-tooltip="t('actions.show_details')"
        icon="mdi-movie-play"
        v-bind="activatorProps"
        variant="flat"
        color="primary"
      />
    </template>



    <template #default="{ isActive }">
      <v-card
        :title="props.recording.InfoTitle
          ? props.recording.InfoTitle
          : props.recording.Name"
        :subtitle="props.recording.InfoShortText"
        :text="props.recording.InfoDescription"
      >
        <template #prepend>
          <v-icon-btn
            v-tooltip="t('action.close')"
            variant="elevated"
            color="red"
            icon="mdi-close"
            class="cursor-pointer"
            @click="isActive.value = false"
          />
        </template>
        <template #append>
          <v-icon-btn
            v-tooltip="'play recording'"
            color="primary"
            icon="mdi-play-circle"
            class="cursor-pointer"
            @click="playRecording"
          />
          <v-divider
            vertical
            thickness="10"
            :opacity="0"
          />
          <v-icon-btn
            v-tooltip="'play recording from begining'"
            icon="mdi-replay"
            color="secondary"
            class="cursor-pointer"
            @click="replayRecording"
          />
          <v-divider
            vertical
            thickness="10"
            :opacity="0"
          />
          <v-icon-btn
            v-tooltip="'delete recording'"
            icon="mdi-delete"
            class="cursor-pointer"
            color="red"
            @click="deleteRecording(isActive)"
          />

        </template>
        <!-- <template #actions>
          {{ props.recording }}
        </template> -->
      </v-card>
    </template>
  </v-dialog>
</template>


<script setup lang="ts">
import type { VDRRecordingInterface } from '@/stores/interfaces/VdrRecordingInterface';
import { useVDRStore } from '@/stores/vdr';
import { useI18n } from 'vue-i18n';

const vdr = useVDRStore()
const {t} = useI18n()

const props = defineProps<{
    recording: VDRRecordingInterface
}>()

const emit = defineEmits<{
  (e: 'delete', id: number): void
//   (e: 'update', value: string): void
}>()

const playRecording = async () => {
    console.log("playig recording", props.recording
    )
    vdr.playRecording(props.recording.RecNum)
}

const replayRecording = async () => {
    console.log("playig recording", props.recording
    )
    vdr.playRecording(props.recording.RecNum, 0)
}

const deleteRecording = async (isActive: Ref<boolean>) => {
    await vdr.deleteRecording(props.recording.RecNum)
    isActive.value = false
}
</script>

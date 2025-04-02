<template>
  <v-card :title="props.channelEditTitle">
    <v-card-text>
      <v-number-input
        v-model="inputChannelNumber"
        :label="t('channels.channelNumber')"
        :min="1"
        prepend-icon="mdi-pound"
        autofocus
        @focus="$event.target.select()"
        @keyup.enter="moveChannel"
      />
      <v-checkbox
        v-model="scrollToNewChannelEntry"
        :label="t('channels.scrollToNewPosition')"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <!-- TODO: fix warning when opening dialogue -->
      <v-btn
        :text="t('actions.cancel')"
        @click="$emit('abort')"
      />
      <v-btn
        :text="props.confirmMoveTitle"
        @click="moveChannel"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import type { VDRChannel } from '@/stores/interfaces/VdrChannelInterface';
const { t } = useI18n();

const inputChannelNumber: Ref<number> = ref(1);
const scrollToNewChannelEntry: Ref<boolean> = ref(true)

const props = defineProps<{
    channelEditTitle: string
    confirmMoveTitle: string
    inputChannel: VDRChannel|null
}>()

function moveChannel() {
    if (props.inputChannel) {
        emit('moveChannel', props.inputChannel, inputChannelNumber.value, scrollToNewChannelEntry.value)
    } else {
        console.error("no channel given to moveChanel()")
    }
}

const emit = defineEmits<{
  (e: 'abort'): void
  (e: 'moveChannel', channel: VDRChannel, position: number, scroll: boolean): void
}>()
</script>
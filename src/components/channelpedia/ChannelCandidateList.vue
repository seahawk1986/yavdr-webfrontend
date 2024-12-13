<template>
  <v-dialog
    v-model="showChannelNumberInputDialogue"
    max-width="500"
  >
    <MoveChannelInput
      :channel-edit-title="t('channels.moveToPosition', { name: inputChannel?.name })"
      :confirm-move-title="t('channels.moveChannel')"
      :input-channel="inputChannel"
      @abort="showChannelNumberInputDialogue = false"
      @move-channel="(channel: VDRChannel, position: number, scroll: boolean) => insertChannel(channel, position, scroll)"
    />
  </v-dialog>
  <v-list ref="channelCandidatesRef">
    <v-list-item
      v-for="channel in channelCandidates"
      :key="channel.channel_id"
      :title="`${channel.name} (${channel.provider})`"
      :disabled="channelIdSet.value.has(channel.channel_id) ? true : false"
      :class="'red'"
      :base-color="isRadio(channel) ? 'secondary' : ''" 
    >
      <template #prepend>
        <v-icon
          class="drag-handle"
          :icon="channel.is_group ? 'mdi-tag' : 'mdi-drag'"
          style="cursor: grab"
        />
      </template>
      <template #append>
        <v-btn
          aria-label="move to position"
          icon="mdi-dialpad"
          size="small"
          @click="showMoveChannelDialog(channel)"
        />
        <v-btn
          :aria-label="t('channels.appendChannel')"
          icon="mdi-plus"
          size="small"
          @click="$emit('addChannel', channel)"
        />
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { VDRChannel} from '@/stores/interfaces/VdrChannelInterface'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { onMounted, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  originalChannelCandidates: VDRChannel[]
  channelIdSet: Ref<Set<string>>
}>()

const showChannelNumberInputDialogue: Ref<boolean> = ref(false)
const inputChannel: Ref<VDRChannel|null> = ref(null)

const emit = defineEmits<{
  (e: 'addChannel', channel: VDRChannel): void
  (e: 'insertChannel', channel: VDRChannel, number: number, scroll: boolean): void
}>()

const [channelCandidatesRef, channelCandidates] = useDragAndDrop([] as VDRChannel[], {
  group: 'channels',
  multiDrag: true,
  selectedClass: 'bg-indigo-accent-4',
  dragHandle: '.drag-handle',
  // scrollBehavior: { x: 0.9, y: 0.9, scrollOutside: false },
  plugins: [
    // animations()
    // multiDrag({
    //   plugins: [
    //     selections({
    //       selectedClass: 'bg-indigo-accent-4'
    //     })
    //   ]
    // })
  ],
  sortable: false
})

function showMoveChannelDialog(channel: VDRChannel) {
  showChannelNumberInputDialogue.value = true
  inputChannel.value = channel
}

function insertChannel(channel: VDRChannel, position: number, scroll: boolean) {
  if (channel !== null && position !== null) {
    console.log("insert channel", channel, "at position", position, "scroll:", scroll)
    emit('insertChannel', channel, position, scroll)
    inputChannel.value = null
    showChannelNumberInputDialogue.value = false
  }
}

function isRadio(channel: VDRChannel): boolean {
  const parts = channel.channel_string.split(':')
  // console.log(channel.channel_string, '->', parts, ':', (Number(parts[5]) <= 1))
  return Boolean(Number(parts[5]) <= 1)
}

onMounted(async () => {
  channelCandidates.value = props.originalChannelCandidates
})

watch([channelCandidates], () => {
  channelCandidates.value = props.originalChannelCandidates
})
</script>

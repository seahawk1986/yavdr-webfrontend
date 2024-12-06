<template>
  <v-dialog
    v-model="showChannelNumberInputDialogue"
    max-width="500"
  >
    <v-card :title="t('channels.moveToPosition', {name: inputChannel?.name})">
      <v-card-text>
        <v-number-input
          v-model="inputChannelNumber"
          :label="t('channels.channelNumber')"
          :min="1"
          prepend-icon="mdi-pound"
          autofocus
          @focus="$event.target.select()"
          @keyup.enter="insertChannel"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />

        <v-btn
          text="Cancel"
          @click="showChannelNumberInputDialogue = false"
        />
        <v-btn
          :text="t('channels.insertChannel')"
          @click="insertChannel"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-list ref="channelCandidatesRef">
    <v-list-item
      v-for="channel in channelCandidates"
      :key="channel.channel_id"
      :title="`${channel.name} (${channel.provider})`"
      :disabled="channelIdSet.value.has(channel.channel_id) ? true : false"
      :class="'red'"
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
// import { animations } from '@formkit/drag-and-drop'
import { onMounted, watch, type Ref } from 'vue'
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  originalChannelCandidates: VDRChannel[]
  channelIdSet: Ref<Set<string>>
}>()

const showChannelNumberInputDialogue: Ref<boolean> = ref(false)
const inputChannel: Ref<VDRChannel|null> = ref(null)
const inputChannelNumber: Ref<number> = ref(1)

const emit = defineEmits<{
  (e: 'addChannel', channel: VDRChannel): void
  (e: 'insertChannel', channel: VDRChannel, number: number): void
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

function insertChannel() {
  if (inputChannel.value !== null && inputChannelNumber.value !== null) {
    console.log("insert channel", inputChannel.value, "at position", inputChannelNumber.value)
    emit('insertChannel', inputChannel.value, inputChannelNumber.value)
    inputChannel.value = null
    showChannelNumberInputDialogue.value = false
  }
}

onMounted(async () => {
  channelCandidates.value = props.originalChannelCandidates
})

watch([channelCandidates], () => {
  channelCandidates.value = props.originalChannelCandidates
})
</script>

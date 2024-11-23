<template>
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
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { VDRChannel as VDRChannelInterface } from '@/stores/interfaces/VdrChannelInterface'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'
import { onMounted, watch, type Ref } from 'vue'

const props = defineProps<{
  originalChannelCandidates: VDRChannelInterface[]
  channelIdSet: Ref<
    Set<string> & Omit<Set<string>, keyof Set<any>>,
    Set<string> | (Set<string> & Omit<Set<string>, keyof Set<any>>)
  >
}>()

const [channelCandidatesRef, channelCandidates] = useDragAndDrop([] as VDRChannelInterface[], {
  group: 'channels',
  multiDrag: true,
  selectedClass: 'bg-indigo-accent-4',
  dragHandle: '.drag-handle',
  // scrollBehavior: { x: 0.9, y: 0.9, scrollOutside: false },
  plugins: [
    animations()
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

onMounted(async () => {
  channelCandidates.value = props.originalChannelCandidates
})

watch([channelCandidates], () => {
  channelCandidates.value = props.originalChannelCandidates
})
</script>

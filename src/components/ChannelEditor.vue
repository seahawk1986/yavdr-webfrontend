<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { useGoTo } from 'vuetify'
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { animations } from '@formkit/drag-and-drop'
import { useBackendStore } from '@/stores/backend'
import SourceSelection from './channelpedia/SourceSelection.vue'
import type { VDRChannel } from '@/stores/interfaces/VdrChannelInterface'

const store = useBackendStore()
const goTo = useGoTo()

const [channelsConfRef, channelsConf] = useDragAndDrop([] as VDRChannel[], {
  group: 'channels',
  multiDrag: true,
  selectedClass: 'bg-indigo-accent-4',
  dragHandle: '.drag-handle',
  scrollBehavior: { x: 0.9, y: 0.9, scrollOutside: true },

  plugins: [
    animations()
    // multiDrag({
    //   plugins: [
    //     // selections({
    //     //   selectedClass: 'bg-indigo-accent-4'
    //     // })
    //   ]
    // })
  ]
})

const channelIdSet = computed(() => {
  const _channelIdSet = ref(new Set() as Set<string>)
  channelsConf.value.map((channel) => {
    _channelIdSet.value.add(channel.channel_id)
  })
  return _channelIdSet
})

const runningChannelNumbers = computed(() => {
  const channelNumberList: Array<number> = []
  let runningNumber = 1
  channelsConf.value.map((channel) => {
    if (channel.is_group) {
      runningNumber = Math.max(runningNumber, channel.number)
      channelNumberList.push(channel.number)
    } else {
      channelNumberList.push(runningNumber)
      runningNumber++
    }
  })
  return channelNumberList
})

const channelNumberPadding = computed(() => {
  if (runningChannelNumbers.value) {
    const max_value = Math.max(...runningChannelNumbers.value)
    return max_value?.toString().length + 1
  } else {
    return 4
  }
})

// https://stackoverflow.com/a/61511955
function waitForElm(selector: string): Promise<Element | null> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve(document.querySelector(selector))
      }
    })

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

const showGroupAddDialog: Ref<boolean> = ref(false)
const newChannelGroupName: Ref<string> = ref('Change Me')
const newChannelGroupNumber: Ref<number | null> = ref(null)
const addChannelGroup = async function () {
  showGroupAddDialog.value = false
  console.log(
    'add channel group',
    newChannelGroupName.value,
    'at position',
    newChannelGroupNumber.value
  )
  // get a (at least locally unique) id - we only need this for the channel list on the client
  let uuid = null
  if (window.isSecureContext) {
    uuid = self.crypto.randomUUID()
  } else {
    const u = Date.now().toString(16) + Math.random().toString(16) + '0'.repeat(16)
    uuid = [
      u.substring(0, 8),
      u.substring(8, 4),
      '4000-8' + u.substring(13, 3),
      u.substring(16, 12)
    ].join('-')
  }
  const channelId = `${newChannelGroupName.value}-${uuid}`
  const newGroup = {
    channel_id: channelId,
    number: newChannelGroupNumber.value ? newChannelGroupNumber.value : 0,
    channel_string: newChannelGroupName.value,
    is_group: true,
    name: `${newChannelGroupName.value}`,
    provider: '',
    ca: '',
    source: ''
  }
  if (typeof newChannelGroupNumber.value !== 'undefined' && newChannelGroupNumber.value !== null) {
    const currentChannelGrupNumber = newChannelGroupNumber.value
    let position = runningChannelNumbers.value.findIndex((value) => {
      if (value > currentChannelGrupNumber) {
        return true
      }
    })
    position = Math.max(0, position - 1)
    console.log('inserting new group at position:', position)
    channelsConf.value = [
      ...channelsConf.value.slice(0, position),
      newGroup,
      ...channelsConf.value.slice(position)
    ]
  } else {
    channelsConf.value.push(newGroup)
  }
  console.log('Scroll to new channel Group')
  const element = await waitForElm(`#${CSS.escape(channelId)}`)
  if (element) {
    console.log('Scroll to new channel Group Element:', element)
    goTo(`#${CSS.escape(channelId)}`, scrollOptions.value)
  }
}

const scrollOptions = computed(() => {
  return {
    container: '#goto-container',
    duration: 100,
    easing: 'easeInOutCubic',
    offset: 0
  }
})

function getSourceIcon(source: string) {
  switch (source.slice(0, 1)) {
    case 'T':
      return 'mdi-antenna'
    case 'S':
      return 'mdi-satellite-variant'
    case 'C':
      return 'mdi-audio-input-stereo-minijack'
    default:
      return 'mdi-tag'
  }
}

const reloadChannels = async function () {
  try {
    channelsConf.value = await store.loadChannels()
  } catch (error) {
    console.log('could not load channelpedia sources', error)
  }
}

const deleteChannel = function (channel_id: string, channel_idx: number) {
  console.log('delete channel with id', channel_id, 'at index position', channel_idx)
  channelsConf.value.splice(channel_idx, 1)
}

onMounted(async () => {
  await reloadChannels()
})
</script>

<template>
  <!-- TODO: Channel Editor capabilities: 
    * Move channel to position number x
    * Swap two channels
    * Add channelgroup above/below
    * Scratchpad to park subgroups of channels
    -->
  <v-container>
    <v-row dense>
      <v-col
        cols="12"
        sm="6"
      >
        <SourceSelection :channel-id-set="channelIdSet" />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-card class="fill-height">
          <v-card-title>
            channels.conf

            <v-dialog
              v-model="showGroupAddDialog"
              max-width="500"
            >
              <v-card title="Create Channel Group">
                <v-card-text>
                  <v-text-field
                    v-model="newChannelGroupName"
                    label="Group Name"
                    prepend-icon="mdi-tag"
                  />
                  <v-number-input
                    v-model="newChannelGroupNumber"
                    :reverse="false"
                    :min="1"
                    control-variant="default"
                    label="Minimum channel number for group"
                    prepend-icon="mdi-at"
                    :hide-input="false"
                    :inset="false"
                  />
                </v-card-text>

                <v-card-actions>
                  <v-spacer />

                  <v-btn
                    text="Cancel"
                    @click="showGroupAddDialog = false"
                  />
                  <v-btn
                    text="Add Channel Group"
                    @click="addChannelGroup()"
                  />
                </v-card-actions>
              </v-card>
            </v-dialog>
            <!-- <v-btn @click="addChannelGroupClicked" color="secondary">Add channel group</v-btn> -->
            <v-dialog :model-value="showGroupAddDialog">
              Foo
            </v-dialog>
          </v-card-title>
          <v-card-text>
            <div>
              <!-- TODO: how to use drag and drop in a vuetifyjs VirtualScroll Element? -->
              <v-list
                id="goto-container"
                ref="channelsConfRef"
                density="compact"
                class="overflow-y-auto"
                max-height="75vh"
              >
                <v-list-item
                  v-for="(channel, channel_idx) in channelsConf"
                  :id="channel.channel_id"
                  :key="channel.channel_id"
                  style="cursor: grab"
                >
                  <template #title>
                    {{ channel.name + (channel.is_group ? '' : ` (${channel.provider})`) }}
                  </template>
                  <template #prepend>
                    <v-icon
                      class="drag-handle"
                      icon="mdi-drag"
                    />
                    <pre>{{
                      (!channel.is_group
                        ? runningChannelNumbers[channel_idx]?.toString()
                        : `${channel.number > 0 ? `@${channel.number.toString()}` : ''}`
                      ).padStart(channelNumberPadding, ' ') + ' '
                    }}</pre>
                    <v-icon :icon="getSourceIcon(channel.source)" />
                  </template>
                  <template #append>
                    <v-btn
                      v-if="channel.is_group"
                      icon="mdi-pencil"
                      size="small"
                      aria-label="edit"
                    />
                    <v-btn
                      icon="mdi-close-circle"
                      size="small"
                      aria-label="delete"
                      @click="deleteChannel(channel.channel_id, channel_idx)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="surface-variant"
              text="Reload VDR channels"
              prepend-icon="mdi-reload"
              variant="flat"
              @click="reloadChannels"
            />
            <v-btn
              color="surface-variant"
              text="Create Channel Group"
              prepend-icon="mdi-plus"
              variant="flat"
              @click="showGroupAddDialog = true"
            />
            <v-btn
              color="surface-variant"
              text="Save changes"
              prepend-icon="mdi-send"
              variant="flat"
              @click="reloadChannels"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

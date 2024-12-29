<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue"
import { useGoTo } from "vuetify"
import { useLayout } from "vuetify"
import { useDragAndDrop } from "@formkit/drag-and-drop/vue"
// import { animations, dropOrSwap, insert } from '@formkit/drag-and-drop'
import { useBackendStore } from "@/stores/backend";
import SourceSelection from "./channelpedia/SourceSelection.vue"
import type { VDRChannel } from "@/stores/interfaces/VdrChannelInterface"

import { useI18n } from "vue-i18n"
const { t } = useI18n();

const layout = useLayout()
const store = useBackendStore()
const goTo = useGoTo()


const [channelsConfRef, channelsConf] = useDragAndDrop([] as VDRChannel[], {
  group: "channels",
  multiDrag: true,
  selectedClass: "bg-light-blue-darken-4",
  dragHandle: ".drag-handle",
  scrollBehavior: { x: 0.9, y: 0.9, scrollOutside: true },

  plugins: [],
});

const channelIdSet = computed(() => {
  const _channelIdSet = ref(new Set() as Set<string>);
  channelsConf.value.map((channel) => {
    _channelIdSet.value.add(channel.channel_id);
  });
  return _channelIdSet;
});

const runningChannelNumbers = computed(() => {
  const channelNumberList: Array<number> = [];
  let runningNumber = 1;
  channelsConf.value.map((channel) => {
    if (channel.is_group) {
      runningNumber = Math.max(runningNumber, channel.number);
      channelNumberList.push(channel.number);
    } else {
      channelNumberList.push(runningNumber);
      runningNumber++;
    }
  });
  return channelNumberList;
});

const channelNumberPadding = computed(() => {
  if (runningChannelNumbers.value) {
    const max_value = Math.max(...runningChannelNumbers.value);
    return max_value?.toString().length + 1;
  } else {
    return 4;
  }
});

// https://stackoverflow.com/a/61511955
function waitForElm(selector: string): Promise<Element | null> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

const showGroupAddDialog: Ref<boolean> = ref(false);
// const newChannelGroupName: Ref<string> = ref(t("channels.channelGroup"));
// const newChannelGroupNumber: Ref<number | null> = ref(null);

const addChannelGroup = async function (newName: string, newPosition: number|null, scrollToNewGroup: boolean) {
  showGroupAddDialog.value = false;
  console.log(
    "add channel group",
    newName,
    "at position",
    newPosition
  );
  // get a (at least locally unique) id - we only need this for the channel list on the client
  let uuid = null;
  if (window.isSecureContext) {
    uuid = self.crypto.randomUUID();
  } else {
    const u =
      Date.now().toString(16) + Math.random().toString(16) + "0".repeat(16);
    uuid = [
      u.substring(0, 8),
      u.substring(8, 4),
      "4000-8" + u.substring(13, 3),
      u.substring(16, 12),
    ].join("-");
  }
  const channelId = `${newName}-${uuid}`;
  const newGroup = {
    channel_id: channelId,
    number: newPosition ? newPosition : -1,
    channel_string: newName,
    is_group: true,
    is_radio: false,
    name: `${newName}`,
    provider: "",
    ca: "",
    source: "",
  };
  console.log("newGroup has number", newGroup.number);
  console.log("runningChannelNumbers", runningChannelNumbers.value);
  if (newPosition !== null) {
    const currentChannelGrupNumber = newGroup.number;
    let position = runningChannelNumbers.value.findIndex((value) => {
      if (value > currentChannelGrupNumber) {
        return true;
      }
    });
    if (position < 0) {
      console.log(
        "all numbers are smaller than the group number, so we append it at the end"
      );
      position = channelsConf.value.length;
    } else {
      console.log("newGroup got calculated position", position);
      position = Math.max(0, position - 1);
    }
    console.log("inserting new group at position:", position);
    channelsConf.value.splice(position, 0, newGroup);
  } else {
    channelsConf.value.push(newGroup);
  }
  if (scrollToNewGroup) {
    console.log("Scroll to new channel Group");
    const element = await waitForElm(`#${CSS.escape(channelId)}`);
    if (element) {
      console.log("Scroll to new channel Group Element:", element);
      goTo(`#${CSS.escape(channelId)}`, scrollOptions.value);
    }
  }

  // clear the inputs
  // newChannelGroupName.value = "";
  // newChannelGroupNumber.value = null;
};

async function scroll_to_channel_id(channelId: string) {
  console.log("Scroll to channelId", channelId);
  const element = await waitForElm(`#${CSS.escape(channelId)}`);
  if (element) {
    console.log("Scroll to new channel Element:", element);
    goTo(`#${CSS.escape(channelId)}`, scrollOptions.value);
  }
}

const scrollOptions = computed(() => {
  return {
    container: "#goto-container",
    duration: 100,
    easing: "easeInOutCubic",
    offset: 0,
  };
});

function getSourceIcon(source: string) {
  if (!source) return "mdi-tag"
  switch (source.slice(0, 1)) {
    case "T":
      return "mdi-antenna";
    case "S":
      return "mdi-satellite-variant";
    case "C":
      return "mdi-audio-input-stereo-minijack";
    default:
      return "mdi-tag";
  }
}

function isRadio(channel: VDRChannel): boolean {
  const parts = channel.channel_string.split(':')
  // console.log(channel.channel_string, '->', parts, ':', (Number(parts[5]) <= 1))
  return Boolean(Number(parts[5]) <= 1)
}

const reloadChannels = async function () {
  try {
    channelsConf.value = await store.loadChannels();
  } catch (error) {
    console.log("could not load channelpedia sources", error);
  }
};

const showMoveChannelInputDialogue: Ref<boolean> = ref(false);
const inputChannel: Ref<VDRChannel|null> = ref(null);

function showInputChannelNumber(channel: VDRChannel) {
  inputChannel.value = channel
  showMoveChannelInputDialogue.value = true;
}

function insertChannel(channel: VDRChannel, number: number, scroll: boolean) {
  showMoveChannelInputDialogue.value = false
  console.log("move channel", channel, "to position", number)
  if (channelIdSet.value.value.has(channel.channel_id)) {
    const old_idx = channelsConf.value.findIndex((element: VDRChannel) => {
      return element.channel_id === channel.channel_id;
    })
    const old_channel  = channelsConf.value.splice(old_idx, 1)
    console.log("removed old channel:", old_channel)
  }
  const channelNumber = number;
  console.log("splice", channel, "into VDRChannels at", channelNumber);
  let position = runningChannelNumbers.value.findIndex((value: number) => {
    if (value >= channelNumber) {
      return true;
    }
  });
  if (position < 0) {
    channelsConf.value.push(channel);
  } else {
    if (channelsConf.value[position].is_group) {
      position++;
    }
    channelsConf.value.splice(position, 0, channel);
  }
  if (scroll) {
    scroll_to_channel_id(channel.channel_id);
  }
}

const deleteChannel = function (channel_id: string, channel_idx: number) {
  console.log(
    "delete channel with id",
    channel_id,
    "at index position",
    channel_idx
  );
  channelsConf.value.splice(channel_idx, 1);
};

onMounted(async () => {
  await reloadChannels();
  console.log("Main rect size", layout.mainRect.value)
  console.log("row dimensions", layout.getLayoutItem('secondRow'))
});
</script>

<template>
  <!-- TODO: Channel Editor capabilities: 
    * Move channel to position number x
    * Swap two channels
    * Add channelgroup above/below
    * Scratchpad to park subgroups of channels
    * Upload/Download channels.conf
    -->
  <v-container class="fill-height">
    <v-row
      id="secondRow"
      dense
      fill-height
    >
      <v-col
        cols="12"
        sm="6"
      >
        <SourceSelection
          :channel-id-set="channelIdSet"
          @add-channel="
            (channel) => {
              channelsConf.push(channel);
              scroll_to_channel_id(channel.channel_id);
            }
          "
          @insert-channel="(channel: VDRChannel, number: number, scroll: boolean) => {insertChannel(channel, number, scroll)}"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >   
        <v-card>
          <v-card-title>
            channels.conf
            <v-divider
              class="ms-3"
              inset
              vertical
            />
            <v-btn
              color="info"
              :text="t('channels.reloadVDRChannels')"
              prepend-icon="mdi-reload"
              variant="flat"
              @click="reloadChannels"
            />
            <v-dialog
              v-model="showGroupAddDialog"
              max-width="500"
            >
              <CreateChannelGroupInput
                :channel-group-edit-title="t('channels.createGroup')"
                :input-channel="inputChannel"
                :confirm-button-title="t('channels.createNewChannelGroup')"
                :cancel-button-title="t('actions.cancel')"
                @abort="showGroupAddDialog = false"
                @confirm-edit="(name, position, scroll) => addChannelGroup(name, position, scroll)"
              />
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
                max-height="80vh"
              >
                <v-list-item
                  v-for="(channel, channel_idx) in channelsConf"
                  :id="channel.channel_id"
                  :key="channel.channel_id"
                  density="compact"
                  :base-color="isRadio(channel) ? 'secondary' : ''"
                >
                  <template #title>
                    {{
                      channel.name +
                        (channel.is_group ? "" : ` (${channel.provider})`)
                    }}
                  </template>
                  <template #prepend>
                    <v-icon
                      class="drag-handle"
                      icon="mdi-drag"
                      style="cursor: grab"
                    />
                    <pre>{{
                      (!channel.is_group
                        ? runningChannelNumbers[channel_idx]?.toString()
                        : `${
                            channel.number > 0
                              ? `@${channel.number.toString()}`
                              : ""
                          }`
                      ).padStart(channelNumberPadding, " ") + " "
                    }}</pre>
                    <v-icon
                      :color="isRadio(channel) ? 'secondary' : ''"
                      :icon="getSourceIcon(channel.source)"
                    />
                  </template>
                  <template #append>
                    <v-btn
                      v-if="channel.is_group"
                      icon="mdi-pencil"
                      size="small"
                      aria-label="edit"
                    />
                    <v-btn
                      v-else
                      icon="mdi-dialpad"
                      size="small"
                      aria-label="move to position"
                      @click="showInputChannelNumber(channel)"
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
              color="secondary-darken-1"
              :text="t('channels.createGroup')"
              prepend-icon="mdi-plus"
              variant="flat"
              @click="showGroupAddDialog = true"
            />
            <v-dialog
              v-model="showMoveChannelInputDialogue"
              max-width="500"
            >
              <MoveChannelInput
                :channel-edit-title="t('channels.moveToPosition', { name: inputChannel?.name })"
                :confirm-move-title="t('channels.moveChannel')"
                :input-channel="inputChannel"
                @abort="showMoveChannelInputDialogue = false"
                @move-channel="(channel: VDRChannel, position: number, scroll: boolean) => insertChannel(channel, position, scroll)"
              />
            </v-dialog>
            <v-btn
              color="primary"
              :text="t('actions.saveChanges')"
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

<i18n>

</i18n>

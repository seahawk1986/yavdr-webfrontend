<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue";
import { useGoTo } from "vuetify";
import { VNumberInput } from "vuetify/labs/VNumberInput";
import { useDragAndDrop } from "@formkit/drag-and-drop/vue";
// import { animations, dropOrSwap, insert } from '@formkit/drag-and-drop'
import { useBackendStore } from "@/stores/backend";
import SourceSelection from "./channelpedia/SourceSelection.vue";
import type { VDRChannel } from "@/stores/interfaces/VdrChannelInterface";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const store = useBackendStore();
const goTo = useGoTo();

// const insertPointClasses = [
//   "absolute",
//   "bg-blue-500",
//   "z-[1000]",
//   "rounded-full",
//   "duration-[5ms]",
//   "before:block",
//   'before:content-["Insert"]',
//   "before:whitespace-nowrap",
//   "before:block",
//   "before:bg-blue-500",
//   "before:py-1",
//   "before:px-2",
//   "before:rounded-full",
//   "before:text-xs",
//   "before:absolute",
//   "before:top-1/2",
//   "before:left-1/2",
//   "before:-translate-y-1/2",
//   "before:-translate-x-1/2",
//   "before:text-white",
//   "before:text-xs",
// ];

const [channelsConfRef, channelsConf] = useDragAndDrop([] as VDRChannel[], {
  group: "channels",
  multiDrag: true,
  selectedClass: "bg-indigo-accent-4",
  dragHandle: ".drag-handle",
  scrollBehavior: { x: 0.9, y: 0.9, scrollOutside: true },

  plugins: [
    // dropOrSwap({
    //   shouldSwap: () => false,
    // }),
    // animations()
    // multiDrag({
    //   plugins: [
    //     // selections({
    //     //   selectedClass: 'bg-indigo-accent-4'
    //     // })
    //   ]
    // })
    // insert({
    //   insertPoint: (parent) => {
    //     const div = document.createElement("div");
    //     for (const cls of insertPointClasses) div.classList.add(cls);
    //     return div;
    //   },
    // }),
  ],
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
const channelEditTitle: Ref<string> = ref(t("channels.createGroup"));
const newChannelGroupName: Ref<string> = ref(t("channels.channelGroup"));
const newChannelGroupNumber: Ref<number | null> = ref(null);
const addChannelGroup = async function () {
  // if (newChannelGroupName.value.length == 0) {
  //   return
  // }
  showGroupAddDialog.value = false;
  console.log(
    "add channel group",
    newChannelGroupName.value,
    "at position",
    newChannelGroupNumber.value
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
  const channelId = `${newChannelGroupName.value}-${uuid}`;
  const newGroup = {
    channel_id: channelId,
    number: newChannelGroupNumber.value ? newChannelGroupNumber.value : -1,
    channel_string: newChannelGroupName.value,
    is_group: true,
    name: `${newChannelGroupName.value}`,
    provider: "",
    ca: "",
    source: "",
  };
  console.log("newGroup has number", newGroup.number);
  console.log("runningChannelNumbers", runningChannelNumbers.value);
  if (
    typeof newChannelGroupNumber.value !== "undefined" &&
    newChannelGroupNumber.value !== null
  ) {
    const currentChannelGrupNumber = newGroup.number;
    let position = runningChannelNumbers.value.findIndex((value) => {
      if (value > currentChannelGrupNumber) {
        return true;
      }
    });
    if (position < 0) {
      console.log(
        "all numbers are smaller than the group number, so wie append it at the end"
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
  console.log("Scroll to new channel Group");
  const element = await waitForElm(`#${CSS.escape(channelId)}`);
  if (element) {
    console.log("Scroll to new channel Group Element:", element);
    goTo(`#${CSS.escape(channelId)}`, scrollOptions.value);
  }

  // clear the inputs
  newChannelGroupName.value = "";
  newChannelGroupNumber.value = null;
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

const reloadChannels = async function () {
  try {
    channelsConf.value = await store.loadChannels();
  } catch (error) {
    console.log("could not load channelpedia sources", error);
  }
};

const showChannelNumberInputDialogue: Ref<boolean> = ref(false);
const inputChannelNumber: Ref<number> = ref(1);
const inputChannel: Ref<VDRChannel|null> = ref(null);

function showInputChannelNumber(channel: VDRChannel) {
  inputChannel.value = channel
  showChannelNumberInputDialogue.value = true;
}

function insertChannel(channel: VDRChannel, number: number) {
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
  scroll_to_channel_id(channel.channel_id);
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
});
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
        <SourceSelection
          :channel-id-set="channelIdSet"
          @add-channel="
            (channel) => {
              channelsConf.push(channel);
              scroll_to_channel_id(channel.channel_id);
            }
          "
          @insert-channel="(channel: VDRChannel, number: number) => {insertChannel(channel, number)}"
        />
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-card class="fill-height">
          <v-card-title>
            channels.conf
            <v-divider
              class="ms-3"
              inset
              vertical
            />
            <v-btn
              color="info"
              text="Reload VDR channels"
              prepend-icon="mdi-reload"
              variant="flat"
              @click="reloadChannels"
            />
            <v-dialog
              v-model="showGroupAddDialog"
              max-width="500"
            >
              <v-card :title="channelEditTitle">
                <v-card-text>
                  <v-text-field
                    v-model="newChannelGroupName"
                    label="Group Name"
                    prepend-icon="mdi-tag"
                    required
                    autofocus
                    @focus="$event.target.select()"
                    @keyup.enter="addChannelGroup"
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
                    @keyup.enter="addChannelGroup"
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
                    @click="addChannelGroup"
                  />
                </v-card-actions>
              </v-card>
            </v-dialog>
            <!-- <v-btn @click="addChannelGroupClicked" color="secondary">Add channel group</v-btn> -->
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
                  density="compact"
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
              text="Create Channel Group"
              prepend-icon="mdi-plus"
              variant="flat"
              @click="showGroupAddDialog = true"
            />
            <v-dialog
              v-model="showChannelNumberInputDialogue"
              max-width="500"
            >
              <!-- move channel dialog -->
              <v-card :title="t('channels.moveToPosition', { name: inputChannel?.name })">
                <v-card-text>
                  <v-number-input
                    v-model="inputChannelNumber"
                    :label="t('channels.channelNumber')"
                    :min="1"
                    prepend-icon="mdi-pound"
                    autofocus
                    @focus="$event.target.select()"
                    @keyup.enter="{
                      if (inputChannel) {
                        insertChannel(inputChannel, inputChannelNumber);
                        showChannelNumberInputDialogue = false
                      }
                    }"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <!-- TODO: fix warning when opening dialogue -->
                  <v-btn
                    text="Cancel"
                    @click="showChannelNumberInputDialogue = false"
                  />
                  <v-btn
                    :text="t('channels.insertChannel')"
                    @click="{
                      if (inputChannel) {
                        insertChannel(inputChannel, inputChannelNumber);
                        showChannelNumberInputDialogue = false
                      }
                    }"
                  />
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-btn
              color="primary"
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

<i18n>

</i18n>

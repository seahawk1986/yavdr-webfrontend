
<template>
  <!-- TODO: Channel Editor capabilities:
    * Swap two channels
    * Add channelgroup above/below
    * Scratchpad to park subgroups of channels
    * Upload/Download channels.conf
    -->
  <v-container
    :class="['pa-0', smAndUp ? 'fill-height' : '']"
    fluid
  >
    <v-row
      id="secondRow"
      dense
      fill-height
      justify="center"
      no-gutters
      :class="['flex-column flex-sm-row', smAndUp ? 'fill-height' : '']"
      :style="!smAndUp ? 'height: auto;' : ''"
    >
      <v-col
        cols="12"
        sm="6"
        :class="['d-flex flex-column', smAndUp ? 'fill-height' : '']"
      >
        <v-card
          :class="['ma-2 d-flex flex-column', smAndUp ? 'fill-height' : '']"
          :style="!smAndUp ? 'height: 500px;' : ''"
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
        </v-card>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        :class="['d-flex flex-column', smAndUp ? 'fill-height' : '']"
        style="min-height: 0;"
      >
        <v-card
          :class="['ma-2 d-flex flex-column', smAndUp ? 'fill-height' : '']"
        >
          <v-card-title>
            <v-row justify="center">
              <v-col
                cols="12"
                md="4"
              >
                channels.conf
              </v-col>
              <v-col
                cols="12"
                md="8"
              >
                <v-btn
                  color="info"
                  :text="t('channels.reloadVDRChannels')"
                  prepend-icon="mdi-reload"
                  variant="flat"
                  block
                  @click="reloadChannels"
                />
              </v-col>
            </v-row>
            <v-dialog
              v-model="showGroupAddDialog"
              max-width="500"
              persistent
            >
              <ChannelGroupInput
                :channel-group-edit-title="t('channels.createGroup')"
                :old-channel-group="inputChannel"
                :confirm-button-title="confirmGroupDialogTitle"
                :cancel-button-title="t('actions.cancel')"
                @abort="showGroupAddDialog = false"
                @confirm="(name: string, position: number|null, scroll: boolean) => processChannelGroup(name, position, scroll)"
                @keydown.esc="showGroupAddDialog = false"
              />
            </v-dialog>
          </v-card-title>
          <v-card-text
            ref="cardTextRef"
            class="flex-grow-1 overflow-y-auto pa-0"
            style="min-height: 0;"
          >
            <!-- TODO: how to use drag and drop in a vuetifyjs VirtualScroll Element? -->
            <v-list
              id="goto-container"
              ref="channelsConfRef"
              density="compact"
              variant="text"
              border
            >
              <v-list-item
                v-for="(channel, channel_idx) in channelsConf"
                :id="channel.channel_id"
                :key="channel.channel_id"
                role="listitem"
                :aria-label="t('channels.channelNumberN', {number: runningChannelNumbers[channel_idx]?.toString()}) + ', ' + channel.name"
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
                    :aria-label="t('descriptions.draghandle', {name: channel.name})"
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
                  <v-divider
                    vertical
                    thickness="5"
                    opacity="0"
                  />
                  <v-icon
                    :color="isRadio(channel) ? 'secondary' : ''"
                    :icon="isRadio(channel) ? 'mdi-radio' : (channel.is_group ? 'mdi-list-box-outline' : 'mdi-television')"
                  />
                </template>
                <template #append>
                  <div class="justify-center flex-wrap ga-2">
                    <v-icon-btn
                      v-if="channel.is_group"
                      v-tooltip="t('channels.editGroup', {what: channel.name})"
                      icon="mdi-pencil"
                      color="primary"
                      variant="tonal"
                      density="comfortable"
                      :aria-label="t('actions.edit')"
                      @click="editGroup(channel)"
                    />
                    <v-icon-btn
                      v-else
                      v-tooltip="t('channels.changePosition', {name: channel.name})"
                      icon="mdi-dialpad"
                      variant="tonal"
                      color="primary"
                      density="comfortable"
                      :aria-label="t('channels.changePosition', {name: channel.name})"
                      @click="showChannelNumberInput(channel)"
                    />
                    <v-divider
                      vertical
                      opacity="0.0"
                      thickness="5"
                    />
                    <v-icon-btn
                      v-tooltip="channel.is_group ? t('channels.deleteChannelGroup', {what: channel.name}) : t('channels.deleteChannel', {what: channel.name})"
                      icon="mdi-close-circle"
                      variant="tonal"
                      color="red"
                      density="comfortable"
                      :aria-label="t('channels.deleteChannel', {what: channel.name})"
                      @click="deleteChannel(channel.channel_id, channel_idx)"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="justify-center flex-wrap ga-2">
            <v-btn
              color="secondary-darken-1"
              :text="t('channels.createGroup')"
              prepend-icon="mdi-plus"
              variant="tonal"
              @click="addGroup"
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
              :loading="isSaving"
              color="primary"
              :text="t('actions.save')"
              prepend-icon="mdi-floppy"
              variant="flat"
              @click="saveChanges"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue"
// import { useConfirmDialog } from '@vueuse/core'
import { useLayout, useDisplay, useGoTo} from "vuetify"
import type { VCardText } from 'vuetify/components'
import { useDragAndDrop } from "@formkit/drag-and-drop/vue"
// import { animations, dropOrSwap, insert } from '@formkit/drag-and-drop'
// import { useBackendStore } from "@/stores/backend";
import { useVDRStore } from "@/stores/vdr";
import SourceSelection from "./channelpedia/SourceSelection.vue"
import type { VDRChannel } from "@/stores/interfaces/VdrChannelInterface"
import { useBackendStore } from "@/stores/backend";
import { useI18n } from "vue-i18n";

const { smAndUp, mobile } = useDisplay()
// import { downloadBlob } from "@/services/download";
const { t } = useI18n()

const backend = useBackendStore();

const layout = useLayout()
// const backend = useBackendStore()
const vdr = useVDRStore()
const goTo = useGoTo()
// Extract the options type from the goTo function's second argument
type GoToOptions = Parameters<typeof goTo>[1]

// Dynamically enable/disable main page scrolling
watchEffect(() => {
  if (mobile.value) {
    document.documentElement.style.overflow = 'auto'
  } else {
    document.documentElement.style.overflow = 'hidden'
  }
})

// const revealChannelGroupInput: Ref<boolean> = ref(false)
// const ChannelGroupDialog = useConfirmDialog(revealChannelGroupInput)

// async function openChannelGroupDialog(group: VDRChannel|undefined) {
//   const {data, isCancelled }: {data: any, isCancelled: boolean} = await ChannelGroupDialog.reveal()
//   if (!isCancelled) {
//     console.log(data)
//   }
// }

const showMoveChannelInputDialogue: Ref<boolean> = ref(false);
const groupDialogTitle: Ref<string> = ref(t('channels.createGroup'))
const confirmGroupDialogTitle: Ref<string> = ref(t('channels.createGroup'))
const inputChannel: Ref<VDRChannel|null> = ref(null);
const isSaving = ref(false)


const [channelsConfRef, channelsConf] = useDragAndDrop([] as VDRChannel[], {
  group: "channels",
  selectedClass: "bg-light-blue-darken-4",
  dragHandle: ".drag-handle",
  multiDrag: true,
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

const editGroup = async function(group: VDRChannel) {
  inputChannel.value = group
  groupDialogTitle.value = t('channels.editGroup')
  confirmGroupDialogTitle.value = t('channels.editGroup')
  showGroupAddDialog.value = true
}

const addGroup = async function() {
  inputChannel.value = null
  groupDialogTitle.value = t('channels.createGroup')
  confirmGroupDialogTitle.value = t('channels.createGroup')
  showGroupAddDialog.value = true
}

const processChannelGroup = async function (newName: string, newPosition: number|null, scrollToNewGroup: boolean) {
  const oldChannel = inputChannel.value
  showGroupAddDialog.value = false
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
  if (oldChannel !== null) {
    // update the old channel group
    console.log("edit existing channel group")
    const idx = channelsConf.value.findIndex((channel) => oldChannel.channel_id === channel.channel_id)
    channelsConf.value[idx].name = newName
    channelsConf.value[idx].number = newPosition ? newPosition : -1
    channelsConf.value[idx].channel_id = channelId
  } else {
    console.log(
      "add channel group",
      newName,
      "at position",
      newPosition
    )

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
  }
  if (scrollToNewGroup) {
    console.log("Scroll to new channel Group");
    const css_identifier = `#${CSS.escape(channelId)}`
    const element = await waitForElm(css_identifier);
    if (element) {
      console.log("Scroll to new channel Group Element:", element);
      goTo(css_identifier, scrollOptions.value);
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

const cardTextRef = ref<InstanceType<typeof VCardText> | null>(null)

const scrollOptions = computed<GoToOptions>(() => {
  return {
    container: (cardTextRef.value?.$el as HTMLElement) || '#goto-container', //container: "#goto-container",
    duration: 100,
    easing: "easeInOutCubic",
    offset: -50,
  };
});

function getSourceIcon(source: string) {
  if (source.length == 0) return "mdi-tag"
  switch (source.slice(0, 1)) {
    case "T":
      return "mdi-antenna";
    case "S":
      return "mdi-satellite-variant";
    case "C":
      return "mdi-audio-input-stereo-minijack";
    case "I":
      return "mdi-IP"
    case "V":
      return "mdi-video-input-component"
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
    channelsConf.value = await vdr.loadChannels()
  } catch (error) {
    console.log("could not load channelpedia sources", error);
  }
};

async function saveChanges() {
  isSaving.value = true
  const newChannelsConfData = channelsConf.value.flatMap((entry) => {
    if (!entry.name.length && entry.number < 0)
    return []
    if (entry.is_group) { // handle channel groups
      if (entry.number > 0) {
        return `:@${entry.number}${entry.name.length > 0 ? " " + entry.name : ""}`
      } else {
        return `:${entry.name}`
      }
    } else {
      return entry.channel_string
    }
  })
  const blob = new Blob([newChannelsConfData.join('\n')], { type: "text/plain" });
  const file = new File([blob], 'channels.conf');
  const r = await backend.uploadFileWithStreamingResponseTC(
    'vdr/configfile', {filename: 'channels.conf', uploaded_file: file}, (data) => {console.log(data)},
  );
  console.log("file upload:", r);
  if (r) {
    // emit("saved");
  }
  // downloadBlob(channelsConfFile, 'channels.conf')
  isSaving.value = false
}

function showChannelNumberInput(channel: VDRChannel) {
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

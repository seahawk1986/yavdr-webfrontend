<template>
  <v-sheet
    class="scrollable-container overflow-auto"
    :height="height - backend.titlebarHeight"
  >
    <!-- <h1>EPG Viewer</h1> -->
    <v-label :text="`${t('channels.selection')}:`">
      <v-divider
        vertical
        thickness="5"
        opacity="0"
      />
      <v-select
        id="channel-selection"
        v-model="selectedChannel"
        :items="selectable_channels"
        item-title="name"
        item-value="channel_id"
        density="comfortable"
        hide-details="auto"
        :isloading="isLoading"
      />
    </v-label>
    <v-tooltip :text="t('channels.switchto', { channel: selectedChannelName })">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :aria-label="t('channels.switchto', { channel: selectedChannelName })"
          icon="mdi-television-classic"
          @click="switchChannel"
        />
      </template>
    </v-tooltip>
    <div v-if="isLoading">
      <v-progress-linear indeterminate />
    </div>
    <!-- <div v-else-if="epgChannelList.length === 0">
      Keine Epg Daten vorhanden.
    </div> -->
    <v-virtual-scroll
      v-else
      :height="height - 120"
      :items="epgChannelList"
      density="compact"
      aria-role="list"
      item-height="48"
    >
      <template #default="{ item, index }">
        <v-list-item
          v-if="index === 0"
          :title="
            date.format(
              item.dtStart.toPlainDate.toString(),
              'fullDateWithWeekday'
            )
          "
          variant="outlined"
          aria-role="listitem"
          slim
        >
          <template #prepend>
            <v-icon>mdi-calendar</v-icon>
          </template>
        </v-list-item>
        <v-list-item
          :title="item.title"
          :subtitle="
            item.subtitle
              ? item.subtitle
              : item.description
                ? item.description
                : ''
          "
          slim
          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >
          <template #prepend>
            <v-btn
              v-if="!item.has_timer"
              color="primary"
              :aria-label="
                t('timer.createTimer', {
                  entry: item.title,
                  start: formatTime(item.dtStart),
                  end: formatTime(item.dtEnd),
                })
              "
              icon="mdi-timer-plus-outline"
              size="x-small"
              @click="createTimer(item)"
            />
            <v-btn
              v-else
              color="red"
              :aria-label="
                t('timer.createTimer', {
                  entry: item.title,
                  start: formatTime(item.dtStart),
                  end: formatTime(item.dtEnd),
                })
              "
              icon="mdi-timer-edit-outline"
              size="x-small"
              @click="editTimer(item)"
            />
            <v-list-item
              :title="formatTimespan(item.dtStart, item.dtEnd)"
              :subtitle="`(${item.duration
                .total('minute')
                .toLocaleString()} min)`"
              lines="two"
              slim
            />
          </template>
        </v-list-item>
        <v-list-item
          v-if="item.crossDay"
          :title="
            date.format(
              item.dtEnd.toPlainDate.toString(),
              'fullDateWithWeekday'
            )
          "
          slim
          variant="outlined"
        />
        <!-- <v-divider v-else /> -->
      </template>
    </v-virtual-scroll>
  </v-sheet>
</template>

<script lang="ts" setup>
import { useBackendStore } from "@/stores/backend";
import { useNotificationStore } from "@/stores/notifications";
import { useVDRStore } from "@/stores/vdr";
import { useDate } from "vuetify";
import { Temporal } from "temporal-polyfill";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
import type { VDRTimerInterface } from "@/stores/interfaces/VdrTimerInterface";

const { height } = useDisplay();
const { t } = useI18n();
const date = useDate();
const backend = useBackendStore();
const notifications = useNotificationStore();
const vdr = useVDRStore();

interface epgEntryInterface {
  event_id: string;
  channel_id: string;

  title: string;
  subtitle: string;
  description: string;
  start: string;
  start_ts: number;
  duration: string;
}

interface epgListInterface {
  dtStart: Temporal.PlainDateTime;
  dtEnd: Temporal.PlainDateTime;
  duration: Temporal.Duration;
  title: string;
  subtitle: string | null;
  description: string | null;
  channelId: string | null;
  crossDay: boolean;
  has_timer: boolean;
  // isSeparator: boolean
}

const selectedChannel: Ref<string | null> = ref(null);
const selectedChannelName = computed(() => {
  return vdr.vdrChannels.find(
    (channel: { channel_id: string | null }) =>
      channel.channel_id == selectedChannel.value
  )?.name;
});
const isLoading: Ref<boolean> = ref(true);

const epgChannelList: Ref<epgListInterface[]> = ref([]);

const selectable_channels = computed(() => {
  return vdr.vdrChannels.filter((channel) => !channel.is_group)
})

function formatTime(dtTime: Temporal.PlainDateTime): string {
  return `${dtTime.hour.toString().padStart(2, "0")}:${dtTime.minute
    .toString()
    .padStart(2, "0")}`;
}

function formatTimespan(
  dtStart: Temporal.PlainDateTime,
  dtEnd: Temporal.PlainDateTime
) {
  return `${formatTime(dtStart)} - ${formatTime(dtEnd)}`;
}

async function loadEpgData(channel_id: string | null) {
  isLoading.value = true;
  const channelTimers = (await vdr.loadTimers()).filter(t => t.channel === channel_id)

  // get the EPG for this channel
  if (channel_id) {
    const response = await vdr.loadEPG(channel_id);
    if (response?.data) {
      const data: epgEntryInterface[] = response.data;
      epgChannelList.value = [];
      if (data) {
        const epgListData: epgListInterface[] = data.map((element) => {
          const dtStart = Temporal.PlainDateTime.from(element.start);
          const duration = Temporal.Duration.from(element.duration);
          const dtEnd = dtStart.add(duration);
          const crossDay = dtStart.day !== dtEnd.day ? true : false;

          function hasTimer(timer: VDRTimerInterface) {
            return (timer.start <= element.start_ts && timer.stop >= (element.start_ts + duration.total('seconds')))
          }

          const has_timer = channelTimers.some(hasTimer)

          return {
            channelId: element.channel_id,
            dtStart: dtStart,
            dtEnd: dtEnd,
            duration: duration,
            crossDay: crossDay,
            title: element.title,
            subtitle: element.subtitle,
            description: element.description,
            has_timer: has_timer
          };
        });
        epgChannelList.value = epgListData;
      }
    }
  }
  isLoading.value = false;
}
watch(selectedChannel, async (old_channel_id, channel_id) => {
  isLoading.value = true;
  if (old_channel_id !== channel_id || old_channel_id === null) {
    // epgChannelList.value = []
    await loadEpgData(channel_id);
  }
});

async function switchChannel() {
  const channel = selectedChannel.value;
  if (channel) {
    const response = await backend.postRequest(
      `/vdr/channel?channel=${encodeURIComponent(channel)}`,
      {}
    );
    if (response?.data) {
      const data = response.data
      console.log(data);
      if (data.startsWith("250 ")) {
        const msg = data.slice(3);
        console.log(data);
        console.log("queued msg: ", msg);
        notifications.messages.push({
          text: data.slice(3),
          timeout: 4000,
          color: "primary",
        });
      } else {
        notifications.messages.push({
          text: data,
          timeout: 1000,
          color: "secondary",
        });
      }
    } else {
      console.error("no channel selected");
    }
  }
}

async function createTimer(epgEntry: epgListInterface) {
  await backend.postRequest("/vdr/newt", {
    channel_id: epgEntry.channelId,
    dt_start: epgEntry.dtStart,
    dt_end: epgEntry.dtEnd,
    title: epgEntry.title,

  })
}

async function editTimer(epgEntry: epgListInterface) {
  console.log("edit timer for:", epgEntry)
  // TODO: find the matching timer
  // TODO: Implement a Timer editor dialog
}

onMounted(async () => {
  // load the channels
  await vdr.loadChannels();
  const first = selectable_channels.value.find(() => true);
  if (first) {
    selectedChannel.value = first.channel_id;
    await loadEpgData(selectedChannel.value);
  }
});
</script>

<style lang="css" scoped>
.v-list-item-subtitle {
  /* overflow: hidden; text-overflow: ellipsis; white-space: nowrap !important; */
  width: 80vw;
}
</style>

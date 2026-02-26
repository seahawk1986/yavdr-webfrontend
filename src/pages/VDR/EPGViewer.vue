<template>
  <v-sheet
    class="scrollable-container overflow-auto"
    :height="height - backend.titlebarHeight"
    style="min-width: 80%"
  >
    <v-toolbar flat rounded density="compact">
      <v-toolbar-title>
        {{ $t("category.epg") }} - {{ $t("channels.selection") }}:
      </v-toolbar-title>

      <v-icon-btn
        v-tooltip="t('channels.switchto', { channel: selectedChannelName })"
        :aria-label="t('channels.switchto', { channel: selectedChannelName })"
        color="primary"
        icon="mdi-television-classic"
        @click="switchChannel"
      />
      <v-divider vertical thickness="10" opacity="0" />
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
    </v-toolbar>

    <v-spacer vertical />

    <div v-if="isLoading">
      <v-progress-linear indeterminate />
    </div>
    <!-- <div v-else-if="epgChannelList.length === 0">
      Keine Epg Daten vorhanden.
    </div> -->
    <v-virtual-scroll
      v-else
      :height="height - 120"
      width="100dvw"
      :items="epgChannelList"
      item-key="event_id"
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
              'fullDateWithWeekday',
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
          class="text-truncate"
          :title="item.title"
          :subtitle="
            item.subtitle
              ? item.subtitle
              : item.description
                ? truncate(item.description, 80)
                : ''
          "
          slim
          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >
          <template #prepend>
            <template v-if="getEventTimer(item.event_id)">
              <EditTimer
                v-if="timerEvents.get(item.event_id)"
                :timer="timerEvents.get(item.event_id)"
                :aria-label="
                  t('timer.editTimer', {
                    entry: item.title,
                    start: formatTime(item.dtStart),
                    end: formatTime(item.dtEnd),
                  })
                "
                @delete="(id) => deleteTimer(id)"
                @update="(timer) => updateTimer(timer)"
              />
            </template>
            <v-icon-btn
              v-else
              color="primary"
              :aria-label="
                t('timer.createTimer', {
                  entry: item.title,
                  start: formatTime(item.dtStart),
                  end: formatTime(item.dtEnd),
                })
              "
              icon="mdi-timer-plus-outline"
              @click="createTimer(item)"
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
          <template #append>
            <v-icon-btn
              v-if="(item.description ? item.description : '').length > 0"
              v-tooltip="
                (item.description ? item.description : '').replaceAll('|', '\n')
              "
              style="white-space: pre-wrap"
              icon="mdi-information"
              variant="flat"
            />
          </template>
        </v-list-item>
        <v-list-item
          v-if="item.crossDay"
          :title="
            date.format(
              item.dtEnd.toPlainDate().toString(),
              'fullDateWithWeekday',
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
  event_id: string;
  dtStart: Temporal.PlainDateTime;
  dtEnd: Temporal.PlainDateTime;
  start_ts: number;
  duration: Temporal.Duration;
  title: string;
  subtitle: string | null;
  description: string | null;
  channelId: string | null;
  crossDay: boolean;
  timer?: VDRTimerInterface;
  // isSeparator: boolean
}

function truncate(s: string, n: number) {
  return s.substring(0, n - 1) + (s.length > n ? "…" : "");
}

const selectedChannel: Ref<string | null> = ref(null);
const selectedChannelName = computed(() => {
  return vdr.vdrChannels.find(
    (channel: { channel_id: string | null }) =>
      channel.channel_id == selectedChannel.value,
  )?.name;
});
const isLoading: Ref<boolean> = ref(true);

const epgChannelList: Ref<epgListInterface[]> = ref([]);
const channelTimers: Ref<VDRTimerInterface[]> = ref([]);

// function getTimer(element: epgListInterface) {
//   return channelTimers.value.find((timer) => timer.start <= element.start_ts && timer.stop >= (element.start_ts + element.duration.total('seconds')))
// }

const getEventTimer = (eventId: string) => timerEvents.value.get(eventId);

const timerEvents = computed(() => {
  const timerEventMap = new Map<string, VDRTimerInterface>();

  for (const timer of channelTimers.value) {
    const matchingEvents = epgChannelList.value.filter(
      (event) =>
        timer.start <= event.start_ts &&
        timer.stop >= event.start_ts + event.duration.total("seconds"),
    );

    for (const event of matchingEvents) {
      timerEventMap.set(event.event_id, timer);
    }
  }
  return timerEventMap;
});

const selectable_channels = computed(() => {
  return vdr.vdrChannels.filter((channel) => !channel.is_group);
});

function formatTime(dtTime: Temporal.PlainDateTime): string {
  return `${dtTime.hour.toString().padStart(2, "0")}:${dtTime.minute
    .toString()
    .padStart(2, "0")}`;
}

function formatTimespan(
  dtStart: Temporal.PlainDateTime,
  dtEnd: Temporal.PlainDateTime,
) {
  return `${formatTime(dtStart)} - ${formatTime(dtEnd)}`;
}

async function refreshTimers() {
  if (!selectedChannel.value) return;

  const timers = await vdr.loadTimers();
  channelTimers.value = timers.filter(
    (t) => t.channel_id === selectedChannel.value,
  );
}

async function loadEpgData(channel_id: string | null) {
  isLoading.value = true;
  channelTimers.value = (await vdr.loadTimers()).filter(
    (t) => t.channel_id === channel_id,
  );

  if (channel_id) {
    const response = await vdr.loadEPG(channel_id);
    if (response?.data) {
      const data: epgEntryInterface[] = response.data;
      if (data) {
        const epgListData: epgListInterface[] = data.map((element) => {
          const event_id = element.event_id;
          const dtStart = Temporal.PlainDateTime.from(element.start);
          const duration = Temporal.Duration.from(element.duration);
          const dtEnd = dtStart.add(duration);
          const crossDay = dtStart.day !== dtEnd.day ? true : false;
          const timer = undefined;

          return {
            event_id: event_id,
            channelId: element.channel_id,
            dtStart: dtStart,
            dtEnd: dtEnd,
            start_ts: element.start_ts,
            duration: duration,
            crossDay: crossDay,
            title: element.title,
            subtitle: element.subtitle,
            description: element.description,
            timer: timer,
          };
        });
        epgChannelList.value = epgListData;
      }
    }
  }
  isLoading.value = false;
}
watch(selectedChannel, async (new_channel_id, old_channel_id) => {
  isLoading.value = true;
  if (new_channel_id !== old_channel_id || new_channel_id !== null) {
    await loadEpgData(new_channel_id);
  }
});

async function switchChannel() {
  const channel = selectedChannel.value;
  if (channel) {
    const response = await backend.postRequest(
      `/vdr/channel?channel=${encodeURIComponent(channel)}`,
      {},
    );
    if (response?.data) {
      const data = response.data;
      console.log(data);
      if (data.startsWith("250 ")) {
        const msg = data.slice(3);
        console.log(data);
        console.log("queued msg: ", msg);
        notifications.messages.push({
          text: data.slice(3),
          timeout: 4000,
          color: "primary",
          closable: true,
        });
      } else {
        notifications.messages.push({
          text: data,
          timeout: 1000,
          color: "secondary",
          closable: true,
        });
      }
    } else {
      console.error("no channel selected");
    }
  }
}

async function createTimer(epgEntry: epgListInterface) {
  await backend.postRequest("/vdr/timers", {
    channel_id: epgEntry.channelId,
    dt_start: epgEntry.dtStart,
    dt_end: epgEntry.dtEnd,
    title: epgEntry.title,
  });
  await refreshTimers();
}

async function updateTimer(timerEntry: string) {
  if (timerEntry) {
    console.log("edit timer for:", timerEntry);
    await vdr.updateTimer(timerEntry);
  }
  await refreshTimers();
}

async function deleteTimer(id: number) {
  await vdr.deleteTimer(id);
  await refreshTimers();
}

onMounted(async () => {
  // load the channels
  await vdr.loadChannels();
  const [_channel_num, channel_string] = await vdr.getCurrentChannel();
  const first = selectable_channels.value.find(
    (channel) => channel.channel_string === channel_string,
  );
  if (first) {
    selectedChannel.value = first.channel_id;
    await loadEpgData(selectedChannel.value);
  }
});
</script>

<style>
/* Die Klasse muss den Tooltip-Inhalt ansprechen */
.v-tooltip .v-overlay__content {
  white-space: pre-wrap !important;
}
</style>

<style lang="css" scoped>
.v-list-item-subtitle {
  /* overflow: hidden; text-overflow: ellipsis; white-space: nowrap !important; */
  width: 80vw;
}
</style>

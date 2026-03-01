<template>
  <!-- Card fills the container height -->
  <v-card ref="mainCard" class="ma-2 pa-2 fill-height d-flex flex-column">
    <v-card-title style="width: 100%; max-width: 1440px">
      <v-toolbar
        id="innerToolbar"
        class="bg-surface"
        name="innerToolbar"
        dark
        flat
      >
        <v-toolbar-title class="flex-grow-1">System Journal</v-toolbar-title>
        <v-btn
          v-tooltip:bottom="t('log.autoscroll')"
          aria-label="Scroll to show newest syslog entries"
          :color="scrollToLastElement ? 'primary' : ''"
          size="small"
          :icon="scrollToLastElement ? 'mdi-pause' : 'mdi-play'"
          variant="tonal"
          @click="scrollToLastElement = !scrollToLastElement"
        />
        <v-divider vertical thickness="5" opacity="0" />
        <v-btn
          v-tooltip:bottom="t('actions.downloadSyslog')"
          :aria-label="t('actions.downloadSyslog')"
          :loading="isDownloadingFile"
          download
          size="small"
          icon="mdi-download"
          variant="tonal"
          @click="downloadSyslog"
        />
        <v-divider thickness="2ch" opacity="0" vertical />
        <v-select
          v-model="filterLogLevel"
          class="mt-6 mr-4 flex-grow-0"
          label="Loglevel"
          :items="logLevelSelection"
          item-title="name"
          item-value="prio"
          variant="outlined"
          density="compact"
          min-width="120"
        />
        <v-divider thickness="2ch" opacity="0" vertical />
        <template v-if="$vuetify.display.xlAndUp">
          <div
            v-for="level in logLevelSelection.filter(
              (element) => element.prio <= filterLogLevel,
            )"
            :key="level.prio"
            class="flex-grow-1"
          >
            <span
              :class="`${getBackgroundColorByPrio(level.prio)} pa-2 text-body-2`"
              >{{ level.name }}</span
            >
            <v-divider thickness="1ch" opacity="0" vertical />
          </div>
        </template>
      </v-toolbar>
    </v-card-title>
    <v-card-text class="flex-grow-1 overflow-hidden" style="min-height: 0">
      <v-infinite-scroll
        id="goto-container"
        ref="infiniteScroller"
        :items="logEntries"
        max-height="100%"
        side="both"
        @load="load"
      >
        <template #loading>
          <v-progress-linear color="primary" indeterminate rounded />
        </template>

        <template v-for="item in filteredLogEntries" :key="item.CURSOR">
          <div :id="item.CURSOR" class="text-body-2`">
            <!-- <span :class="getBackgroundColorByPrio(item.PRIORITY)"> -->
            {{ item.FORMATTED_TIMESTAMP }}
            <!-- </span> -->

            <v-divider thickness="1ch" vertical opacity="0" />
            <template v-if="$vuetify.display.lgAndUp">
              <span :class="getBackgroundColorByPrio(item.PRIORITY)">
                {{ item.HOSTNAME }}:
              </span>
              <v-divider thickness="1ch" vertical opacity="0" />
            </template>
            <span lang="en">{{ item.MESSAGE }}</span>
          </div>
        </template>
      </v-infinite-scroll>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { useBackendStore } from "@/stores/backend";
import { useDate } from "vuetify";
import { useI18n } from "vue-i18n";
import type { VInfiniteScroll } from "vuetify/components";

const { t } = useI18n();
const date = useDate();

const store = useBackendStore();
const logEntries: Ref<Array<logEntryInterface>> = ref([]);
const scrollToLastElement: Ref<boolean> = ref(true);

function formatDate(element: logEntryInterface) {
  return `${date.format(element.REALTIME_TIMESTAMP, "shortDate")} ${date.format(
    element.REALTIME_TIMESTAMP,
    "fullTime24h",
  )}`;
}

onMounted(async () => {
  const response = await store.getRequest(
    "/logs/?start=now&n_entries=200&direction=forward",
  );
  if (response?.data) {
    const data: Array<logEntryInterface> = response.data;
    logEntries.value = data.map((element) => {
      element.FORMATTED_TIMESTAMP = formatDate(element);
      return element;
    });
  }
});

type InfiniteScrollStatus = "ok" | "empty" | "loading" | "error";
interface doInterface {
  (status: InfiniteScrollStatus): void;
}

interface logEntryInterface {
  BOOT_ID: string;
  CURSOR: string;
  HOSTNAME: string;
  MACHINE_ID: string;
  PRIORITY: number;
  REALTIME_TIMESTAMP: string;
  FORMATTED_TIMESTAMP: string | null;
  MESSAGE: string;
}

const logLevelSelection = [
  { name: "EMERGENCY", prio: 0, color: "red" },
  { name: "ALERT", prio: 1, color: "orange" },
  { name: "CRITICAL", prio: 2, color: "amber" },
  { name: "ERROR", prio: 3, color: "yellow" },
  { name: "WARNING", prio: 4, color: "deep-purple-lighten-2" },
  { name: "NOTICE", prio: 5, color: "light-blue" },
  { name: "INFO", prio: 6, color: "cyan" },
  { name: "DEBUG", prio: 7, color: "blue-grey-lighten-5" },
];

function getBackgroundColorByPrio(prio: number) {
  const prio_data = logLevelSelection[prio];
  const color = prio_data ? prio_data.color : "blue-grey-lighten-5";
  return `text-${color}`;
}

const isDownloadingFile: Ref<boolean> = ref(false);

async function downloadSyslog() {
  isDownloadingFile.value = true;
  await store.downloadFile("/logs/download?start=boot");
  isDownloadingFile.value = false;
}

const filterLogLevel: Ref<number> = ref(7);
const filteredLogEntries = computed(() => {
  return logEntries.value.filter(
    (entry) => entry.PRIORITY <= filterLogLevel.value,
  );
});

const infiniteScroller = ref<InstanceType<typeof VInfiniteScroll> | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (infiniteScroller.value) {
    // console.log("use root element scroll")
    const scroller = document.getElementById("goto-container");
    if (scroller) {
      // console.log("scrolling to position", scroller.scrollHeight)
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: "auto" });
    }
  }
};

async function load(
  this: VInfiniteScroll,
  { side, done }: { side: string; done: doInterface },
) {
  // console.log("called load with:", side);
  if (side === "start") {
    // console.log("scrollback");
    const firstElement = logEntries.value[0];
    if (firstElement) {
      const ts = firstElement.REALTIME_TIMESTAMP;
      const response = await store.getRequest(
        `/logs/?start=${ts}&n_entries=200&direction=backward&uuid=${firstElement.CURSOR}`,
      );
      if (response?.data) {
        const data: logEntryInterface[] = response.data;
        if (data.length == 0) {
          done("empty"); // stop loading in this direction if we reach the oldest entry
          return;
        }
        const entries = data.map((element) => {
          element.FORMATTED_TIMESTAMP = formatDate(element);
          return element;
        });
        entries.push(...logEntries.value);
        logEntries.value = entries;
      }
    }
  } else {
    // console.log("load new log entries");
    const lastElement = logEntries.value[logEntries.value.length - 1];
    if (lastElement) {
      const ts = lastElement.REALTIME_TIMESTAMP;
      const response = await store.getRequest(
        `/logs/?start=${ts}&n_entries=200&direction=forward&uuid=${lastElement.CURSOR}`,
      );
      if (response?.data) {
        const data: logEntryInterface[] = response.data;
        if (data !== null) {
          if (data.length === 0) {
            await new Promise((r) => setTimeout(r, 1000));
          } else {
            const entries = data.map((element) => {
              element.FORMATTED_TIMESTAMP = formatDate(element);
              return element;
            });
            const filtered_entries = entries.filter(
              (element) => element.CURSOR != lastElement.CURSOR,
            );
            logEntries.value.push(...filtered_entries);
            if (scrollToLastElement.value && infiniteScroller.value) {
              // console.log("calling scrollToBottom")
              await scrollToBottom();
            }
          }
        }
      }
    }
  }

  done("ok");
}
</script>

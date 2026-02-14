<template>
  <v-dialog
    max-width="600"
  >
    <template #activator="{ props: activatorProps }">
      <v-icon-btn
        icon="mdi-timer-edit-outline"
        v-bind="activatorProps"
        text="Open Dialog"
        variant="flat"
        size="small"
        color="red"
      />
    </template>
    <template #default="{ isActive }">
      <v-card>
        <v-toolbar>
          <v-toolbar-title>
            {{ t('actions.edit', { what: t('category.timer')}) }}
          </v-toolbar-title>
          <v-icon-btn
            v-tooltip="t('actions.delete_sth', {what: t('category.timer')})"
            color="red"
            icon="mdi-delete-clock"
            variant="flat"
            @click="deleteTimer(isActive)"
          />
          <v-divider
            vertical
            thickness="20"
            opacity="0"
          />
          <v-icon-btn
            v-tooltip="t('actions.close')"
            icon="mdi-close"
            class="ma-2"
            @click="isActive.value = false"
          />
        </v-toolbar>
        <!-- <v-divider class="mt-3" /> -->
        <v-card-text>
          <v-container class="d-flex flex-row flex-wrap justify-space-between">
            <v-switch
              :model-value="timerActive"
              label="Active"
              inset
              color="green"
              :hide-details="true"
              density="compact"
            />
            <v-switch
              label="Use VPS"
              inset
              color="primary"
              :hide-details="true"
              density="compact"
            />
          </v-container>

          <v-divider
            vertical
            thickness="20%"
            opacity="0"
          />
          <v-text-field
            v-model="timerTitle"
            :label="t('timer.title')"
            prepend-icon="mdi-text-box-edit"
            density="compact"
          />
          <v-date-input
            :model-value="timerDate"
            prepend-icon="mdi-calendar"
            label="Start Date"
            :allowed-dates="allowedDates"
            :clearable="true"
            density="compact"
            @click:clear="timerDate = null"
          />

          <v-text-field
            :model-value="timerStart"
            label="Start Time"
            prepend-icon="mdi-timer-play"
            readonly
            density="compact"
          >
            <v-menu
              v-model="showStartMenu"
              :close-on-content-click="false"
              activator="parent"
              min-width="0"
            >
              <v-time-picker
                v-model="timerStart"
                format="24hr"
                title="pick start time"
              />
            </v-menu>
          </v-text-field>
          <v-text-field
            :model-value="timerEnd"
            label="End Time"
            prepend-icon="mdi-timer-stop"
            density="compact"
            readonly
          >
            <v-menu
              v-model="showStopMenu"
              :close-on-content-click="false"
              activator="parent"
              min-width="0"
            >
              <v-time-picker
                v-model="timerEnd"
                format="24hr"
                density="compact"
                title="pick stop time"
              />
            </v-menu>
          </v-text-field>

          <v-expansion-panels
            class="mb-5"
          >
            <v-expansion-panel
              title="Repeat on Weekdays"
            >
              <v-expansion-panel-text>
                <v-container class="d-flex flex-row flex-wrap justify-center">
                  <v-checkbox
                    v-for="(w, idx) in weekdays"
                    :key="idx"
                    v-model="weekdaySettings"
                    :label="w"
                    :value="idx"
                    class="ga-0"
                  />
                </v-container>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-number-input
            :min="0"
            :max="99"
            :model-value="priority"
            label="Priority"
            prepend-icon="mdi-star"
            control-variant="split"
            :max-width="200"
            density="compact"
          />
          <v-number-input
            :min="0"
            :max="99"
            :model-value="lifetime"
            label="Lifetime"
            prepend-icon="mdi-clock-end"
            control-variant="split"
            :max-width="200"
            density="compact"
          />
          <!-- {{ props.timer }}

          <br>

          {{ timerString }}
          <br>

          {{ weekdaySettings }}
          {{  timerDayResult }} -->
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn
            text="Save"
            color="primary"
            prepend-icon="mdi-send"
            variant="flat"
            tile
          />
          <!-- TODO: implement updating the timer -->
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>


<script setup lang="ts">
import { useDate } from 'vuetify'
import { useI18n } from "vue-i18n";
import { VDateInput } from 'vuetify/labs/VDateInput'
import type { VDRTimerInterface } from "@/stores/interfaces/VdrTimerInterface";
const {t} = useI18n()
const date = useDate()

const weekdays = []
let tmpDate: Date = new Date(0)
tmpDate = <Date>date.addDays(tmpDate, 4)
weekdays.push(date.format(tmpDate, 'weekdayShort'))

for (let w = 0; w < 6; w++) {
    tmpDate = <Date>date.addDays(tmpDate, 1)
    weekdays.push(date.format(tmpDate, 'weekdayShort'))
}

const props = defineProps<{
    timer: VDRTimerInterface|undefined
}>()

const emit = defineEmits<{
  (e: 'delete', id: number): void
  (e: 'update', value: string): void
}>()

const timerActive = ref(false)
const timerVPS = ref(false)
const timerTitle = ref("")
const timerDate: Ref<Date|null|undefined> = ref()
const timerStart = ref("00:00")
const timerEnd = ref("00:00")
const priority = ref(50)
const lifetime = ref(99)
if (props.timer) {
    const startDate = new Date(props.timer.start * 1000)
    const startHour = startDate.getHours()
    const startMinutes = startDate.getMinutes()
    timerStart.value = String(startHour).padStart(2, "0") + ":" + String(startMinutes).padStart(2, "0")
    const stopDate = new Date(props.timer.stop * 1000)
    const endHour = stopDate.getHours()
    const endMinutes = stopDate.getMinutes()
    timerEnd.value = String(endHour).padStart(2, "0") + ":" + String(endMinutes).padStart(2, "0")
    startDate.setHours(0)
    startDate.setMinutes(0)
    startDate.setSeconds(0)
    timerActive.value = (props.timer.status_flags & 1) !== 0
    timerVPS.value = (props.timer.status_flags & 4) !== 0
    timerTitle.value = props.timer.filename
    timerDate.value = startDate
    priority.value = props.timer.priority
    lifetime.value = props.timer.lifetime
}

const showStartMenu: Ref<boolean> = ref(false)
const showStopMenu: Ref<boolean> = ref(false)
const weekdaySettings: Ref<number[]> = ref([])
const time: Ref<string> = ref('20:15')

const allowedDates = (val: unknown) => {
    const now = new Date
    const c_year = now.getFullYear()
    const c_month = now.getMonth()
    const c_day = now.getDate()
    const c_date = new Date(c_year, c_month, c_day)

    return c_date <= val
}

const timerDayResult = computed(() => {
  let timerDay = ""
  if (weekdaySettings.value.length > 0) {

    const base = "-------".split('')
    const weekdays = "MTWTFSS"
    const weekdaySet = new Set(weekdaySettings.value)
    timerDay +=`${base.map((char, idx) => {
      return weekdaySet.has(idx) ? weekdays[idx]: char;
    }).join("")}${timerDate.value ? "@" : ""}`
  }
  if (timerDate.value) {
    timerDay += `${timerDate.value.getFullYear()}-${String(timerDate.value.getMonth()).padStart(2, "0")}-${String(timerDate.value.getDay()).padStart(2, "0")}`
  }
  return timerDay

})

const timerString = computed(() => {
  if (props.timer) {
    const flags = Number(timerActive.value) + 4 * Number(timerVPS.value)
    const channel_id = props.timer.channel_id
    const start = timerStart.value.replace(':', '')
    const stop = timerEnd.value.replace(':', '')
    const aux = props.timer.aux


    return `${flags}:${channel_id}:${timerDayResult}:${start}:${stop}:${priority.value}:${lifetime.value}:${aux}`
  }
})

const deleteTimer = async (isActive: Ref<boolean>) => {
  if (props.timer && window.confirm(`Are you sure you want to delete the timer ${props.timer.id} "${props.timer.filename}"?`)) {
    emit('delete', props.timer.id)
    isActive.value = false
  }
}

</script>

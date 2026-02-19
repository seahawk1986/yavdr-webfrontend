<template>
  <v-dialog
    max-width="600"
  >
    <template #activator="{ props: activatorProps }">
      <v-icon-btn
        :v-tooltip="props.tooltip"
        icon="mdi-timer-edit-outline"
        v-bind="activatorProps"
        text="Open Dialog"
        variant="flat"
        :color="props.color ? props.color : 'red'"
      />
    </template>
    <template #default="{ isActive }">
      <v-card>
        <v-toolbar>
          <v-toolbar-title>
            {{ t('actions.edit', { what: t('category.timer')}) }}
          </v-toolbar-title>
          <v-icon-btn
            :v-tooltip="t('actions.delete_sth', {what: t('category.timer')})"
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
              v-model="timerActive"
              :label="t('timer.switch_active')"
              inset
              color="green"
              :hide-details="true"
              density="compact"
            />
            <v-switch
              v-model="timerVPS"
              :label="t('timer.use_VPS')"
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
            v-model="timerDate"
            prepend-icon="mdi-calendar"
            :label="t('timer.day')"
            :allowed-dates="allowedDates"
            :clearable="true"
            density="compact"
            @click:clear="timerDate = null"
            @update:model-value="(val: Date|null) => {timerDate = val}"
          />
          <!-- TODO: Why is @update:model-value needed?  -->

          <v-text-field
            :model-value="timerStart"
            :label="t('timer.start_time')"
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
            :label="t('timer.end_time')"
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
              :title="t('timer.repeat_on_weekdays')"
            >
              <v-expansion-panel-text>
                <v-container class="d-flex flex-row flex-wrap justify-center">
                  <v-checkbox
                    v-for="(w, idx) in weekday_selection"
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
            :label="t('info.priority')"
            prepend-icon="mdi-star"
            control-variant="split"
            :max-width="200"
            density="compact"
            @update:model-value="(val) => priority = val"
          />
          <!-- TODO: Why is @update:model-value needed? -->
          <v-number-input
            :min="0"
            :max="99"
            :model-value="lifetime"
            :label="t('info.lifetime')"
            prepend-icon="mdi-clock-end"
            control-variant="split"
            :max-width="200"
            density="compact"
            @update:model-value="(val) => lifetime = val"
          />
          <!-- TODO: Why is @update:model-value needed? -->

          {{ timerString }}
          <!-- <br> -->
          <!-- timerDate: {{ timerDate }}
          <br>
          timerVPS: {{ timerVPS }} -->
          <!-- {{ props.timer }}

          <br>

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
            @click="updateTimer(isActive)"
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

const weekday_selection = computed(() => {

  const weekdays = []
  let tmpDate: Date = new Date(0)
  tmpDate = <Date>date.addDays(tmpDate, 4)
  weekdays.push(date.format(tmpDate, 'weekdayShort'))

  for (let w = 0; w < 6; w++) {
      tmpDate = <Date>date.addDays(tmpDate, 1)
      weekdays.push(date.format(tmpDate, 'weekdayShort'))
  }
  return weekdays
})

const props = defineProps<{
    color?: string|undefined
    timer: VDRTimerInterface|undefined
    tooltip?: string|undefined
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
    const startDate = ref(new Date(props.timer.start * 1000))
    const startHour = startDate.value.getHours()
    const startMinutes = startDate.value.getMinutes()
    timerStart.value = String(startHour).padStart(2, "0") + ":" + String(startMinutes).padStart(2, "0")
    const stopDate = new Date(props.timer.stop * 1000)
    const endHour = stopDate.getHours()
    const endMinutes = stopDate.getMinutes()
    timerEnd.value = String(endHour).padStart(2, "0") + ":" + String(endMinutes).padStart(2, "0")
    startDate.value.setHours(0)
    startDate.value.setMinutes(0)
    startDate.value.setSeconds(0)
    timerActive.value = (props.timer.status_flags & 1) !== 0
    timerVPS.value = (props.timer.status_flags & 4) !== 0
    timerTitle.value = props.timer.filename
    timerDate.value = startDate.value
    priority.value = props.timer.priority
    lifetime.value = props.timer.lifetime
}


const showStartMenu: Ref<boolean> = ref(false)
const showStopMenu: Ref<boolean> = ref(false)
const weekdaySettings: Ref<number[]> = ref([])

const allowedDates = (val: Date|unknown) => {
    const now = new Date
    const c_year = now.getFullYear()
    const c_month = now.getMonth()
    const c_day = now.getDate()
    const c_date = new Date(c_year, c_month, c_day)
    if (val instanceof Date) {
      return c_date <= val
    }
    return false
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
    timerDay += format_day(timerDate.value)
  }
  return timerDay

})

const format_day = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

const timerString = computed(() => {
  if (props.timer) {
    const flags = Number(timerActive.value) + 4 * Number(timerVPS.value)
    const channel_id = props.timer.channel_id
    const start = timerStart.value.replace(':', '')
    const stop = timerEnd.value.replace(':', '')
    const prio = priority.value
    const life = lifetime.value
    const aux = props.timer.aux


    return (`${flags}:${channel_id}:${timerDayResult.value}:${start}:${stop}:${prio}:${life}:${timerTitle.value}:${aux}`).trim()
  }
  return null
})

const updateTimer = async (isActive: Ref<boolean>) => {
  if (props.timer && timerString.value) {
    console.log("Update timer", timerString.value)
    emit('update', timerString.value)
    isActive.value = false
  }
}

const deleteTimer = async (isActive: Ref<boolean>) => {
  if (props.timer && window.confirm(`Are you sure you want to delete the timer ${props.timer.id} "${props.timer.filename}"?`)) {
    emit('delete', props.timer.id)
    isActive.value = false
  }
}

</script>

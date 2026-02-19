<script setup lang="ts">
import RemoteIconButton from '@/components/remote/RemoteIconButton.vue'
import RemoteTextButton from '@/components/remote/RemoteTextButton.vue'

// import { useDisplay } from 'vuetify'

import { useBackendStore } from '@/stores/backend';
import { useUIStore } from '@/stores/ui';
import { useI18n } from 'vue-i18n';
const {t} = useI18n()
const backend = useBackendStore()
const ui = useUIStore()

const enableKeyboardInput: Ref<boolean>=ref(false)

const keymap: Record<string, string> = {
  // numbers
  Digit0: "KEY_0",
  Digit1: "KEY_1",
  Digit2: "KEY_2",
  Digit3: "KEY_3",
  Digit4: "KEY_4",
  Digit5: "KEY_5",
  Digit6: "KEY_6",
  Digit7: "KEY_7",
  Digit8: "KEY_8",
  Digit9: "KEY_9",

  Numpad0: "KEY_0",
  Numpad1: "KEY_1",
  Numpad2: "KEY_2",
  Numpad3: "KEY_3",
  Numpad4: "KEY_4",
  Numpad5: "KEY_5",
  Numpad6: "KEY_6",
  Numpad7: "KEY_7",
  Numpad8: "KEY_8",
  Numpad9: "KEY_9",

  // navigation
  ArrowUp: "KEY_UP",
  ArrowDown: "KEY_DOWN",
  ArrowLeft: "KEY_LEFT",
  ArrowRight: "KEY_RIGHT",
  Enter: "KEY_OK",
  NumpadEnter: "KEY_OK",
  // Escape: "KEY_ESC", // this key is used to close the remote overlay
  Backspace: "KEY_ESC",
  NumpadDecimal: "KEY_ESC",

  // channel / volume
  PageUp: "KEY_CHANNELUP",
  PageDown: "KEY_CHANNELDOWN",
  ArrowUpShift: "KEY_VOLUMEUP",     // see note below
  ArrowDownShift: "KEY_VOLUMEDOWN",

  // color buttons
  F1: "KEY_RED",      // see alt mapping note
  F2: "KEY_GREEN",
  F3: "KEY_YELLOW",
  F4: "KEY_BLUE",

  // user keys
  F5: "KEY_PROG1",
  F6: "KEY_PROG2",
  F7: "KEY_PROG3",
  F8: "KEY_PROG4",
  // PrintScreen can't be mapped
  ScrollLock: "KEY_VIDEO",
  Insert: "KEY_IMAGES",
  NumpadDivide: "KEY_FN",
  NumpadMultiply: "KEY_SCREEN",


  // replay control
  F9: "KEY_PLAYPAUSE",

  // volume control
  F10: "KEY_MUTE",
  F11: "KEY_VOLUMEDOWN",
  F12: "KEY_VOLUMEUP",

  NumpadAdd: "KEY_VOLUMEUP",
  NumpadSubtract: "KEY_VOLUMEDOWN",


  // misc
  Home: "KEY_MENU",
  End: "KEY_INFO",
  KeyE: "KEY_EPG",
  KeyT: "KEY_TEXT",
  KeyK: "KEY_HOME",
  KeySAlt: "KEY_SUBTITLE",
  ContextMenu: "KEY_MODE",

  Pause: "KEY_POWER2",
}

function resolveKey(event: KeyboardEvent) {
  if (event.shiftKey) {
    if (event.code === "ArrowUp") return "KEY_VOLUMEUP"
    if (event.code === "ArrowDown") return "KEY_VOLUMEDOWN"
  }
  return keymap[event.code]
}


onMounted(() => {
  const handler = (event: KeyboardEvent) => {
    if (!ui.showRemote || !enableKeyboardInput.value) return

    // console.log("got event",{
    //   key: event.key,
    //   code: event.code,
    //   shift: event.shiftKey,
    //   ctrl: event.ctrlKey,
    //   alt: event.altKey,
    // })

    const key = resolveKey(event)
    if (!key) return

    event.preventDefault()
    backend.onKeypress(key)
    console.log("pressed key", key)
  }

  document.addEventListener("keydown", handler)

  onUnmounted(() => {
    document.removeEventListener("keydown", handler)
  })
})

</script>

<template>
  <!-- Main container for centering -->
  <v-card
    class="pa-0 ga-0 ma-0"
    variant="outlined"
    rounded="xl"
    style="max-width: 400px; width: 100%;"
  >
    <template #prepend>
      <RemoteIconButton
        name="Power"
        tooltip="Power Button"
        :aria-label="t('actions.shutdown')"
        icon-name="mdi-power"
        keyname="KEY_POWER2"
        variant="elevated"
        color="red"
      />
    </template>
    <template #title>
      <v-switch
        v-model="enableKeyboardInput"
        v-tooltip="'Forward keyboard as remote button presses'"
        :hide-details="true"
        inset
        label="Keyboard input"
        color="primary"
      />
    </template>
    <template #append>
      <v-icon-btn
        v-tooltip="t('actions.close')"
        icon="mdi-close"
        variant="tonal"
        color="red"
        @click="ui.showRemote = false"
      />
    </template>
    <v-card-text
      class="ma-0 pt-0"
      style="max-height: 100%; overflow-y: auto;"
    >
      <v-container class="ma-0 pt-0 fill-height d-flex align-center justify-center overflow-y-auto">
        <!-- The Remote Body -->
        <!-- <v-sheet
        elevation="8"
        rounded="xl"
        class="pa-4 ga-0 ma-0 bg-blue-grey-darken-4"
        style="max-width: 400px; width: 100%; max-height: 95dvh;"
      > -->
        <v-row
          no-gutters
          justify="center"
        >
          <v-col
            v-for="n in 9"
            :key="n"
            cols="4"
            class="pa-1 d-flex justify-center"
          >
            <RemoteTextButton
              :name="`${n}`"
              :tooltip="`Key ${n}`"
              :keyname="`KEY_${n}`"
            />
          </v-col>

          <v-col
            cols="4"
            class="pa-1 d-flex justify-center"
          >
            <RemoteTextButton
              name="TXT"
              tooltip="Teletext"
              keyname="KEY_TEXT"
            />
          </v-col>

          <!-- Zero -->
          <v-col
            cols="4"
            class="pa-1 d-flex justify-center"
          >
            <RemoteTextButton
              name="0"
              tooltip="Key 0"
              keyname="KEY_0"
            />
          </v-col>
          <v-col
            cols="4"
            class="pa-1 d-flex justify-center"
          >
            <RemoteTextButton
              name="#"
              tooltip="Open Commands"
              keyname="KEY_FAVORITES"
            />
          </v-col>
        </v-row>
        <v-row
          class="pt-2"
          no-gutters
          justify="center"
        >
          <!-- Directional Pad (Using 12-col grid to simulate 3x3) -->
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Volume Up"
              icon-name="mdi-volume-plus"
              tooltip="Increase volume"
              keyname="KEY_VOLUMEUP"
              color="secondary-darken-1"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="EPG"
              icon-name="mdi-newspaper-variant-multiple-outline"
              tooltip="Show EPG"
              keyname="KEY_EPG"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Up"
              icon-name="mdi-arrow-up-thick"
              tooltip="move up"
              keyname="KEY_UP"
              color="primary-darken-1"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Info"
              icon-name="mdi-information-variant"
              tooltip="Info"
              keyname="KEY_INFO"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Channel up"
              icon-name="mdi-arrow-up-bold"
              tooltip="Channel +"
              keyname="KEY_CHANNELUP"
              color="secondary-darken-1"
            />
          </v-col>
          <!-- next row" -->
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Mute"
              icon-name="mdi-volume-off"
              tooltip="Toggle Mute"
              keyname="KEY_MUTE"
              color="red"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Left"
              icon-name="mdi-arrow-left-thick"
              tooltip="Move left"
              keyname="KEY_LEFT"
              color="primary-darken-1"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="OK"
              icon-name="mdi-circle-outline"
              tooltip="OK"
              keyname="KEY_OK"
              color="primary-darken-1"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Right"
              icon-name="mdi-arrow-right-thick"
              tooltip="Move right"
              keyname="KEY_RIGHT"
              color="primary-darken-1"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Channel Menu"
              icon-name="mdi-playlist-edit"
              tooltip="Channel Menu"
              keyname="KEY_CHANNEL"
            />
          </v-col>
          <!-- next row -->
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Volume Down"
              icon-name="mdi-volume-minus"
              tooltip="Decrease volume"
              keyname="KEY_VOLUMEDOWN"
              color="secondary-darken-1"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Back"
              icon-name="mdi-arrow-u-left-top"
              tooltip="Go back"
              keyname="KEY_ESC"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Down"
              icon-name="mdi-arrow-down-thick"
              tooltip="Move down"
              keyname="KEY_DOWN"
              color="primary-darken-1"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="VDR Menu"
              icon-name="mdi-menu"
              tooltip="VDR Main Menu"
              keyname="KEY_Menu"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Channel down"
              icon-name="mdi-arrow-down-bold"
              tooltip="Channel -"
              keyname="KEY_CHANNELDOWN"
              color="secondary-darken-1"
            />
          </v-col>
        </v-row>
        <v-row
          class="pt-2"
          no-gutters
          justify="center"
        >
          <v-col
            cols="3"
            class="pa-1 d-flex justify-center"
          >
            <RemoteTextButton
              name="R"
              tooltip="Red Button"
              keyname="KEY_RED"
              color="red"
              variant="elevated"
            />
          </v-col>
          <v-col
            cols="3"
            class="pa-1 d-flex justify-center"
          >
            <RemoteTextButton
              name="G"
              tooltip="Green Button"
              keyname="KEY_GREEN"
              color="green"
              variant="elevated"
            />
          </v-col>
          <v-col
            cols="3"
            class="pa-1 d-flex justify-center"
          >
            <RemoteTextButton
              name="Y"
              tooltip="Yellow Button"
              keyname="KEY_YELLOW"
              color="yellow"
              variant="elevated"
            />
          </v-col>
          <v-col
            cols="3"
            class="pa-1 d-flex justify-center"
          >
            <RemoteTextButton
              name="B"
              tooltip="Blue Button"
              keyname="KEY_BLUE"
              color="blue"
              variant="elevated"
            />
          </v-col>
        </v-row>
        <v-row
          class="pt-2"
          no-gutters
          justify="center"
        >
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Skip backward"
              icon-name="mdi-skip-backward"
              tooltip="Skip backward"
              keyname="KEY_BACK"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Rewind"
              icon-name="mdi-rewind"
              tooltip="Rewind"
              keyname="KEY_REWIND"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Play"
              icon-name="mdi-play"
              tooltip="Play"
              keyname="KEY_PLAY"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Fast Forward"
              icon-name="mdi-fast-forward"
              tooltip="Fast Forward"
              keyname="KEY_FASTFORWARD"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Skip forward"
              icon-name="mdi-skip-forward"
              tooltip="Skip forward"
              keyname="KEY_NEXT"
            />
          </v-col>
        </v-row>
        <v-row
          no-gutters
          justify="center"
        >
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Record"
              icon-name="mdi-record"
              tooltip="Start Recording"
              keyname="KEY_RECORD"
              color="red"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Stop"
              icon-name="mdi-stop"
              tooltip="Stop Replay"
              keyname="KEY_STOP"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Pause"
              icon-name="mdi-pause"
              tooltip="Pause"
              keyname="KEY_PAUSE"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Subtitles"
              icon-name="mdi-subtitles"
              tooltip="Show Subtitles"
              keyname="KEY_SUBTITLE"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Audio"
              icon-name="mdi-speaker-multiple"
              tooltip="Choose Audio Stream"
              keyname="KEY_MODE"
            />
          </v-col>
        </v-row>
        <v-row
          no-gutters
          justify="center"
        >
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="KODI"
              icon-name="mdi-kodi"
              tooltip="Toggle KODI"
              keyname="KEY_HOME"
              icon_color="blue"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Webbrowser"
              icon-name="mdi-web"
              tooltip="Start Webbrowser"
              keyname="KEY_FN"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Open Settings"
              icon-name="mdi-cog"
              tooltip="Open settings menu"
              keyname="KEY_SETUP"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Recordings"
              icon-name="mdi-movie-open"
              tooltip="Show Recordings Menu"
              keyname="KEY_PVR"
            />
          </v-col>
          <v-col
            style="width: 20%;"
            class="pa-1 d-flex justify-center"
          >
            <RemoteIconButton
              name="Timers"
              icon-name="mdi-timetable"
              tooltip="Show Timer Menu"
              keyname="KEY_TIME"
            />
          </v-col>
        </v-row>
        <!-- </v-sheet> -->
      </v-container>
    </v-card-text>
  </v-card>
</template>

<style lang="css">
  div.v-card-item {
    padding-bottom:0 !important;
  }
</style>

<script setup lang="ts">
import RemoteIconButton from '@/components/remote/RemoteIconButton.vue'
import RemoteTextButton from '@/components/remote/RemoteTextButton.vue'

import { useBackendStore } from '@/stores/backend';
import { useUIStore } from '@/stores/ui';
const backend = useBackendStore()
const ui = useUIStore()

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
  // Escape: "KEY_ESC", // not standard
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
  if (event.code === "Escape") {
    ui.showRemote = !ui.showRemote
    return
  }
  if (event.shiftKey) {
    if (event.code === "ArrowUp") return "KEY_VOLUMEUP"
    if (event.code === "ArrowDown") return "KEY_VOLUMEDOWN"
  }
  return keymap[event.code]
}


onMounted(() => {
  const handler = (event: KeyboardEvent) => {
    if (!ui.showRemote) return

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
  <!-- TODO: handle keyboard shortcuts for this view -->
  <v-container
    align="center"
  >
    <!-- Numpad and user buttons -->
    <div>
      <v-row>
        <v-col>
          <RemoteTextButton
            name="USER 1"
            tooltip="User 1"
            keyname="KEY_PROG1"
            class="d-none d-sm-inline"
          />
          <RemoteTextButton
            name="1"
            tooltip="Key 1"
            keyname="KEY_1"
          />
          <RemoteTextButton
            name="2"
            tooltip="Key 2"
            keyname="KEY_2"
          />
          <RemoteTextButton
            name="3"
            tooltip="Key 3"
            keyname="KEY_3"
          />
        </v-col>
      </v-row>
      <v-spacer />
      <v-row>
        <v-col>
          <RemoteTextButton
            name="USER 2"
            tooltip="User 2"
            keyname="KEY_PROG2"
            class="d-none d-sm-inline"
          />
          <RemoteTextButton
            name="4"
            tooltip="Key 4"
            keyname="KEY_4"
          />
          <RemoteTextButton
            name="5"
            tooltip="Key 5"
            keyname="KEY_5"
          />
          <RemoteTextButton
            name="6"
            tooltip="Key 6"
            keyname="KEY_6"
          />
        </v-col>
      </v-row>
      <v-spacer />
      <v-row>
        <v-col>
          <RemoteTextButton
            name="USER 3"
            tooltip="User 3"
            keyname="KEY_PROG3"
            class="d-none d-sm-inline"
          />
          <RemoteTextButton
            name="7"
            tooltip="Key 7"
            keyname="KEY_7"
          />
          <RemoteTextButton
            name="8"
            tooltip="Key 8"
            keyname="KEY_8"
          />
          <RemoteTextButton
            name="9"
            tooltip="Key 9"
            keyname="KEY_9"
          />
        </v-col>
      </v-row>
      <v-spacer />
      <v-row>
        <v-col>
          <RemoteTextButton
            name="USER 4"
            tooltip="User 4"
            keyname="KEY_PROG4"
            class="d-none d-sm-inline"
          />
          <RemoteTextButton
            name="TXT"
            tooltip="Teletext"
            keyname="KEY_TEXT"
          />
          <RemoteTextButton
            name="0"
            tooltip="Key 0"
            keyname="KEY_0"
          />
          <RemoteTextButton
            name="#"
            tooltip="Open Commands"
            keyname="KEY_FAVORITES"
          />
        </v-col>
      </v-row>
    </div>
    <!-- Volume, Channel, Movement, Menus, info -->
    <div>
      <v-row>
        <v-col>
          <RemoteIconButton
            name="Volume Up"
            icon-name="mdi-volume-plus"
            tooltip="Increase volume"
            keyname="KEY_VOLUMEUP"
          />
          <RemoteIconButton
            name="EPG"
            icon-name="mdi-newspaper-variant-multiple-outline"
            tooltip="Show EPG"
            keyname="KEY_EPG"
          />
          <RemoteIconButton
            name="Up"
            icon-name="mdi-arrow-up-thick"
            tooltip="move up"
            keyname="KEY_UP"
          />
          <RemoteIconButton
            name="Info"
            icon-name="mdi-information"
            tooltip="Info"
            keyname="KEY_INFO"
          />
          <RemoteIconButton
            name="Channel up"
            icon-name="mdi-arrow-up-bold"
            tooltip="Channel +"
            keyname="KEY_CHANNELUP"
          />
        </v-col>
      </v-row>
      <v-spacer />
      <v-row>
        <v-col>
          <RemoteIconButton
            name="Mute"
            icon-name="mdi-volume-off"
            tooltip="Toggle Mute"
            keyname="KEY_MUTE"
          />
          <RemoteIconButton
            name="Left"
            icon-name="mdi-arrow-left-thick"
            tooltip="Move left"
            keyname="KEY_LEFT"
          />
          <RemoteIconButton
            name="OK"
            icon-name="mdi-circle-outline"
            tooltip="OK"
            keyname="KEY_OK"
          />
          <RemoteIconButton
            name="Right"
            icon-name="mdi-arrow-right-thick"
            tooltip="Move right"
            keyname="KEY_RIGHT"
          />
          <RemoteIconButton
            name="Channel Menu"
            icon-name="mdi-playlist-edit"
            tooltip="Channel Menu"
            keyname="KEY_CHANNEL"
          />
        </v-col>
      </v-row>
      <v-spacer />

      <v-row>
        <v-col>
          <RemoteIconButton
            name="Volume Down"
            icon-name="mdi-volume-minus"
            tooltip="Decrease volume"
            keyname="KEY_VOLUMEDOWN"
          />
          <RemoteIconButton
            name="Back"
            icon-name="mdi-arrow-u-left-top"
            tooltip="Go back"
            keyname="KEY_ESC"
          />
          <RemoteIconButton
            name="Down"
            icon-name="mdi-arrow-down-thick"
            tooltip="Move down"
            keyname="KEY_DOWN"
          />
          <RemoteIconButton
            name="VDR Menu"
            icon-name="mdi-menu"
            tooltip="VDR Main Menu"
            keyname="KEY_Menu"
          />
          <RemoteIconButton
            name="Channel down"
            icon-name="mdi-arrow-down-bold"
            tooltip="Channel -"
            keyname="KEY_CHANNELDOWN"
          />
        </v-col>
      </v-row>
    </div>
    <!-- Color Keys -->
    <v-row>
      <v-col>
        <RemoteTextButton
          name="R"
          tooltip="Red Button"
          keyname="KEY_RED"
          color="red"
        />
        <RemoteTextButton
          name="G"
          tooltip="Green Button"
          keyname="KEY_GREEN"
          color="green"
        />
        <RemoteTextButton
          name="Y"
          tooltip="Yellow Button"
          keyname="KEY_YELLOW"
          color="yellow"
        />
        <RemoteTextButton
          name="B"
          tooltip="Blue Button"
          keyname="KEY_BLUE"
          color="blue"
        />
      </v-col>
    </v-row>
    <v-spacer />
    <!-- Replay buttons and direct access to menus and applications -->
    <v-row>
      <v-col>
        <RemoteIconButton
          name="Skip backward"
          icon-name="mdi-skip-backward"
          tooltip="Skip backward"
          keyname="KEY_BACK"
        />
        <RemoteIconButton
          name="Rewind"
          icon-name="mdi-rewind"
          tooltip="Rewind"
          keyname="KEY_REWIND"
        />
        <RemoteIconButton
          name="Play"
          icon-name="mdi-play"
          tooltip="Play"
          keyname="KEY_PLAY"
        />
        <RemoteIconButton
          name="Fast Forward"
          icon-name="mdi-fast-forward"
          tooltip="Fast Forward"
          keyname="KEY_FASTFORWARD"
        />
        <RemoteIconButton
          name="Skip forward"
          icon-name="mdi-skip-forward"
          tooltip="Skip forward"
          keyname="KEY_NEXT"
        />
      </v-col>
    </v-row>
    <v-spacer />

    <v-row>
      <v-col>
        <RemoteIconButton
          name="Record"
          icon-name="mdi-record"
          tooltip="Start Recording"
          keyname="KEY_RECORD"
          icon_color="red"
        />
        <RemoteIconButton
          name="Stop"
          icon-name="mdi-stop"
          tooltip="Stop Replay"
          keyname="KEY_STOP"
        />
        <RemoteIconButton
          name="Pause"
          icon-name="mdi-pause"
          tooltip="Pause"
          keyname="KEY_PAUSE"
        />
        <RemoteIconButton
          name="Subtitles"
          icon-name="mdi-subtitles"
          tooltip="Show Subtitles"
          keyname="KEY_SUBTITLE"
        />
        <RemoteIconButton
          name="Audio"
          icon-name="mdi-speaker-multiple"
          tooltip="Choose Audio Stream"
          keyname="KEY_MODE"
        />
      </v-col>
    </v-row>
    <!-- <v-spacer></v-spacer> -->
    <v-row>
      <v-col>
        <RemoteIconButton
          name="KODI"
          icon-name="mdi-kodi"
          tooltip="Toggle KODI"
          keyname="KEY_HOME"
          icon_color="blue"
        />
        <RemoteIconButton
          name="Webbrowser"
          icon-name="mdi-web"
          tooltip="Start Webbrowser"
          keyname="KEY_FN"
        />
        <RemoteIconButton
          name="Open Settings"
          icon-name="mdi-cog"
          tooltip="Open settings menu"
          keyname="KEY_SETUP"
        />
        <RemoteIconButton
          name="Recordings"
          icon-name="mdi-movie-open"
          tooltip="Show Recordings Menu"
          keyname="KEY_PVR"
        />
        <RemoteIconButton
          name="Timers"
          icon-name="mdi-timetable"
          tooltip="Show Timer Menu"
          keyname="KEY_TIME"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

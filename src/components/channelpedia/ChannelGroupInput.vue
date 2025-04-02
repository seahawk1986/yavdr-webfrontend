<template>
  <v-card :title="props.channelGroupEditTitle">
    <v-card-text>
      <v-form aria-label="channel group properties">
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
          :in="1"
          control-variant="default"
          label="Minimum channel number for group"
          prepend-icon="mdi-at"
          :hide-input="false"
          :inset="false"
          @keyup.enter="addChannelGroup"
        />
        <v-checkbox
          v-model="scrollToNewChannelGroup"
          :label="t('channels.scrollToNewPosition')"
        />
      </v-form>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer />

      <v-btn
        prepend-icon="mdi-cancel"
        :text="cancelButtonTitle"
        @click="abort"
      />
      <v-btn
        prepend-icon="mdi-send"
        :text="confirmButtonTitle"
        type="submit"
        @click="addChannelGroup"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import type { VDRChannel } from '@/stores/interfaces/VdrChannelInterface';
const { t } = useI18n();

const props = defineProps<{
    channelGroupEditTitle: string
    oldChannelGroup: VDRChannel|null
    confirmButtonTitle: string
    cancelButtonTitle: string
}>()

const newChannelGroupName: Ref<string> = props.oldChannelGroup ? ref(props.oldChannelGroup.name) : ref(t('channels.channelGroup'))
const newChannelGroupNumber: Ref<number|null> = props.oldChannelGroup ? (props.oldChannelGroup.number < 0 ? ref(null) : ref(props.oldChannelGroup.number)) : ref(null)
const scrollToNewChannelGroup: Ref<boolean> = ref(true)


function abort() {
  emit('abort')
}

function addChannelGroup() {
    emit('confirm', newChannelGroupName.value, newChannelGroupNumber.value, scrollToNewChannelGroup.value)
}

const emit = defineEmits<{
  (e: 'abort'): void
  (e: 'confirm', name: string, position: number|null, scroll: boolean): void
}>()
</script>
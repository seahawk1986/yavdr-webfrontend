<template>
  <v-card :title="props.channelGroupEditTitle">
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
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn
        text="Cancel"
        @click="abort"
      />
      <v-btn
        text="Add Channel Group"
        @click="addChannelGroup"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const newChannelGroupName: Ref<string> = ref(t('channels.channelGroup'))
const newChannelGroupNumber: Ref<number|null> = ref(null)
const scrollToNewChannelGroup: Ref<boolean> = ref(true)

const props = defineProps<{
    channelGroupEditTitle: string
}>()

function abort() {
  emit('abort')
}

function addChannelGroup() {
    emit('addChannelGroup', newChannelGroupName.value, newChannelGroupNumber.value, scrollToNewChannelGroup.value)
}

const emit = defineEmits<{
  (e: 'abort'): void
  (e: 'addChannelGroup', name: string, position: number|null, scroll: boolean): void
}>()
</script>
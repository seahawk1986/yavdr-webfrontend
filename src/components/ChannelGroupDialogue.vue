<template>
  <v-dialog
    v-model="showDialog"
    max-width="500"
    @keyup.enter="submit"
  >
    <v-card title="props.title">
      <v-card-text>
        <v-text-field
          v-model="channelGroupName"
          label="Group Name"
          :rules="[() => !!channelGroupName || 'This field is required']"
          prepend-icon="mdi-tag"
          required
          @keyup.enter="submit"
        />
        <v-number-input
          v-model="channelGroupNumber"
          :reverse="false"
          :min="1"
          control-variant="default"
          label="Minimum channel number for group"
          prepend-icon="mdi-at"
          :hide-input="false"
          :inset="false"
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
          @click="submit"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { type Ref, ref } from 'vue'

const showDialog: Ref<boolean> = ref(false)
const channelGroupName: Ref<string> = ref("")
const channelGroupNumber: Ref<number|null> = ref(null)

const props = defineProps<{
  title: Ref<string>
  showGroupAddDialog: boolean
  newChannelGroupName: Ref<string>
  newChannelGroupNumber: Ref<number|null>
}>()

const emit = defineEmits<{
(e: 'submit', name: string, number: number|null): void
(e: 'abort'): void
}>()

function submit() {
    emit('submit', channelGroupName.value, channelGroupNumber.value)
}

function abort() {
    emit('abort')
}

watch(props.newChannelGroupName, (newValue) => {
        channelGroupName.value = newValue
    }
)

watch(props.newChannelGroupNumber, (newValue) => {
        channelGroupNumber.value = newValue
    }
)

watch(showDialog, (newValue) => {
    if (!newValue) {abort()}
})

onMounted(() => {
    if (props.newChannelGroupName.value!= 'undefined') {
        channelGroupName.value = props.newChannelGroupName.value
    }
    if (props.newChannelGroupNumber.value) {
        channelGroupNumber.value = props.newChannelGroupNumber.value
    }
})
</script>
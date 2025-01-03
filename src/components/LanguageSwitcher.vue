<template>
  <v-select
    v-model="locale"
    :items="supportedLocales"
    density="compact"
    variant="outlined"
    hide-details="auto"
    @update:model-value="Trans.switchLanguage(locale as typeof i18n.global.locale.value)"
  />
</template>
<script lang="ts" setup>
  import i18n from "@/plugins/i18n"
  import { Trans as Tr, Trans} from '@/i18n/translation'

  const locale = i18n.global.locale
  const supportedLocales: string[] = Tr.supportedLocales

</script>
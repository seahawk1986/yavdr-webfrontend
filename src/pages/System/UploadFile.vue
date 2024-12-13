<template>
  <v-sheet
    class="ma-2 pa-2"
  >
    <h1>Text File Upload test</h1>
    You can click the field to choose a file or drag it into the field
    <FileUpload
      class="ma-2 pa-2"
      accept="*.conf"
      label="Choose a file to upload or drag a file onto this field ..."
      hint="click or drag a file onto this component"
      :mime-type="textMimetypeSet"
      upload-url="/vdr/channelfile"
      prepend-icon="mdi-text-box-outline"
      density="comfortable"
    />
  </v-sheet>
  <v-sheet
    class="ma-2 pa-2"
  >
    <h1>JPEG/PNG Image File Upload test</h1>
    You can click the field to choose a file or drag it into the field
    <FileUpload
      class="ma-2 pa-2"
      accept="*.conf"
      label="Choose a file to upload or drag a file onto this field ..."
      hint="click or drag a file onto this component"
      :mime-type="imageMimetypeSet"
      upload-url="/vdr/channelfile"
      prepend-icon="mdi-image"
      density="comfortable"
    />
  </v-sheet>
</template>

<script lang="ts" setup>
const textMimetypeSet = new Set(['text/plain'])
const imageMimetypeSet = new Set(['image/jpeg', 'image/png'])

</script>
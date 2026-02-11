<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container>
    <v-card>
      <v-stepper :items="[t('category.playbook'), t('category.configuration'), t('category.installation')]">
        <template #item.1>
          <v-card
            title="Select the Playbook:"
            flat
            fill-height
          >
            <v-radio-group v-model="playbook">
              <v-radio
                v-for="p in playbooks"
                :key="p.value"
                :label="p.label"
                :value="p.value"
              />
            </v-radio-group>
          </v-card>
        </template>

        <template #item.2>
          <v-card
            title="Customize the Playbook variables"
            flat
            fill-height
          >
            <v-divider />
            <v-list height="80vh">
              <ConfigComponent
                v-for="(value, key) in ansibleSchema.properties"
                :key="key"
                v-model="Config[key]"
                :label="key"
                :schema="value"
              />
            </v-list>
          </v-card>
        </template>

        <template #item.3>
          <v-card
            flat
            fill-height
            max-height="80vh"
            class="overflow-auto"
          >
            <v-card-actions>
              <v-btn
                block
                text="Install"
              />
            </v-card-actions>
          </v-card>
        </template>
      </v-stepper>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">

  // TODO: load the schema from backend
  import yaVDRConfig from './yaVDRConfig.json'
  import ansibleSchema from './yaVDRConfig.schema.json'

  import ConfigComponent from './ConfigComponent.vue';

  import { useI18n } from "vue-i18n";

  const {t} = useI18n()

  interface AnsiblePlaybook {
      label: string,
      value: string
  }

  interface InstallerConfig {
    [key: string]: any
  }

  const Config: Ref<InstallerConfig> = ref(yaVDRConfig)

  const playbook: Ref<string> = ref("yavdr07.yml")
  const playbooks: Ref<Array<AnsiblePlaybook>> = ref([
      {
          label: "yaVDR with Xorg",
          value: "yavdr07.yml",
      },
      {
          label: "yaVDR headless",
          value: "yavdr07-headless.yml",
      },
      {
          label: "yaVDR with DRM output",
          value: "yavdr07-drm.yml",
      }
  ])

  function add(list_data: string[]) {console.log("add list entry to", list_data); list_data.push("")}
  function remove(list_data: string[], index: number) {console.log("remove from", list_data, "at", index); list_data.splice(index, 1)}

</script>

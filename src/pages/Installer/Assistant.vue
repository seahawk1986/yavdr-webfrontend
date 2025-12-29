<template>
  <v-container>
    <v-card>
      <v-stepper :items="['Step 1', 'Step 2', 'Step 3']">
        <template #item.1>
          <v-card
            title="Select the Playbook:"
            flat
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
          >
            <v-list>
              <v-list-item
                v-for="(value, key) in ansibleSchema.properties"
                :key="key"
                :title="key"
              >
                <template v-if="'type' in value && value.type === 'string'">
                  <v-text-field>{{ value.default }}</v-text-field>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </template>

        <!-- <v-textarea variant="outlined" /> -->

        <template #item.3>
          <v-card
            title="Step Three"
            flat
          >
            ...
          </v-card>
        </template>
      </v-stepper>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
    // TODO: load the schema from backend
    import ansibleSchema from './AnsibleConfig.schema.json'

    console.log(ansibleSchema)

    interface AnsiblePlaybook {
        label: string,
        value: string
    }

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

</script>

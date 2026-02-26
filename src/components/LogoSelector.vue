<script lang="ts" setup>
import axios from "axios";
import { onMounted, ref, type Ref } from "vue";

const url = "https://api.github.com/users/Jasmeet181/repos";
const languages: Ref<Map<string, string>> = ref(new Map());
const discontinued_languages: Ref<Map<string, string>> = ref(new Map());
const selected_languages: Ref<Array<string>> = ref(["de"]);

interface RepoInterface {
  // shortened version of the long GitHub entry for a repository
  name: string;
  full_name: string;
  description: string;
}

async function get_languages() {
  try {
    const data = await axios.get(url);
    languages.value.clear();
    discontinued_languages.value.clear();
    data.data.forEach((element: RepoInterface) => {
      if (element.name.match("mediaportal-[^-]+-logos")) {
        const key = (/^mediaportal-([^-]+)-logos$/.exec(element.name) || "")[1];
        const value = element.description.replace(
          " for Mediaportal 1's LogoManager plugin",
          "",
        );
        if (!key) {
          throw "got no key";
        }
        if (element.description.startsWith("Discontinued")) {
          discontinued_languages.value.set(key, value);
        } else {
          languages.value.set(key, value);
        }
        // console.log(element.name, element.description)
      }
    });
    console.log(
      selected_languages.value.filter((entry) => {
        // console.log('check if ', entry, 'in ', languages.value)
        languages.value.has(entry);
      }),
    );
  } catch (error) {
    console.log("failed to retrieve logo repos", error);
  }
}

// see https://www.bqst.fr/country-code-to-flag-emoji/
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

async function refresh() {
  await get_languages();
}

async function save() {}

onMounted(async () => {
  await get_languages();
});
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>
        Channel Logos by <a href="https://github.com/Jasmeet181/">Jasmeet181</a>
      </v-card-title>
      <v-card-text>
        <div>
          <!-- {{ selected_languages }} -->
          <v-container>
            <v-row density="compact">
              <v-col
                v-for="[lang, description] in languages"
                :key="lang"
                cols="12"
                sm="4"
                md="4"
              >
                <v-sheet>
                  <v-checkbox
                    v-model="selected_languages"
                    :label="`${lang.length === 2 ? getFlagEmoji(lang.replace('uk', 'gb')) : ''} (${lang.toLocaleUpperCase()}): ${description}`"
                    :value="lang"
                    hide-details
                  />
                </v-sheet>
              </v-col>
            </v-row>
          </v-container>
          <v-expansion-panels>
            <v-expansion-panel title="Discontinued Logo Repositories">
              <v-expansion-panel-text>
                <v-row density="compact">
                  <v-col
                    v-for="[lang, description] in discontinued_languages"
                    :key="lang"
                    cols="12"
                    sm="4"
                    md="4"
                  >
                    <v-sheet>
                      <v-checkbox
                        v-model="selected_languages"
                        :label="`${lang.length === 2 ? getFlagEmoji(lang.replace('uk', 'gb')) : ''} (${lang.toLocaleUpperCase()}): ${description}`"
                        :value="lang"
                        hide-details
                      />
                    </v-sheet>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" prepend-icon="mdi-refresh" @click="refresh">
          Refresh
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-send" @click="save">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

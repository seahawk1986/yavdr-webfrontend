<script setup lang="ts">
import { ref } from 'vue'
import { useBackendStore } from '@/stores/backend'

const store = useBackendStore()

const username = ref('')
const password = ref('')
const nameRules = [(v: string) => !!v || 'Name is required']
const passwordRules = [(v: string) => !!v || 'Password is required']
const loginFailedSnackbar = ref(false)
const isLoggingIn = ref(false)

async function login() {
  loginFailedSnackbar.value = false
  isLoggingIn.value = true
  const result = await store.login(username.value, password.value)
  if (result) {
    console.log('Login successfull')
    username.value = ''
    password.value = ''
  } else {
    console.log('Login failed')
    loginFailedSnackbar.value = true
  }
  isLoggingIn.value = false
}
</script>

<template>
  <v-card
    class="ma-8"
    variant="elevated"
    color="black"
    width="320px"
    rounded="xl"
  >
    <v-card-title class="ma-4">
      <v-img
        src="@/assets/yavdr_logo.png"
        width="320"
        max-height="80"
        class="remove-black crop-img"
      />
    </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        class="pa-4"
      >
        <!-- we need to set tabindices because vuetifyjs wants to focus the clear button on text fields and ignores the login button in the tab order ... -->
        <v-text-field
          v-model="username"
          :rules="nameRules"
          label="Name"
          prepend-inner-icon="mdi-account"
          autocomplete="username"
          tabindex="1"
          @keyup.enter="username.length > 0 && password.length > 0 && login()"
        />
        <v-text-field
          v-model="password"
          :rules="passwordRules"
          label="Password"
          prepend-inner-icon="mdi-key"
          type="password"
          autocomplete="current-password"
          tabindex="2"
          @keyup.enter="username.length > 0 && password.length > 0 && login()"
        />
        <v-btn
          color="primary"
          :block="true"
          tabindex="3"
          :disabled="username.length === 0 || password.length === 0"
          :loading="isLoggingIn"
          text="Login"
          @click="login()"
        />
      </v-form>
      <v-snackbar
        v-model="loginFailedSnackbar"
        color="black"
      >
        Login failed
        <template #actions>
          <v-btn
            variant="text"
            text="Close"
            @click="loginFailedSnackbar = false"
          />
        </template>
      </v-snackbar>
    </v-card-text>
    <v-card-actions />
  </v-card>
</template>

<style scoped>
.remove-black :deep(img) {
  mix-blend-mode: lighten; /* Effectively makes black (#000000) transparent */
}
.crop-img :deep(img){
  object-fit: cover;
  scale: 2;
  object-position: 50% 47% /* Crops and aligns to the top of the image */
}
</style>

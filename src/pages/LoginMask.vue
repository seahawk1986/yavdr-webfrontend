<script setup lang="ts">
import { ref } from 'vue'
import { useBackendStore } from '@/stores/backend'

const store = useBackendStore()

const username = ref('')
const password = ref('')
const nameRules = [(v: string) => !!v || 'Name is required']
const passwordRules = [(v: string) => !!v || 'Password is required']
const loginFailedSnackbar = ref(false)

async function login() {
  loginFailedSnackbar.value = false
  const result = await store.login(username.value, password.value)
  if (result) {
    console.log('Login successfull')
  } else {
    console.log('Login failed')
    loginFailedSnackbar.value = true
  }
}
</script>

<template>
  <v-card class="ma-4">
    <v-card-title>Login</v-card-title>
    <v-card-text>
      <v-sheet>
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
            tabindex="1"
            @keyup.enter="username.length > 0 && password.length > 0 && login()"
          />
          <v-text-field
            v-model="password"
            :rules="passwordRules"
            label="Password"
            prepend-inner-icon="mdi-key"
            type="password"
            tabindex="2"
            @keyup.enter="username.length > 0 && password.length > 0 && login()"
          />
          <v-btn
            color="primary"
            tabindex="3"
            :disabled="username.length === 0 || password.length === 0"
            @click="login()"
          >
            Login
          </v-btn>
          <v-snackbar v-model="loginFailedSnackbar">
            Login failed
            <template #actions>
              <v-btn
                color="pink"
                variant="text"
                @click="loginFailedSnackbar = false"
              >
                Close
              </v-btn>
            </template>
          </v-snackbar>
        </v-form>
      </v-sheet>
    </v-card-text>
    <v-card-actions />
  </v-card>
</template>

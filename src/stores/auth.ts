// currently unused

import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia"

export const useAuthStore = defineStore('auth', () => {
    const ls = <T>(id: string, defaultValue: T): Ref<T> =>
        useLocalStorage(id, defaultValue);
    const jwToken: Ref<string | null> = ls("jwToken", null);
    const requiresLogin: Ref<boolean> = ref(false)

    const hasToken = computed(() => jwToken.value !== null && jwToken.value.length > 0);

    function invalidateToken() {
        // TODO: can the backend manage tokens resp. secret parts?
        console.log("request failed with permission denied, invalidate token ...")
        jwToken.value = null
    }

    async function refreshToken() {
        try {
            // refresh logic
        } catch {
            requiresLogin.value = true
        }
    }

    return { jwToken, hasToken, requiresLogin, invalidateToken, refreshToken }
})

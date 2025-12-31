import { defineStore } from "pinia"

export const useUIStore = defineStore('ui', () => {
    const showRemote: Ref<boolean> = ref(false)

    return { showRemote }
})
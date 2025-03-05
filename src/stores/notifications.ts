import { defineStore } from "pinia"

export interface messageInterface {
    text: string
    color: string
    timeout: number
}

export const useNotificationStore = defineStore("notifications", () => {
    const messages: Ref<Array<messageInterface>> = ref([])
    return {messages}
})
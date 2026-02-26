import { defineStore } from "pinia"

export interface messageInterface {
    text: string
    color: string
    closable: boolean
    timeout: number
}

export const useNotificationStore = defineStore("notifications", () => {
    const messages: Ref<Array<messageInterface>> = ref([])
    function addError(text: string) {
        messages.value.push({
            text,
            color: "error",
            closable: true,
            timeout: 5000
        })
    }
    function addInfo(text: string) {
        messages.value.push({
            text,
            color: "info",
            closable: true,
            timeout: 5000
        })
    }
    function addSuccess(text: string) {
        messages.value.push({
            text,
            color: "success",
            closable: true,
            timeout: 5000
        })
    }
    return { messages, addError, addInfo, addSuccess }
})
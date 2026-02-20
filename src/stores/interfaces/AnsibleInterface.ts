export interface AnsibleJobEventInterface {
    event?: {
        stdout: string
    },
    status?: {
        status: string
    }
}
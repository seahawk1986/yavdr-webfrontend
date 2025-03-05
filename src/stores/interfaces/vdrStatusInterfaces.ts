export enum statusMessageEnum {
    ChannelSwitch = "ChannelSwitch",
    Recording = "Recording",
    Replaying = "Replaying",
    SetAudioChannel = "SetAudioChannel",
    SetAudioTrack = "SetAudioTrack",
    SetSubtitleTrack = "SetSubtitleTrack",
    SetVolume = "SetVolume",
    TimerChange = "TimerChange",
}

export interface ChannelSwitch {
    DeviceNumber: number
    ChannelNumber: number
    LiveView: boolean
}
export interface Recording {
    DeviceNumber: number
    Name: string
    FileName: string
    On: boolean
}

export interface Replaying {
    Name: string
    FileName: string
    on: boolean
}

export interface SetAudioChannel {
    AudioChannel: number
}

export interface SetAudioTrack {
    Index: number
    Tracks: string[]
}

export interface SetSubtitleTrack {
    Index: number
    Tracks: string[]
}

export interface SetVolume {
    Volume: number
    Absolute: boolean
}

export enum TimerChangeEnum {
    tcMod = "tcMod",
    tcAdd = "tcAdd",
    tcDel = "tcDel",
}

export interface TimerChange {
    Timer: string
    Change: TimerChangeEnum
}
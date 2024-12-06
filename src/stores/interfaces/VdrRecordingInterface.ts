export interface VDRRecordingInterface {
    RecNum: number
    Path: string
    Name: string
    FullName?: string
    Title: string
    title: string  // this is either InfoTitle or Name
    searchTitle: string
    Start: number
    Priority: number
    Lifetime: number
    HierarchyLevels: number
    FramesPerSecond: number
    NumFrames: number
    LengthInSeconds: number
    duration: string
    FileSizeMB: number
    IsPesRecording: boolean
    IsNew: boolean
    IsEdited: boolean
    InfoChannelID?: string
    InfoChannelName?: string
    InfoTitle?: string
    InfoShortText?: string
    InfoDescription?: string
    InfoAux?: string
    InfoFramesPerSecond?: number
}
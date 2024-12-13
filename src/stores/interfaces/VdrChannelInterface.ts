export interface VDRChannel {
  number: number
  channel_id: string
  channel_string: string
  is_group: boolean
  is_radio: boolean
  name: string
  provider: string
  ca: string
  source: string
}

export interface TreeEntryInterface {
  id: string
  title: string
  children?: Array<TreeEntryInterface>
}

export interface ChannelSubGroup {
  id: string
  title: string
  channels: VDRChannel[]
}

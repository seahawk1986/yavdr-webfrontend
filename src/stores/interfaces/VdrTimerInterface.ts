export interface VDRTimerInterface {
  status_flags: number;
  raw: string;
  channel_id: string;
  channelname: string;
  day: number;
  start: number;
  stop: number;
  duration: number;
  time_span: string;
  priority: number;
  lifetime: number;
  filename: string;
  aux: string;
  id: number;
  channel_name: string;
  remote: string;
  day_weekdays: string;
  event_id: number;
  is_recording: boolean;
  is_pending: boolean;
  in_vps_margin: boolean;
}

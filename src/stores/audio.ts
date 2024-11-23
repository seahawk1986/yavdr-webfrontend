interface PulseDeviceInterface {
  device: string
  device_name: string
  index: number
  muted: boolean
  number_of_channels: number
  volume_values: Array<number>
  port_active: string
  is_default_sink: boolean
}

interface ListedPulseSinksInterface {
  pulse_devices: Array<PulseDeviceInterface>
  default_sink: string
}
export class ListedPulseSinks implements ListedPulseSinksInterface {
  pulse_devices: PulseDeviceInterface[] = []
  default_sink: string = ''
}

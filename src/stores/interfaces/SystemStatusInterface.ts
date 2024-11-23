export interface LoadAverageInterface {
  last_min: number
  last_5_min: number
  last_10_min: number
}

export interface ValueUnitInterface {
  value: string
  unit: string
}

export interface MemoryUsageInterface {
  total: number
  available: number
  percent: number
  used: number
  free: number
  active: number
  inactive: number
  buffers: number
  cached: number
  shared: number
  slab: number
  total_human: ValueUnitInterface
  used_human: ValueUnitInterface
  free_human: ValueUnitInterface
  active_human: ValueUnitInterface
  inactive_human: ValueUnitInterface
  buffers_human: ValueUnitInterface
  cached_human: ValueUnitInterface
  shared_human: ValueUnitInterface
  slab_human: ValueUnitInterface
}

export interface DiskUsageInterrace {
  total: number
  used: number
  free: number
  percent: number
  total_human: ValueUnitInterface
  used_human: ValueUnitInterface
  free_human: ValueUnitInterface
  device: string
  mountpoint: string
  fstype: string
  opts: string
}

export interface SwapUsageInterface {
  total: number
  used: number
  free: number
  percent: number
  sin: number
  sout: number
  total_human: ValueUnitInterface
  used_human: ValueUnitInterface
  free_human: ValueUnitInterface
  sin_human: number
  sout_human: number
}

export interface SensorItemInterface {
  label: string
  current: number
  high: number
  critical: number
}

export interface FanItemInterface {
  label: string
  current: number
}

export interface SystemStatusInterface {
  cpu_usage: Array<number>
  cpu_num: number
  load_average: LoadAverageInterface
  disk_usage: Array<DiskUsageInterrace>
  memory_usage: MemoryUsageInterface
  swap_usage: SwapUsageInterface
  temperatures: { sensors: { [key: string]: Array<SensorItemInterface> } }
  fans: { sensors: { [key: string]: Array<FanItemInterface> } }
  release: Array<string>
  kernel: string
  system_alias: Array<string>
  uptime: string
}

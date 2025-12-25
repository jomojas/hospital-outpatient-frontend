export interface ScheduleQueryDTO {
  departmentId: number
  startDate: string // yyyy-MM-dd
  endDate: string // yyyy-MM-dd
}

export interface DoctorScheduleResponse {
  staffId: number
  staffName: string
  description: string
  schedules: DailySchedule[]
}

export interface DailySchedule {
  id: number | null
  date: string // yyyy-MM-dd
  quota: number
  used: number
}

export interface SetQuotaRequest {
  staffId: number
  date: string // yyyy-MM-dd
  quota: number
}

export interface BatchSetQuotaRequest {
  staffId: number
  startDate: string // yyyy-MM-dd
  endDate: string // yyyy-MM-dd
  quota: number
  weekDays?: number[] // 1=周一..7=周日
}

export interface CopyScheduleRequest {
  departmentId: number
  sourceStartDate: string // yyyy-MM-dd
  targetStartDate: string // yyyy-MM-dd
}

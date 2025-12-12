// ✅ =================== 枚举定义 ===================

/** 医技申请状态 (通用) */
export const TechApplyStatus = {
  UNFINISHED: 'UNFINISHED', // 待执行
  CHECKING: 'CHECKING', // 执行中
  FINISHED: 'FINISHED' // 已完成
} as const

export type TechApplyStatus =
  (typeof TechApplyStatus)[keyof typeof TechApplyStatus]

/** 操作类型枚举 */
export const TechOperateType = {
  EXECUTE: 'EXECUTE', // 开始执行
  INPUT_RESULT: 'INPUT_RESULT' // 录入结果
} as const

export type TechOperateType =
  (typeof TechOperateType)[keyof typeof TechOperateType]

// ✅ =================== 通用分页类型 ===================

export interface PaginationMeta {
  page: number
  size: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// ✅ =================== 1. 任务录入 (Entry) 相关类型 ===================

/** 申请列表查询参数 */
export interface TechApplyQueryParams {
  keyword?: string
  page?: number
  pageSize?: number
  sortBy?: string
  order?: string
}

/** 申请单详情 (通用 DTO) */
export interface TechApplyItem {
  applyId: number
  recordId: number
  registrationId: number
  patientNo: string
  patientName: string
  gender: string
  age?: string
  itemId: number
  itemName: string
  applyPurpose: string
  applySite: string
  applyTime: string
  status: TechApplyStatus // 使用通用状态
  unit: number
  remark?: string
}

/** 提交结果参数 */
export interface SubmitResultRequest {
  result: string
  remark?: string
}

// ✅ =================== 2. 操作记录 (Record) 相关类型 ===================

/** 记录查询参数 */
export interface TechRecordQueryParams {
  keyword?: string
  operateType?: TechOperateType
  page?: number
  pageSize?: number
  sortBy?: string
  order?: string
}

/** 操作日志项 */
export interface TechRecordItem {
  logId: number
  applyId: number
  operatorId: number
  operatorName?: string
  operateTime: string
  operateType: TechOperateType
  itemId: number
  itemName: string
  itemType: string
  patientNo: string
  patientName: string
  remark?: string
}

// ✅ =================== 状态映射 (UI辅助) ===================

export const TechStatusMap: Record<string, { label: string; type: string }> = {
  [TechApplyStatus.UNFINISHED]: { label: '待执行', type: 'warning' },
  [TechApplyStatus.CHECKING]: { label: '执行中', type: 'primary' },
  [TechApplyStatus.FINISHED]: { label: '已完成', type: 'success' }
}

export const TechOperateTypeMap: Record<string, string> = {
  [TechOperateType.EXECUTE]: '开始执行',
  [TechOperateType.INPUT_RESULT]: '录入结果'
}

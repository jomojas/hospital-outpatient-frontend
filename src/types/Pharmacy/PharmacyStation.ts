// ✅ =================== 分页基础类型 ===================

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

// ✅ =================== 1. 待发药 (Dispense) 相关类型 ===================

/** 待发药列表查询参数 */
export interface DispensePendingQueryParams {
  keyword?: string // 患者姓名/药品名
  page?: number
  pageSize?: number
  sortBy?: string
  order?: string
}

/** 待发药明细项 (对应后端 DispensePendingDTO) */
export interface DispensePendingItem {
  prescriptionId: number
  registrationId: number // ✅ 核心分组字段
  patientName: string
  gender: string
  patientNo: string
  drugId: number
  drugName: string
  drugCategory: string
  specification: string // ✅ 规格 (如: 0.25g*24粒)
  unit: string // ✅ 单位 (如: 盒)
  dosage: string // 用法用量
  quantity: number
  prescribeTime: string
  remark?: string
}

/**
 * ✅ [前端专用] 患者发药分组模型
 * 用于将扁平的 API 数据转换为卡片视图数据
 */
export interface PatientDispenseGroup {
  registrationId: number
  patientName: string
  patientNo: string
  gender: string
  prescribeTime: string // 取组内第一条的时间
  items: DispensePendingItem[] // 该患者本次就诊的所有药品
}

/** 发药请求项 */
export interface DispenseDrugItemRequest {
  prescriptionId: number
  patientNo?: string // 后端DTO有这个字段，虽然逻辑上冗余，但保持一致
}

/** 发药提交请求 (对应后端 DispenseDrugsRequest) */
export interface DispenseRequest {
  prescriptions: DispenseDrugItemRequest[]
}

// ✅ =================== 2. 药房记录 (Record) 相关类型 ===================

/** 记录查询参数 */
export interface PharmacyRecordQueryParams {
  keyword?: string
  type?: 'DISPENSE' | 'RETURN' // 操作类型
  page?: number
  pageSize?: number
  sortBy?: string
  order?: string
}

/** 药房操作记录 (对应后端 PharmacyRecordDTO) */
export interface PharmacyRecordItem {
  recordId: number
  prescriptionId: number
  patientNo: string
  patientName: string
  drugId: number
  drugName: string
  specification: string // ✅ 规格
  unit: string // ✅ 单位
  quantity: number
  amount: string // 金额 (BigDecimal -> String)
  operateType: 'DISPENSE' | 'RETURN'
  operatorId: number
  operatorName: string
  operateTime: string
  remark?: string
}

// ✅ =================== 字典/枚举 ===================

export const PharmacyOperateTypeMap: Record<string, string> = {
  DISPENSE: '发药',
  RETURN: '退药'
}

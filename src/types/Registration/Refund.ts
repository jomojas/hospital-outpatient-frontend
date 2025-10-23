// ✅ 挂号记录项类型
export interface RegistrationRecord {
  registrationId: number
  patientId: number
  patientName: string
  departmentId: number
  departmentName: string
  doctorId: number
  doctorName: string
  visitDate: string // yyyy-MM-dd 格式
  period: string // "上午" | "下午"
  numberType: string // "普通号" | "专家号"
  initQuota: number
  usedQuota: number
  settlementTypeId: number
  settlementTypeName: string // "自费" | "医保" | "商保"
  paymentMethodId: number
  paymentMethodName: string // "现金" | "微信" | "支付宝" | "银行卡"
  payableAmount: number
  medicalRecordBook: number
  currentStatus: string // "待看诊" | "已看诊" | "已取消"
}

// ✅ 分页信息类型
export interface PaginationMeta {
  page: number
  size: number
  total: number
  totalPages: number
}

// ✅ 完整的API响应类型
export interface RegistrationRecordsResponse {
  code: number
  message: string
  data: RegistrationRecord[]
  meta: PaginationMeta
}

// ✅ 查询筛选参数类型（所有字段都可选）
export interface RegistrationQueryParams {
  page?: number // 页码(从1开始)，默认值：1
  pageSize?: number // 每页数量，默认值：10
  date?: string // 挂号日期(yyyy-MM-dd)，可选
  deptId?: number // 科室ID，可选
  doctorId?: number // 医生ID，可选
  status?: string // 挂号状态，可选
  keyword?: string // 关键词(科室名/患者姓名/医生姓名)，可选
  sortBy?: 'date' | 'patientName' | 'doctorName' // 排序字段，默认值：'date'
  order?: 'asc' | 'desc' // 排序顺序，默认值：'desc'
}

// ✅ 搜索条件类型（变量A）
export interface SearchFilters {
  deptId?: number
  doctorId?: number
  status?: string
  keyword?: string
  date?: string
}

// ✅ 分页排序条件类型（变量B）
export interface PaginationSort {
  page: number
  pageSize: number
  order: 'asc' | 'desc'
  sortBy: 'date' | 'patientName' | 'doctorName'
}

// 医生信息类型
export interface BasicDoctor {
  staffId: number
  name: string
  phone: string
  idCard: string
  departmentId: number
  description: string
  roleId: number
  createTime: string
  isExpert: boolean
  initQuota?: number
  usedQuota?: number
}

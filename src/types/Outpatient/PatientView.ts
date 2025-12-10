// ✅ 医生挂号患者信息
export interface DoctorPatient {
  /** 患者姓名 */
  registrationId: number
  /** 患者姓名 */
  name: string
  /** 病历号 */
  medicalNo: string
  /** 挂号状态 */
  status: string
  /** 挂号日期 */
  registrationDate: string
  /** 主诉（初诊后才有） */
  complaint?: string
}

// ✅ 患者查询参数
export interface PatientQueryParams {
  /** 关键词（患者姓名或病历号） */
  keyword?: string
  /** 状态筛选（后端状态） */
  status?: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

// ✅ 分页信息类型
export interface PaginationMeta {
  page: number
  size: number
  total: number
  totalPages: number
}

// ✅ 患者列表响应
export interface PatientListResponse {
  data: DoctorPatient[]
  meta: PaginationMeta
}

// ✅ 患者查询表单数据
export interface PatientSearchFormData {
  /** 搜索关键词 */
  keyword: string
  /** 状态筛选（前端状态） */
  frontendStatus?: FrontendPatientStatusType
}

// ✅ 默认查询参数
export const DEFAULT_PATIENT_PARAMS: Required<
  Omit<PatientQueryParams, 'keyword' | 'status'>
> = {
  page: 1,
  pageSize: 10
}

// ✅ 后端原始状态枚举（完整版本）
export const BackendPatientStatus = {
  /** 待看诊 */
  WAITING_FOR_CONSULTATION: 'WAITING_FOR_CONSULTATION',
  /** 已初诊 */
  INITIAL_CONSULTATION_DONE: 'INITIAL_CONSULTATION_DONE',
  /** 待项目缴费 */
  WAITING_FOR_PROJECT_PAYMENT: 'WAITING_FOR_PROJECT_PAYMENT',
  /** 待检查 */
  WAITING_FOR_CHECKUP: 'WAITING_FOR_CHECKUP',
  /** 检查中 */
  CHECKING: 'CHECKING',
  /** 待复诊 */
  WAITING_FOR_REVISIT: 'WAITING_FOR_REVISIT',
  /** 已复诊 */
  REVISITED: 'REVISITED',
  /** 待处方缴费 */
  WAITING_FOR_PRESCRIPTION_PAYMENT: 'WAITING_FOR_PRESCRIPTION_PAYMENT',
  /** 待取药 */
  WAITING_FOR_MEDICINE: 'WAITING_FOR_MEDICINE',
  // /** 已取药 */
  // MEDICINE_TAKEN: 'MEDICINE_TAKEN',
  // /** 已退药 */
  // MEDICINE_RETURNED: 'MEDICINE_RETURNED',
  /** 诊疗结束 */
  FINISHED: 'FINISHED'
} as const

// ✅ 后端状态类型
export type BackendPatientStatusType =
  (typeof BackendPatientStatus)[keyof typeof BackendPatientStatus]

// ✅ 前端显示状态枚举（医生视角的4个状态）
export const FrontendPatientStatus = {
  /** 待初诊 */
  WAITING_INITIAL: 'WAITING_INITIAL',
  /** 初诊后（去做项目） */
  AFTER_INITIAL: 'AFTER_INITIAL',
  /** 待复诊（项目完成） */
  WAITING_REVISIT: 'WAITING_REVISIT',
  /** 复诊结束 */
  REVISIT_COMPLETED: 'REVISIT_COMPLETED'
} as const

// ✅ 前端状态类型
export type FrontendPatientStatusType =
  (typeof FrontendPatientStatus)[keyof typeof FrontendPatientStatus]

// ✅ 状态映射关系（后端状态 -> 前端状态）按照后端逻辑
export const STATUS_MAPPING: Record<
  BackendPatientStatusType,
  FrontendPatientStatusType
> = {
  // 待初诊：只有待看诊状态
  [BackendPatientStatus.WAITING_FOR_CONSULTATION]:
    FrontendPatientStatus.WAITING_INITIAL,

  // 初诊后：已初诊、待项目缴费、待检查、检查中
  [BackendPatientStatus.INITIAL_CONSULTATION_DONE]:
    FrontendPatientStatus.AFTER_INITIAL,
  [BackendPatientStatus.WAITING_FOR_PROJECT_PAYMENT]:
    FrontendPatientStatus.AFTER_INITIAL,
  [BackendPatientStatus.WAITING_FOR_CHECKUP]:
    FrontendPatientStatus.AFTER_INITIAL,
  [BackendPatientStatus.CHECKING]: FrontendPatientStatus.AFTER_INITIAL,

  // 待复诊：只有待复诊状态
  [BackendPatientStatus.WAITING_FOR_REVISIT]:
    FrontendPatientStatus.WAITING_REVISIT,
  [BackendPatientStatus.REVISITED]: FrontendPatientStatus.WAITING_REVISIT,

  // 复诊结束：从已复诊开始的所有后续状态
  [BackendPatientStatus.WAITING_FOR_PRESCRIPTION_PAYMENT]:
    FrontendPatientStatus.REVISIT_COMPLETED,
  [BackendPatientStatus.WAITING_FOR_MEDICINE]:
    FrontendPatientStatus.REVISIT_COMPLETED,
  // [BackendPatientStatus.MEDICINE_TAKEN]:
  //   FrontendPatientStatus.REVISIT_COMPLETED,
  // [BackendPatientStatus.MEDICINE_RETURNED]:
  //   FrontendPatientStatus.REVISIT_COMPLETED,
  [BackendPatientStatus.FINISHED]: FrontendPatientStatus.REVISIT_COMPLETED
}

// ✅ 前端状态分组（按照后端逻辑）
export const FRONTEND_STATUS_GROUPS = {
  [FrontendPatientStatus.WAITING_INITIAL]: [
    BackendPatientStatus.WAITING_FOR_CONSULTATION
  ],
  [FrontendPatientStatus.AFTER_INITIAL]: [
    BackendPatientStatus.INITIAL_CONSULTATION_DONE,
    BackendPatientStatus.WAITING_FOR_PROJECT_PAYMENT,
    BackendPatientStatus.WAITING_FOR_CHECKUP,
    BackendPatientStatus.CHECKING
  ],
  [FrontendPatientStatus.WAITING_REVISIT]: [
    BackendPatientStatus.WAITING_FOR_REVISIT,
    BackendPatientStatus.REVISITED
  ],
  [FrontendPatientStatus.REVISIT_COMPLETED]: [
    BackendPatientStatus.WAITING_FOR_PRESCRIPTION_PAYMENT,
    BackendPatientStatus.WAITING_FOR_MEDICINE,
    // BackendPatientStatus.MEDICINE_TAKEN,
    // BackendPatientStatus.MEDICINE_RETURNED,
    BackendPatientStatus.FINISHED
  ]
} as const

// ✅ 前端状态显示配置
export const FRONTEND_STATUS_OPTIONS = [
  {
    label: '全部状态',
    value: '',
    type: 'default',
    color: '#606266'
  },
  {
    label: '待初诊',
    value: FrontendPatientStatus.WAITING_INITIAL,
    type: 'warning',
    color: '#E6A23C'
  },
  {
    label: '初诊后',
    value: FrontendPatientStatus.AFTER_INITIAL,
    type: 'info',
    color: '#909399'
  },
  {
    label: '待复诊',
    value: FrontendPatientStatus.WAITING_REVISIT,
    type: 'primary',
    color: '#409EFF'
  },
  {
    label: '复诊结束',
    value: FrontendPatientStatus.REVISIT_COMPLETED,
    type: 'success',
    color: '#67C23A'
  }
] as const

// ✅ 状态转换函数
export function mapBackendStatusToFrontend(
  backendStatus: string
): FrontendPatientStatusType {
  return (
    STATUS_MAPPING[backendStatus as BackendPatientStatusType] ||
    FrontendPatientStatus.WAITING_INITIAL
  )
}

// ✅ 获取状态显示信息 (修改后)
export function getStatusDisplayInfo(backendStatus: string) {
  // 1. 先计算它属于哪个大分组 (为了保持Tab筛选功能正常)
  const frontendStatus = mapBackendStatusToFrontend(backendStatus)

  // 2. 🔥 特殊拦截：如果是 REVISITED (已确诊/待开方)，给予特殊的显示样式
  // 虽然它归类在"待复诊"分组，但我们希望视觉上把它区分出来
  if (backendStatus === BackendPatientStatus.REVISITED) {
    return {
      frontendStatus, // 依然保持在 "待复诊" 分组
      label: '已确诊 (待开方)', // 特殊文案
      type: 'success', // 使用绿色或橙色，区别于普通待复诊的蓝色/红色
      color: '#13ce66' // 自定义颜色 (例如 Element 的绿色，表示诊断已完成)
    }
  }

  // 3. 通用逻辑：去配置表中查找默认的组样式
  const statusOption = FRONTEND_STATUS_OPTIONS.find(
    (option) => option.value === frontendStatus
  )

  return {
    frontendStatus,
    label: statusOption?.label || '未知状态',
    type: statusOption?.type || 'info',
    color: statusOption?.color || '#909399'
  }
}

// ✅ 将前端状态转换为后端状态列表（用于API调用）
export function convertFrontendStatusToBackendStatuses(
  frontendStatus?: FrontendPatientStatusType | string
): string[] {
  if (!frontendStatus || frontendStatus === '') {
    return [] // 返回空数组表示不筛选
  }

  const statusGroup =
    FRONTEND_STATUS_GROUPS[frontendStatus as FrontendPatientStatusType]
  return statusGroup ? [...statusGroup] : []
}

// ✅ 患者统计信息
export interface PatientStatistics {
  /** 总患者数 */
  totalPatients: number
  /** 待初诊患者数 */
  waitingInitialCount: number
  /** 初诊后患者数 */
  afterInitialCount: number
  /** 待复诊患者数 */
  waitingRevisitCount: number
  /** 复诊结束患者数 */
  revisitCompletedCount: number
}

// ✅ 搜索提示选项
export const SEARCH_TIPS = [
  {
    label: '按患者姓名搜索',
    example: '张三'
  },
  {
    label: '按病历号搜索',
    example: '100200300'
  },
  {
    label: '支持模糊搜索',
    example: '张*、100*'
  }
] as const

// ✅ 患者详细信息（基于数据库 patient 表结构）
export interface PatientDetailInfo extends DoctorPatient {
  /** 患者ID */
  patientId?: number
  /** 患者编号 */
  patientNo?: string
  /** 性别 */
  gender?: '男' | '女'
  /** 生日 */
  birthday?: string
  /** 身份证号 */
  idCard?: string
  /** 地址 */
  address?: string
  /** 年龄（计算字段） */
  age?: number
}

// ✅ 患者基础信息（对应数据库 patient 表）
export interface PatientBaseInfo {
  /** 患者ID */
  patientId: number
  /** 患者编号 */
  patientNo: string
  /** 患者姓名 */
  name: string
  /** 性别 */
  gender: '男' | '女'
  /** 生日 */
  birthday: string
  /** 身份证号 */
  idCard: string
  /** 地址 */
  address: string
}

// ✅ 年龄计算函数
export function calculateAge(birthday?: string): number | undefined {
  if (!birthday) return undefined

  try {
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age >= 0 ? age : undefined
  } catch {
    return undefined
  }
}

// ✅ 地址简化函数
export function formatAddress(address?: string): string {
  if (!address) return '暂无'

  // 如果地址过长，只显示前20个字符
  if (address.length > 20) {
    return `${address.substring(0, 20)}...`
  }

  return address
}

// ✅ 身份证号脱敏函数
export function maskIdCard(idCard?: string): string {
  if (!idCard) return '暂无'
  if (idCard.length < 8) return idCard

  const start = idCard.substring(0, 4)
  const end = idCard.substring(idCard.length - 4)
  const middle = '*'.repeat(idCard.length - 8)

  return `${start}${middle}${end}`
}

// ✅ 后端状态统计响应类型
export interface PatientStatusCountResponse {
  /** 待初诊患者数 */
  WAITING_INITIAL: number
  /** 初诊后患者数 */
  AFTER_INITIAL: number
  /** 待复诊患者数 */
  WAITING_REVISIT: number
  /** 复诊结束患者数 */
  REVISIT_COMPLETED: number
}

// ✅ 患者统计信息（保持现有接口不变）
export interface PatientStatistics {
  /** 总患者数 */
  totalPatients: number
  /** 待初诊患者数 */
  waitingInitialCount: number
  /** 初诊后患者数 */
  afterInitialCount: number
  /** 待复诊患者数 */
  waitingRevisitCount: number
  /** 复诊结束患者数 */
  revisitCompletedCount: number
}

// ✅ 类型导出别名
export type {
  DoctorPatient as DoctorPatientDTO,
  PatientQueryParams as PatientSearchParams,
  PatientListResponse as PatientResponse,
  PatientSearchFormData as PatientFormData
}

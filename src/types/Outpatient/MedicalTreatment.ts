// ✅ =================== 通用类型 ===================

/** 申请类型常量 */
export const ApplyType = {
  EXAM: 'EXAM', // 检查
  LAB: 'LAB', // 检验
  DISPOSAL: 'DISPOSAL' // 处置
} as const

/** 申请类型类型定义 */
export type ApplyType = (typeof ApplyType)[keyof typeof ApplyType]

/** 申请状态常量 */
export const ApplyStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT', // 待缴费
  UNFINISHED: 'UNFINISHED', // 待完成/待发药
  FINISHED: 'FINISHED', // 已完成/已发药
  RETURNED: 'RETURNED', // 已退回/撤销 (退费)
  CANCELLED: 'CANCELLED', // 已退费/作废 (退费)
  REVOKED: 'REVOKED' // ✅ 新增：已撤销 (医生主动撤销，不涉及退费)
} as const

/** 申请状态类型定义 */
export type ApplyStatus = (typeof ApplyStatus)[keyof typeof ApplyStatus]

/** 药品单位常量 */
export const DrugUnit = {
  BOX: 'BOX', // 盒
  BOTTLE: 'BOTTLE', // 瓶
  PIECE: 'PIECE', // 片
  CAPSULE: 'CAPSULE' // 粒
} as const

/** 药品单位类型定义 */
export type DrugUnit = (typeof DrugUnit)[keyof typeof DrugUnit]

// ✅ =================== 分页元信息 ===================

/** 分页元信息 */
export interface PaginationMeta {
  /** 当前页码 */
  page: number
  /** 每页大小 */
  size: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  totalPages: number
}

/** 分页响应基础类型 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  data: T[]
  /** 分页元信息 */
  meta: PaginationMeta
}

// ✅ =================== 第1页：病案首页 ===================

/** 创建病案请求参数 */
export interface CreateMedicalCaseRequest {
  /** 患者编号 */
  patientNo: string
  /** 挂号ID */
  registrationId: number
  /** 主诉 */
  chiefComplaint: string
  /** 现病史 */
  presentHistory: string
  /** 体格检查 */
  physicalExam: string
  /** 诊断（复诊时填写） */
  diagnosis?: string
  /** 治疗方案（复诊时填写） */
  treatmentPlan?: string
}

/** 创建病案响应数据 */
export interface CreateMedicalCaseResponse {
  /** 病案ID */
  recordId: number
}

/** 病案详情信息 */
export interface MedicalCaseDetail {
  /** 患者编号 */
  patientNo: string
  /** 挂号ID */
  registrationId: number
  /** 主诉 */
  chiefComplaint: string
  /** 现病史 */
  presentHistory: string
  /** 体格检查 */
  physicalExam: string
  /** 诊断 */
  diagnosis?: string
  /** 治疗方案 */
  treatmentPlan?: string
  /** 创建时间 */
  createTime?: string
}

// ✅ =================== 第2页：医疗项目申请 ===================

/** 医疗项目信息 */
export interface MedicalItem {
  /** 项目ID */
  itemId: number
  /** 项目编码 */
  itemCode: string
  /** 项目名称 */
  itemName: string
  /** 项目类型 */
  itemType: ApplyType
  /** 类型中文 */
  itemTypeLabel: string
  /** 价格 */
  price: string
  /** 描述 */
  description: string
}

/** ✅ 医疗项目分页响应 */
export interface MedicalItemResponse extends PaginatedResponse<MedicalItem> {}

/** ✅ 批量获取医疗项目的组合响应（用于 getAllMedicalItems） */
export interface AllMedicalItemsResponse {
  /** 检查项目分页响应 */
  examItems: MedicalItemResponse
  /** 检验项目分页响应 */
  labItems: MedicalItemResponse
  /** 处置项目分页响应 */
  disposalItems: MedicalItemResponse
}

/** ✅ 扁平化的医疗项目响应（用于 Store） */
export interface FlatMedicalItemsResponse {
  /** 检查项目数据 */
  examItems: MedicalItem[]
  /** 检验项目数据 */
  labItems: MedicalItem[]
  /** 处置项目数据 */
  disposalItems: MedicalItem[]
  /** 检查项目分页信息 */
  examMeta: PaginationMeta
  /** 检验项目分页信息 */
  labMeta: PaginationMeta
  /** 处置项目分页信息 */
  disposalMeta: PaginationMeta
}

/** 单个项目申请 */
export interface ApplyItem {
  /** 医疗项目ID */
  itemId: number
  /** 申请类型 */
  applyType: ApplyType
  /** 申请目的 */
  applyPurpose: string
  /** 申请部位 */
  applySite: string
  /** 项目单位数量 */
  unit: number
  /** 备注 */
  remark?: string
}

/** 申请医疗项目请求参数 */
export interface ApplyMedicalItemsRequest {
  /** 挂号ID */
  registrationId: number
  /** 申请项目列表 */
  items: ApplyItem[]
}

/** 历史项目详情 (包含状态) */
export interface CaseItemHistory {
  itemId: number
  itemName: string
  itemCode: string
  itemType: ApplyType
  status: ApplyStatus
  price: string
  unit: number
  createTime: string
  applyId: number // 申请记录的主键ID，用于撤销操作
}

// ✅ =================== 第3页：检查结果查看 ===================

/** 检查结果详情 */
export interface ExaminationResult {
  applyId: number
  itemId: number
  itemName: string // ✅ 必加
  applyType: ApplyType
  applyPurpose: string
  applySite: string
  applyTime: string
  performerId?: number
  performerName?: string // ✅ 建议加
  resultRecorderId?: number
  performTime?: string
  result?: string
  status: ApplyStatus
  unit: number
  remark?: string
}

/** 检查结果列表响应 */
export interface ExaminationResultsResponse {
  /** 检查结果列表 */
  results: ExaminationResult[]
  /** 总数 */
  total: number
}

// ✅ =================== 第4页：门诊确诊 ===================

/** 更新病案请求参数 */
export interface UpdateMedicalCaseRequest {
  /** 患者编号 */
  patientNo: string
  /** 挂号ID */
  registrationId: number
  /** 主诉 */
  chiefComplaint: string
  /** 现病史 */
  presentHistory: string
  /** 体格检查 */
  physicalExam: string
  /** 诊断 */
  diagnosis: string
  /** 治疗方案 */
  treatmentPlan: string
}

// ✅ =================== 第5页：开设处方 ===================

/** 药品查询参数 */
export interface DrugQueryParams {
  /** 关键词（药品名称/编码） */
  keyword?: string
  /** 药品类别ID */
  categoryId?: number
  /** 分页参数 */
  page?: number
  /** 每页大小 */
  size?: number
}

/** 药品信息 */
export interface DrugInfo {
  /** 药品ID */
  drugId: number
  /** 药品编码 */
  drugCode: string
  /** 药品名称 */
  drugName: string
  /** 类别ID */
  categoryId: number
  /** 类别名称 */
  categoryName: string
  /** 类别描述 */
  categoryDescription: string
  /** 生产日期 */
  productionDate: string
  /** 保质期 */
  shelfLife: string
  /** 库存数量 */
  stockQuantity: string
  /** 规格 */
  specification: string
  /** 单位 */
  unit: DrugUnit
  /** 零售价 */
  retailPrice: string
  /** 药品描述 */
  description: string
}

/** ✅ 药品列表分页响应 */
export interface DrugListResponse extends PaginatedResponse<DrugInfo> {}

/** 单个药品处方 */
export interface PrescriptionItem {
  /** 药品ID */
  drugId: number
  /** 用法用量 */
  dosage: string
  /** 数量 */
  quantity: number
  /** 备注 */
  remark?: string
}

/** 开具处方请求参数 */
export interface CreatePrescriptionRequest {
  /** 挂号ID */
  registrationId: number
  /** 药品处方列表 */
  prescriptions: PrescriptionItem[]
}

/** 处方历史详情 */
export interface PrescriptionHistory {
  prescriptionId: number // 处方主键 (类似 applyId)
  drugId: number
  drugName: string
  drugCode: string // 建议加
  specification: string // 规格 (必加，医生要看是0.5g还是0.25g)
  unit: string
  price: string
  usage: string // 对应提交时的 dosage
  quantity: number
  status: ApplyStatus // UNFINISHED, FINISHED, RETURNED, REVOKED
  createTime: string
}

// ✅ =================== 第6页：费用查询 ===================

// 1. 修改枚举类型，增加 'REVOKED'
export type FeeStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'REVOKED'

/** 医疗项目费用详情 */
export interface ItemFeeDTO {
  itemId: number
  itemName: string
  price: string
  unit: number
  amount: string
  // ✅ 新增：非常重要
  status: FeeStatus
  createTime: string // 开立时间
}

/** 药品费用详情 */
export interface DrugFeeDTO {
  drugId: number
  drugName: string
  // ✅ 新增：药品规格很重要
  specification: string
  price: string
  quantity: number
  amount: string
  // ✅ 新增
  status: FeeStatus
  createTime: string
}

/** 费用查询响应 */
export interface FeeInquiryResponse {
  registrationFee: string
  medicalItemFees: ItemFeeDTO[]
  prescriptionFees: DrugFeeDTO[]
  totalAmount: string // 建议统一叫 totalAmount
  unpaidAmount: string // ✅ 新增：建议后端计算好待缴金额，方便前端高亮展示
}

// ✅ =================== Pinia Store 用到的复合类型 ===================

/** 医疗项目存储结构 */
export interface MedicalItemsStore {
  /** 检查项目 */
  examItems: MedicalItem[]
  /** 检验项目 */
  labItems: MedicalItem[]
  /** 处置项目 */
  disposalItems: MedicalItem[]
  /** ✅ 分页信息 */
  examMeta?: PaginationMeta
  labMeta?: PaginationMeta
  disposalMeta?: PaginationMeta
}

/** 选中的申请项目（用于表单） */
export interface SelectedApplyItem extends ApplyItem {
  /** 临时ID（用于前端列表操作） */
  tempId: string
  /** 项目信息（关联的医疗项目） */
  itemInfo?: MedicalItem
}

/** 选中的处方项目（用于表单） */
export interface SelectedPrescriptionItem extends PrescriptionItem {
  /** 临时ID（用于前端列表操作） */
  tempId: string
  /** 药品信息（关联的药品） */
  drugInfo?: DrugInfo
}

/** 患者当前病案信息 */
export interface PatientCaseInfo {
  /** 患者病历号 */
  medicalNo: string
  /** 患者姓名 */
  patientName: string
  /** 病案ID */
  caseId?: number
  /** 挂号ID */
  registrationId: number
  /** 病案详情 */
  caseDetail?: MedicalCaseDetail
  /** 当前操作类型 */
  action: string
}

/**
 * 诊疗工作台上下文数据
 * 用于初始化 DoctorWorkspaceLayout，包含患者基本信息和当前状态
 */
export interface ClinicWorkspaceContext {
  /** 挂号单ID (visitId) */
  registrationId: number
  /** 病历号 */
  medicalNo: string
  /** 患者姓名 */
  patientName: string
  /** 性别 */
  patientGender: string
  /** 年龄 (建议后端处理成字符串返回，如 "25" 或 "2岁3月") */
  patientAge: string
  /**
   * 当前挂号状态 (后端原始状态)
   * 对应 BackendPatientStatus
   */
  visitStatus: string
  /**
   * 关联的病案ID
   * 如果为 null，说明是初诊且未接诊(未建档)
   */
  caseId: number | null
}

// ✅ =================== 工具函数类型 ===================

/** 申请类型中文映射 */
export const ApplyTypeLabels: Record<ApplyType, string> = {
  [ApplyType.EXAM]: '检查',
  [ApplyType.LAB]: '检验',
  [ApplyType.DISPOSAL]: '处置'
}

/** 申请状态中文映射 */
export const ApplyStatusLabels: Record<ApplyStatus, string> = {
  [ApplyStatus.PENDING_PAYMENT]: '待缴费',
  [ApplyStatus.UNFINISHED]: '待完成',
  [ApplyStatus.FINISHED]: '已完成',
  [ApplyStatus.RETURNED]: '已退药',
  [ApplyStatus.CANCELLED]: '已退费',
  [ApplyStatus.REVOKED]: '已撤销' // ✅ 新增
}

/** 药品单位中文映射 */
export const DrugUnitLabels: Record<DrugUnit, string> = {
  [DrugUnit.BOX]: '盒',
  [DrugUnit.BOTTLE]: '瓶',
  [DrugUnit.PIECE]: '片',
  [DrugUnit.CAPSULE]: '粒'
}

// ✅ =================== 表单验证规则类型 ===================

/** 病案表单验证规则 */
export interface MedicalCaseFormRules {
  chiefComplaint: Array<{ required: boolean; message: string; trigger: string }>
  presentHistory: Array<{ required: boolean; message: string; trigger: string }>
  physicalExam: Array<{ required: boolean; message: string; trigger: string }>
  diagnosis?: Array<{ required: boolean; message: string; trigger: string }>
  treatmentPlan?: Array<{ required: boolean; message: string; trigger: string }>
}

/** 申请项目表单验证规则 */
export interface ApplyItemFormRules {
  applyPurpose: Array<{ required: boolean; message: string; trigger: string }>
  applySite: Array<{ required: boolean; message: string; trigger: string }>
  unit: Array<{
    required: boolean
    message: string
    trigger: string
    type: string
  }>
}

/** 处方项目表单验证规则 */
export interface PrescriptionItemFormRules {
  dosage: Array<{ required: boolean; message: string; trigger: string }>
  quantity: Array<{
    required: boolean
    message: string
    trigger: string
    type: string
  }>
}

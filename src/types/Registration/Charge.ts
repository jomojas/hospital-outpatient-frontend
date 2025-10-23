// ✅ 缴费项目基础类型
export interface ChargeItem {
  type: 'DRUG' | 'ITEM' // 项目类型：药品或医疗项目
  applyId: number // 申请ID
  patientId: number // 患者ID
  patientName: string // 患者姓名
  registrationId: number // 挂号ID
  itemId: number // 项目ID
  itemCode: string // 项目编码
  itemName: string // 项目名称
  price: number // 单价
  quantity: number // 数量
  totalAmount: number // 总金额
  description: string // 描述信息
  createTime: string // 创建时间 (ISO 8601 格式)

  // ✅ 药品专有字段（仅药品类型时有值）
  drugCategoryId: number | null // 药品分类ID

  // ✅ 医疗项目专有字段（仅医疗项目类型时有值）
  itemType: 'EXAM' | 'LAB' | 'DISPOSAL' | null // 项目类型：检查/检验/处置
}

// ✅ 分页信息类型
export interface ChargePaginationMeta {
  page: number // 当前页码
  size: number // 每页数量
  total: number // 总记录数
  totalPages: number // 总页数
}

// ✅ 完整的API响应类型（已解包，只有data）
export interface ChargeItemsResponse {
  data: ChargeItem[] // 缴费项目列表
  meta: ChargePaginationMeta // 分页信息
}

// ✅ 药品分类类型
export interface DrugCategory {
  categoryId: number // 类别ID
  categoryName: string // 类别名称
  description: string // 类别描述
}

// ✅ 项目类型类型
export interface ProjectType {
  code: 'EXAM' | 'LAB' | 'DISPOSAL' // 项目类型编码
  name: string // 项目类型名称
}

// ✅ 缴费查询参数类型
export interface ChargeQueryParams {
  type?: 'ITEM' | 'DRUG' // 类型（ITEM-医疗项目, DRUG-药品）
  keyword?: string // 关键字（患者名/项目名/药品名）
  itemType?: 'EXAM' | 'LAB' | 'DISPOSAL' // 项目类型
  drugCategory?: number // 药品类别ID
  page?: number // 页码，从1开始，默认值：1
  pageSize?: number // 每页数量，默认值：10
  sortBy?: 'totalAmount' | 'createTime' // 排序字段
  order?: 'asc' | 'desc' // 排序方式
}

// ✅ 结算缴费项精简DTO
export interface ChargeSettleItem {
  type: 'ITEM' | 'DRUG' // 类型（ITEM-医疗项目, DRUG-药品）
  applyId: number // 申请/处方ID
  registrationId: number // 挂号ID
  itemId: number // 项目/药品ID
  patientId: number // 患者ID
  quantity: number // 数量
  price: number // 单价
  totalAmount: number // 总金额
  status: string // 状态，如：PENDING_PAYMENT
}

// ✅ 结算缴费请求DTO
export interface ChargeSettleRequest {
  items: ChargeSettleItem[] // 缴费项目列表
  paymentMethodId: number // 支付方式ID
  settlementTypeId: number // 结算类别ID
}

// ✅ 药品类型的缴费项目（类型守卫）
export interface DrugChargeItem extends ChargeItem {
  type: 'DRUG'
  drugCategoryId: number // 药品类型时必有值
  itemType: null // 药品类型时为空
}

// ✅ 医疗项目类型的缴费项目（类型守卫）
export interface MedicalChargeItem extends ChargeItem {
  type: 'ITEM'
  drugCategoryId: null // 医疗项目类型时为空
  itemType: 'EXAM' | 'LAB' | 'DISPOSAL' // 医疗项目类型时必有值
}

// ✅ 项目类型常量对象
export const ChargeItemType = {
  DRUG: 'DRUG',
  ITEM: 'ITEM'
} as const

export type ChargeItemType =
  (typeof ChargeItemType)[keyof typeof ChargeItemType]

// ✅ 医疗项目类型常量对象
export const MedicalItemType = {
  EXAM: 'EXAM',
  LAB: 'LAB',
  DISPOSAL: 'DISPOSAL'
} as const

export type MedicalItemType =
  (typeof MedicalItemType)[keyof typeof MedicalItemType]

// ✅ 缴费状态常量对象
export const ChargeStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
} as const

export type ChargeStatus = (typeof ChargeStatus)[keyof typeof ChargeStatus]

// ✅ 排序字段常量对象
export const ChargeSortField = {
  TOTAL_AMOUNT: 'totalAmount',
  CREATE_TIME: 'createTime'
} as const

export type ChargeSortField =
  (typeof ChargeSortField)[keyof typeof ChargeSortField]

// ✅ 排序方向常量对象
export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc'
} as const

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]

// ✅ 支付方式类型
export interface PaymentMethod {
  paymentMethodId: number // 支付方式ID
  paymentMethodName: string // 支付方式名称
  description: string // 描述
}

// ✅ 结算类型
export interface SettlementType {
  settlementTypeId: number // 结算类型ID
  settlementTypeName: string // 结算类型名称
  description: string // 描述
}

// ✅ 缴费统计信息类型
export interface ChargeStatistics {
  totalItems: number // 总项目数
  totalAmount: number // 总金额
  drugCount: number // 药品数量
  drugAmount: number // 药品金额
  medicalCount: number // 医疗项目数量
  medicalAmount: number // 医疗项目金额
  examCount: number // 检查项目数量
  labCount: number // 检验项目数量
  disposalCount: number // 处置项目数量
}

// ✅ 类型守卫函数
export function isDrugChargeItem(item: ChargeItem): item is DrugChargeItem {
  return (
    item.type === 'DRUG' &&
    item.drugCategoryId !== null &&
    item.itemType === null
  )
}

export function isMedicalChargeItem(
  item: ChargeItem
): item is MedicalChargeItem {
  return (
    item.type === 'ITEM' &&
    item.drugCategoryId === null &&
    item.itemType !== null
  )
}

// ✅ 项目类型显示映射
export const ChargeItemTypeMap: Record<ChargeItemType, string> = {
  [ChargeItemType.DRUG]: '药品',
  [ChargeItemType.ITEM]: '医疗项目'
}

// ✅ 医疗项目类型显示映射
export const MedicalItemTypeMap: Record<MedicalItemType, string> = {
  [MedicalItemType.EXAM]: '检查',
  [MedicalItemType.LAB]: '检验',
  [MedicalItemType.DISPOSAL]: '处置'
}

// ✅ 缴费状态显示映射
export const ChargeStatusMap: Record<ChargeStatus, string> = {
  [ChargeStatus.PENDING_PAYMENT]: '待缴费',
  [ChargeStatus.PAID]: '已缴费',
  [ChargeStatus.CANCELLED]: '已取消',
  [ChargeStatus.REFUNDED]: '已退费'
}

// ✅ 排序字段显示映射
export const ChargeSortFieldMap: Record<ChargeSortField, string> = {
  [ChargeSortField.TOTAL_AMOUNT]: '金额',
  [ChargeSortField.CREATE_TIME]: '创建时间'
}

// ✅ 缴费搜索表单类型（用于前端表单绑定）
export interface ChargeSearchForm {
  type?: ChargeItemType // 项目类型
  keyword?: string // 关键词搜索
  itemType?: MedicalItemType // 医疗项目类型
  drugCategory?: number // 药品类别ID
  sortBy?: ChargeSortField // 排序字段
  order?: SortOrder // 排序方向
}

// ✅ 批量缴费表单类型（用于前端UI）
export interface BatchChargeForm {
  selectedItems: ChargeItem[] // 选中的缴费项目
  paymentMethodId?: number // 支付方式ID
  settlementTypeId?: number // 结算类型ID
  totalAmount: number // 总金额
}

// ✅ 缴费项目转换函数类型
export type ChargeItemConverter = (item: ChargeItem) => ChargeSettleItem

// ✅ 默认查询参数
export const DEFAULT_CHARGE_PARAMS: Required<
  Omit<ChargeQueryParams, 'type' | 'keyword' | 'itemType' | 'drugCategory'>
> = {
  page: 1,
  pageSize: 10,
  sortBy: 'createTime',
  order: 'desc'
}

// ✅ 格式化金额的辅助函数类型
export type AmountFormatter = (amount: number) => string

// ✅ 日期格式化辅助函数类型
export type DateFormatter = (date: string) => string

// ✅ 表格列配置类型（用于 Element Plus Table）
export interface ChargeTableColumn {
  prop: keyof ChargeItem
  label: string
  width?: number
  minWidth?: number
  sortable?: boolean
  formatter?: (row: ChargeItem, column: any, cellValue: any) => string
}

// ✅ 工具函数：将ChargeItem转换为ChargeSettleItem
export function convertToSettleItem(item: ChargeItem): ChargeSettleItem {
  return {
    type: item.type,
    applyId: item.applyId,
    registrationId: item.registrationId,
    itemId: item.itemId,
    patientId: item.patientId,
    quantity: item.quantity,
    price: item.price,
    totalAmount: item.totalAmount,
    status: 'PENDING_PAYMENT' // 默认状态
  }
}

// ✅ 工具函数：批量转换
export function convertToBatchSettleItems(
  items: ChargeItem[]
): ChargeSettleItem[] {
  return items.map(convertToSettleItem)
}

// ✅ 工具函数：计算总金额
export function calculateTotalAmount(items: ChargeSettleItem[]): number {
  return items.reduce((total, item) => total + item.totalAmount, 0)
}

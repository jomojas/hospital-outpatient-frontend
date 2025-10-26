import type { ChargePaginationMeta as PaginationMeta } from './Charge'

// ✅ 可退费项目类型
export interface RefundableItem {
  /** 类型（ITEM-医疗项目, DRUG-药品） */
  type: 'ITEM' | 'DRUG'
  /** 申请/处方ID */
  applyId: number
  /** 患者ID */
  patientId: number
  /** 患者姓名 */
  patientName: string
  /** 挂号ID */
  registrationId: number
  /** 项目/药品ID */
  itemId: number
  /** 项目/药品代码 */
  itemCode: string
  /** 项目/药品名称 */
  itemName: string
  /** 项目类型(EXAM/LAB/DISPOSAL)或药品类别 */
  itemType?: 'EXAM' | 'LAB' | 'DISPOSAL' | string
  /** 药品类别ID（仅药品时有） */
  drugCategoryId?: number
  /** 价格 */
  price: number
  /** 数量 */
  quantity: number
  /** 总价 */
  totalAmount: number
  /** 描述 */
  description?: string
  /** 缴费时间 */
  chargeTime: string
}

// ✅ 退费项目精简DTO（用于提交退费）
export interface RefundSettleItem {
  /** 类型（ITEM-医疗项目, DRUG-药品） */
  type: 'ITEM' | 'DRUG'
  /** 申请/处方ID */
  applyId: number
  /** 挂号ID */
  registrationId: number
  /** 项目/药品ID */
  itemId: number
  /** 患者ID */
  patientId: number
  /** 数量 */
  quantity: number
  /** 单价 */
  price: number
  /** 总金额 */
  totalAmount: number
  /** 状态 */
  status: string
}

// ✅ 查询可退费项目的参数
export interface RefundableItemsQueryParams {
  /** 类型（ITEM-医疗项目, DRUG-药品） */
  type?: 'ITEM' | 'DRUG'
  /** 关键字（患者名/项目名/药品名） */
  keyword?: string
  /** 项目类型(EXAM/LAB/DISPOSAL) */
  itemType?: 'EXAM' | 'LAB' | 'DISPOSAL'
  /** 药品类别ID */
  drugCategory?: number
  /** 排序字段(totalAmount/chargeTime) */
  sortBy?: 'totalAmount' | 'chargeTime'
  /** 排序方式(asc/desc) */
  order?: 'asc' | 'desc'
  /** 页码，从1开始，默认值：1 */
  page?: number
  /** 每页数量，默认值：10 */
  pageSize?: number
}

// ✅ 可退费项目列表响应
export interface RefundableItemsResponse {
  data: RefundableItem[]
  meta: PaginationMeta
}

// ✅ 批量退费请求体
export interface BatchRefundRequest {
  /** 选中的退费项目列表 */
  selectedItems: RefundSettleItem[]
  /** 退费总金额 */
  totalAmount: number
}

// ✅ 退费统计信息
export interface RefundStatistics {
  /** 总项目数 */
  totalItems: number
  /** 总金额 */
  totalAmount: number
  /** 药品项目数量 */
  drugCount: number
  /** 药品总金额 */
  drugAmount: number
  /** 医疗项目数量 */
  medicalCount: number
  /** 医疗项目总金额 */
  medicalAmount: number
}

// ✅ 退费模块的默认查询参数
export const DEFAULT_REFUND_PARAMS: Required<
  Omit<
    RefundableItemsQueryParams,
    'type' | 'keyword' | 'itemType' | 'drugCategory'
  >
> = {
  page: 1,
  pageSize: 10,
  sortBy: 'chargeTime',
  order: 'desc'
}

// ✅ 类型导出
export type {
  RefundableItem as RefundItem,
  RefundableItemsQueryParams as RefundQueryParams,
  RefundableItemsResponse as RefundListResponse
}

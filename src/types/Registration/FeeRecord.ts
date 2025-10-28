import type { PaginationMeta } from '@/types/Registration/Refund'

// ✅ 费用交易记录
export interface FeeTransaction {
  /** 交易ID */
  transactionId: number
  /** 患者姓名 */
  patientName: string
  /** 挂号ID */
  registrationId: number
  /** 交易类型（PAID-已支付，REFUND-已退费） */
  status: 'PAID' | 'REFUND'
  /** 交易金额 */
  amount: number
  /** 交易时间 */
  transactionTime: string
  /** 交易说明 */
  remark?: string
}

// ✅ 费用查询参数
export interface FeeTransactionQueryParams {
  /** 患者姓名，模糊查询 */
  name?: string
  /** 交易状态，PAID=已支付，REFUND=已退费 */
  status?: 'PAID' | 'REFUND'
  /** 起始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
  /** 排序字段(name, transactionTime) */
  sortBy?: 'name' | 'transactionTime'
  /** 排序方式(asc, desc) */
  order?: 'asc' | 'desc'
  /** 页码，从1开始，默认值：1 */
  page?: number
  /** 每页数量，默认值：10 */
  pageSize?: number
}

// ✅ 费用交易列表响应
export interface FeeTransactionResponse {
  data: FeeTransaction[]
  meta: PaginationMeta
}

// ✅ 费用统计信息
export interface FeeTransactionStatistics {
  /** 总交易数 */
  totalTransactions: number
  /** 支付交易数 */
  paidCount: number
  /** 支付总金额 */
  paidAmount: number
  /** 退费交易数 */
  refundCount: number
  /** 退费总金额 */
  refundAmount: number
  /** 净收入（支付 - 退费） */
  netAmount: number
}

// ✅ 费用查询表单数据
export interface FeeTransactionFormData {
  /** 患者姓名 */
  name: string
  /** 交易状态 */
  status: 'PAID' | 'REFUND' | undefined
  /** 时间范围 */
  dateRange: [string, string] | null
  /** 起始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
  /** 排序字段 */
  sortBy: 'name' | 'transactionTime'
  /** 排序方向 */
  order: 'asc' | 'desc'
}

// ✅ 费用模块的默认查询参数
export const DEFAULT_FEE_PARAMS: Required<
  Omit<FeeTransactionQueryParams, 'name' | 'status' | 'startTime' | 'endTime'>
> = {
  page: 1,
  pageSize: 10,
  sortBy: 'transactionTime',
  order: 'desc'
}

// ✅ 交易状态常量 - 替代 enum
export const TransactionStatus = {
  /** 已支付 */
  PAID: 'PAID',
  /** 已退费 */
  REFUND: 'REFUND'
} as const

// ✅ 交易状态类型
export type TransactionStatusType =
  (typeof TransactionStatus)[keyof typeof TransactionStatus]

// ✅ 交易状态选项
export const TRANSACTION_STATUS_OPTIONS = [
  { label: '已支付', value: TransactionStatus.PAID, type: 'success' },
  { label: '已退费', value: TransactionStatus.REFUND, type: 'danger' }
] as const

// ✅ 排序字段选项
export const SORT_BY_OPTIONS = [
  { label: '按患者姓名排序', value: 'name' },
  { label: '按交易时间排序', value: 'transactionTime' }
] as const

// ✅ 排序方向选项
export const ORDER_OPTIONS = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' }
] as const

// ✅ 费用交易时间范围选项
export const TIME_RANGE_OPTIONS = [
  {
    label: '今天',
    value: () => {
      const today = new Date()
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      )
      return [start.toISOString().slice(0, 19), end.toISOString().slice(0, 19)]
    }
  },
  {
    label: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
      return [start.toISOString().slice(0, 19), end.toISOString().slice(0, 19)]
    }
  },
  {
    label: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
      return [start.toISOString().slice(0, 19), end.toISOString().slice(0, 19)]
    }
  },
  {
    label: '本月',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return [start.toISOString().slice(0, 19), end.toISOString().slice(0, 19)]
    }
  }
] as const

// ✅ 类型导出别名
export type {
  FeeTransaction as FeeTransactionDTO,
  FeeTransactionQueryParams as FeeQueryParams,
  FeeTransactionResponse as FeeListResponse,
  FeeTransactionFormData as FeeFormData
}

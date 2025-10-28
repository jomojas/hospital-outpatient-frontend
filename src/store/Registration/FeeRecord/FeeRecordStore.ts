import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import { queryFeeTransactions } from '@/api/modules/Registration/FeeRecord'
import type {
  FeeTransaction,
  FeeTransactionQueryParams,
  FeeTransactionStatistics
} from '@/types/Registration/FeeRecord'
import { DEFAULT_FEE_PARAMS } from '@/types/Registration/FeeRecord'
import type { PaginationMeta } from '@/types/Registration/Refund'

export const useFeeRecordStore = defineStore('feeRecord', () => {
  // ✅ 数据状态
  const feeTransactions = ref<FeeTransaction[]>([])

  // ✅ 搜索参数状态
  const searchParams = ref<FeeTransactionQueryParams>({ ...DEFAULT_FEE_PARAMS })

  // ✅ 分页状态
  const paginationMeta = ref<PaginationMeta>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  })

  // ✅ 加载和错误状态
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ✅ 计算属性：是否有数据
  const hasData = computed(() => feeTransactions.value.length > 0)

  // ✅ 计算属性：统计信息
  const statistics = computed<FeeTransactionStatistics>(() => {
    const transactions = feeTransactions.value

    const paidTransactions = transactions.filter((t) => t.status === 'PAID')
    const refundTransactions = transactions.filter((t) => t.status === 'REFUND')

    const paidAmount = paidTransactions.reduce((sum, t) => sum + t.amount, 0)
    const refundAmount = refundTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    )

    return {
      totalTransactions: transactions.length,
      paidCount: paidTransactions.length,
      paidAmount,
      refundCount: refundTransactions.length,
      refundAmount,
      netAmount: paidAmount - refundAmount
    }
  })

  // ✅ 操作函数1：更新搜索参数（简洁版）
  function updateSearchParams(params: Partial<FeeTransactionQueryParams>) {
    // console.log('🔄 开始更新费用查询参数:', params)

    // 过滤掉 undefined 的值
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ) as Partial<FeeTransactionQueryParams>

    // console.log('📋 过滤undefined后的查询参数：', filteredParams)

    // ✅ 获取最终的 pageSize 值
    const finalPageSize =
      filteredParams.pageSize ??
      searchParams.value.pageSize ??
      DEFAULT_FEE_PARAMS.pageSize

    // ✅ 完全替换搜索参数（而不是合并）
    searchParams.value = {
      ...DEFAULT_FEE_PARAMS, // 基础默认参数
      ...filteredParams, // 用户输入的搜索条件
      page: filteredParams.page ?? 1, // 搜索时重置到第一页
      pageSize: finalPageSize // 优先使用传入参数的pageSize
    }

    // console.log('✅ 更新后的费用查询参数:', searchParams.value)
  }

  // ✅ 操作函数2：获取费用交易记录列表
  async function fetchFeeTransactions() {
    if (loading.value) {
      return
    }

    try {
      loading.value = true
      error.value = null

      // console.log('🔍 获取费用交易记录，参数:', searchParams.value)
      const response = await queryFeeTransactions(searchParams.value)

      feeTransactions.value = response.data || []
      paginationMeta.value = response.meta || paginationMeta.value

      // console.log(
      //   '✅ 费用交易记录获取成功:',
      //   feeTransactions.value.length,
      //   '条'
      // )
      // console.log('📊 分页信息:', paginationMeta.value)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取费用记录失败'
      error.value = errorMessage
      feeTransactions.value = []
      console.error('❌ 获取费用交易记录失败:', err)
      ElMessage.error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // ✅ 操作函数3：搜索（接收所有查询参数）
  async function search(params: Partial<FeeTransactionQueryParams> = {}) {
    // console.log('🔍 执行费用记录搜索，参数:', params)
    updateSearchParams(params)
    await fetchFeeTransactions()
  }

  // ✅ 操作函数4：重置
  async function reset() {
    updateSearchParams({})
    await fetchFeeTransactions()
  }

  // ✅ 操作函数5：刷新
  async function refresh() {
    await fetchFeeTransactions()
  }

  // ✅ 操作函数6：切换页面
  async function changePage(page: number, pageSize?: number) {
    // console.log('📖 切换费用记录页面:', { page, pageSize })

    const newParams: Partial<FeeTransactionQueryParams> = { page }
    if (pageSize) {
      newParams.pageSize = pageSize
    }

    updateSearchParams({ ...searchParams.value, ...newParams })
    await fetchFeeTransactions()
  }

  // ✅ 操作函数7：清除错误状态
  function clearError() {
    error.value = null
  }

  // ✅ 辅助函数：获取交易状态文本
  function getTransactionStatusText(status: 'PAID' | 'REFUND'): string {
    return status === 'PAID' ? '已支付' : '已退费'
  }

  // ✅ 辅助函数：获取交易状态类型
  function getTransactionStatusType(
    status: 'PAID' | 'REFUND'
  ): 'success' | 'danger' {
    return status === 'PAID' ? 'success' : 'danger'
  }

  // ✅ 辅助函数：格式化金额显示
  function formatAmount(amount: number): string {
    return `¥${amount.toFixed(2)}`
  }

  return {
    // ✅ 状态数据（只读）
    feeTransactions: readonly(feeTransactions),
    searchParams: readonly(searchParams),
    paginationMeta: readonly(paginationMeta),
    loading: readonly(loading),
    error: readonly(error),

    // ✅ 计算属性（只读）
    hasData,
    statistics,

    // ✅ 核心操作方法
    fetchFeeTransactions,
    search, // 🎯 主要的搜索方法，接收所有参数
    reset,
    refresh,
    changePage,
    clearError,

    // ✅ 辅助方法
    getTransactionStatusText,
    getTransactionStatusType,
    formatAmount
  }
})

export type FeeRecordStore = ReturnType<typeof useFeeRecordStore>

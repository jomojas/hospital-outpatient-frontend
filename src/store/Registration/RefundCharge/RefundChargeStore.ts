import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import {
  listRefundableItems,
  refund
} from '@/api/modules/Registration/RefundCharge'
import type {
  RefundableItem,
  RefundableItemsQueryParams,
  RefundSettleItem,
  RefundStatistics
} from '@/types/Registration/RefundCharge'
import { DEFAULT_REFUND_PARAMS } from '@/types/Registration/RefundCharge'
import type { ChargePaginationMeta } from '@/types/Registration/Charge'

export const useRefundChargeStore = defineStore('refundCharge', () => {
  // ✅ 数据状态
  const refundableItems = ref<RefundableItem[]>([])
  const selectedItems = ref<RefundableItem[]>([])

  // ✅ 搜索参数状态
  const searchParams = ref<RefundableItemsQueryParams>({
    ...DEFAULT_REFUND_PARAMS
  })

  // ✅ 分页状态
  const paginationMeta = ref<ChargePaginationMeta>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  })

  // ✅ 加载和错误状态
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ✅ 计算属性：是否有数据
  const hasData = computed(() => refundableItems.value.length > 0)

  // ✅ 计算属性：是否有选中项目
  const hasSelectedItems = computed(() => selectedItems.value.length > 0)

  // ✅ 计算属性：统计信息
  const statistics = computed<RefundStatistics>(() => {
    const items = refundableItems.value

    return {
      totalItems: items.length,
      totalAmount: items.reduce((sum, item) => sum + item.totalAmount, 0),
      drugCount: items.filter((item) => item.type === 'DRUG').length,
      drugAmount: items
        .filter((item) => item.type === 'DRUG')
        .reduce((sum, item) => sum + item.totalAmount, 0),
      medicalCount: items.filter((item) => item.type === 'ITEM').length,
      medicalAmount: items
        .filter((item) => item.type === 'ITEM')
        .reduce((sum, item) => sum + item.totalAmount, 0)
    }
  })

  // ✅ 计算属性：选中项目统计
  const selectedStatistics = computed(() => {
    const items = selectedItems.value

    return {
      totalItems: items.length,
      totalAmount: items.reduce((sum, item) => sum + item.totalAmount, 0),
      drugCount: items.filter((item) => item.type === 'DRUG').length,
      drugAmount: items
        .filter((item) => item.type === 'DRUG')
        .reduce((sum, item) => sum + item.totalAmount, 0),
      medicalCount: items.filter((item) => item.type === 'ITEM').length,
      medicalAmount: items
        .filter((item) => item.type === 'ITEM')
        .reduce((sum, item) => sum + item.totalAmount, 0)
    }
  })

  // ✅ 操作函数1：更新搜索参数
  function updateSearchParams(params: Partial<RefundableItemsQueryParams>) {
    // console.log('🔄 开始更新搜索参数:', params)

    // 过滤掉 undefined 的值
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ) as Partial<RefundableItemsQueryParams>

    // console.log('📋 过滤undefined后的搜索参数：', filteredParams)

    // ✅ 获取最终的 pageSize 值（优先级：传入参数 > 当前状态 > 默认值）
    const finalPageSize =
      filteredParams.pageSize ??
      searchParams.value.pageSize ??
      DEFAULT_REFUND_PARAMS.pageSize

    // ✅ 完全替换搜索参数（而不是合并）
    searchParams.value = {
      ...DEFAULT_REFUND_PARAMS, // 基础默认参数
      ...filteredParams, // 用户输入的搜索条件
      page: filteredParams.page ?? 1, // 搜索时重置到第一页
      pageSize: finalPageSize // 优先使用传入参数的pageSize
    }

    // console.log('✅ 更新后的搜索参数:', searchParams.value)
  }

  // ✅ 操作函数2：获取可退费项目列表
  async function fetchRefundableItems() {
    if (loading.value) {
      return
    }

    try {
      loading.value = true
      error.value = null

      // console.log('🔍 获取可退费项目列表，参数:', searchParams.value)
      const response = await listRefundableItems(searchParams.value)

      refundableItems.value = response.data || []
      paginationMeta.value = response.meta || paginationMeta.value

      // console.log('✅ 可退费项目获取成功:', refundableItems.value.length, '项')
      // console.log('📊 分页信息:', paginationMeta.value)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取可退费项目失败'
      error.value = errorMessage
      refundableItems.value = []
      console.error('❌ 获取可退费项目失败:', err)
      ElMessage.error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // ✅ 操作函数3：搜索
  async function search(params: Partial<RefundableItemsQueryParams> = {}) {
    // console.log('🔍 执行搜索，参数:', params)
    updateSearchParams(params)
    await fetchRefundableItems()
  }

  // ✅ 操作函数4：重置
  async function reset() {
    updateSearchParams({})
    await fetchRefundableItems()
  }

  // ✅ 操作函数5：刷新
  async function refresh() {
    await fetchRefundableItems()
  }

  // ✅ 操作函数6：切换页面
  async function changePage(page: number, pageSize?: number) {
    // console.log('📖 切换页面:', { page, pageSize })

    const newParams: Partial<RefundableItemsQueryParams> = { page }
    if (pageSize) {
      newParams.pageSize = pageSize
    }

    updateSearchParams({ ...searchParams.value, ...newParams })
    await fetchRefundableItems()
  }

  // ✅ 操作函数7：设置选中项目
  function setSelectedItems(items: RefundableItem[]) {
    selectedItems.value = items
    // console.log('✅ 设置选中项目:', selectedItems.value.length, '项')
  }

  // ✅ 操作函数8：清空选中项目
  function clearSelectedItems() {
    selectedItems.value = []
  }

  // ✅ 操作函数9：批量退费
  async function batchRefund(items: RefundableItem[]): Promise<boolean> {
    if (items.length === 0) {
      ElMessage.warning('请选择要退费的项目')
      return false
    }

    try {
      loading.value = true

      // 转换为退费项目格式
      const refundItems: RefundSettleItem[] = items.map((item) => ({
        type: item.type,
        applyId: item.applyId,
        registrationId: item.registrationId,
        itemId: item.itemId,
        patientId: item.patientId,
        quantity: item.quantity,
        price: item.price,
        totalAmount: item.totalAmount,
        status: 'PAID' // 已支付状态才能退费
      }))

      // console.log('💰 提交退费请求，项目数:', refundItems.length)
      // console.log('📋 退费项目详情:', refundItems)

      await refund(refundItems)

      const totalAmount = refundItems.reduce(
        (sum, item) => sum + item.totalAmount,
        0
      )
      ElMessage.success(
        `退费成功！共退费 ${refundItems.length} 项，金额 ¥${totalAmount.toFixed(
          2
        )}`
      )

      loading.value = false

      // 清空选中项目
      clearSelectedItems()

      // 刷新列表
      await refresh()

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '退费操作失败'
      console.error('❌ 退费失败:', err)
      ElMessage.error(errorMessage)
      return false
    } finally {
      loading.value = false
    }
  }

  // ✅ 操作函数10：清除错误状态
  function clearError() {
    error.value = null
  }

  return {
    // ✅ 状态数据（只读）
    refundableItems: readonly(refundableItems),
    selectedItems: readonly(selectedItems),
    searchParams: readonly(searchParams),
    paginationMeta: readonly(paginationMeta),
    loading: readonly(loading),
    error: readonly(error),

    // ✅ 计算属性（只读）
    hasData,
    hasSelectedItems,
    statistics,
    selectedStatistics,

    // ✅ 操作方法
    fetchRefundableItems,
    search,
    reset,
    refresh,
    changePage,
    setSelectedItems,
    clearSelectedItems,
    batchRefund,
    clearError
  }
})

export type RefundChargeStore = ReturnType<typeof useRefundChargeStore>

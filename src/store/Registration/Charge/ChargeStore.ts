import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listChargeItems,
  settleCharges
} from '@/api/modules/Registration/Charge'
import {
  DEFAULT_CHARGE_PARAMS,
  convertToBatchSettleItems,
  calculateTotalAmount
} from '@/types/Registration/Charge'
import type {
  ChargeItem,
  ChargeQueryParams,
  ChargeItemsResponse,
  ChargePaginationMeta,
  ChargeSettleRequest,
  ChargeStatistics,
  BatchChargeForm
} from '@/types/Registration/Charge'

export const useChargeStore = defineStore('charge', () => {
  // ✅ 状态变量
  const chargeItems = ref<ChargeItem[]>([])
  const paginationMeta = ref<ChargePaginationMeta>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  })
  const searchParams = ref<ChargeQueryParams>({ ...DEFAULT_CHARGE_PARAMS })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ✅ 选中的缴费项目（用于批量操作）
  const selectedItems = ref<ChargeItem[]>([])

  // ✅ 计算属性：是否有数据
  const hasData = computed(() => chargeItems.value.length > 0)

  // ✅ 计算属性：是否有选中项目
  const hasSelectedItems = computed(() => selectedItems.value.length > 0)

  // ✅ 计算属性：缴费统计信息
  const statistics = computed((): ChargeStatistics => {
    const items = chargeItems.value

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
        .reduce((sum, item) => sum + item.totalAmount, 0),
      examCount: items.filter((item) => item.itemType === 'EXAM').length,
      labCount: items.filter((item) => item.itemType === 'LAB').length,
      disposalCount: items.filter((item) => item.itemType === 'DISPOSAL').length
    }
  })

  // ✅ 计算属性：选中项目的总金额
  const selectedTotalAmount = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + item.totalAmount, 0)
  })

  // ✅ 操作函数1：更新搜索参数
  function updateSearchParams(params: Partial<ChargeQueryParams>) {
    // 过滤掉 undefined 的值
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    )

    // ✅ 完全替换搜索参数（而不是合并）
    searchParams.value = {
      ...DEFAULT_CHARGE_PARAMS, // 基础默认参数
      ...filteredParams, // 用户输入的搜索条件
      page: 1, // 搜索时重置到第一页
      pageSize: searchParams.value.pageSize || DEFAULT_CHARGE_PARAMS.pageSize // 保持当前页面大小
    }
  }

  // ✅ 操作函数2：重置搜索参数
  function resetSearchParams() {
    searchParams.value = { ...DEFAULT_CHARGE_PARAMS }
  }

  // ✅ 操作函数3：更新分页参数
  function updatePagination(page: number, pageSize?: number) {
    console.log('更新分页参数:', { page, pageSize })

    searchParams.value.page = page
    if (pageSize !== undefined) {
      searchParams.value.pageSize = pageSize
    }
  }

  // ✅ 操作函数4：获取缴费项目列表
  async function fetchChargeItems() {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const response: ChargeItemsResponse = await listChargeItems(
        searchParams.value
      )

      chargeItems.value = response.data
      paginationMeta.value = response.meta
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取缴费项目列表失败'
      error.value = errorMessage

      console.error('❌ 获取缴费项目列表失败:', err)
      ElMessage.error(errorMessage)

      // 清空数据
      chargeItems.value = []
      paginationMeta.value = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
      }
    } finally {
      loading.value = false
    }
  }

  // ✅ 操作函数5：搜索缴费项目
  async function search(params: Partial<ChargeQueryParams>) {
    updateSearchParams(params)
    await fetchChargeItems()
  }

  // ✅ 操作函数6：重置并重新获取数据
  async function reset() {
    resetSearchParams()
    clearSelectedItems()
    await fetchChargeItems()
  }

  // ✅ 操作函数7：分页查询
  async function changePage(page: number, pageSize?: number) {
    updatePagination(page, pageSize)
    await fetchChargeItems()
  }

  // ✅ 操作函数8：设置选中的项目
  function setSelectedItems(items: ChargeItem[]) {
    selectedItems.value = items
  }

  // ✅ 操作函数9：清空选中的项目
  function clearSelectedItems() {
    selectedItems.value = []
  }

  // ✅ 操作函数10：单个缴费
  async function chargeItem(
    item: ChargeItem,
    paymentMethodId: number,
    settlementTypeId: number
  ) {
    // console.log('💳 开始单个缴费:', {
    //   itemName: item.itemName,
    //   amount: item.totalAmount,
    //   paymentMethodId,
    //   settlementTypeId
    // })

    const settleItems = convertToBatchSettleItems([item])

    const request: ChargeSettleRequest = {
      items: settleItems,
      paymentMethodId,
      settlementTypeId
    }

    return await performSettle(request, '单个缴费')
  }

  // ✅ 操作函数11：批量缴费
  async function batchCharge(form: BatchChargeForm) {
    // console.log('💳 开始批量缴费:', {
    //   itemCount: form.selectedItems.length,
    //   totalAmount: form.totalAmount,
    //   paymentMethodId: form.paymentMethodId,
    //   settlementTypeId: form.settlementTypeId
    // })

    if (!form.paymentMethodId || !form.settlementTypeId) {
      ElMessage.error('请选择支付方式和结算类型')
      return false
    }

    const settleItems = convertToBatchSettleItems(form.selectedItems)

    const request: ChargeSettleRequest = {
      items: settleItems,
      paymentMethodId: form.paymentMethodId,
      settlementTypeId: form.settlementTypeId
    }

    const success = await performSettle(request, '批量缴费')

    if (success) {
      clearSelectedItems() // 清空选中项目
    }

    return success
  }

  // ✅ 内部函数：执行缴费操作
  async function performSettle(
    request: ChargeSettleRequest,
    operationType: string
  ): Promise<boolean> {
    // 二次确认
    try {
      const totalAmount = calculateTotalAmount(request.items)
      await ElMessageBox.confirm(
        `确定要${operationType} ${
          request.items.length
        } 个项目，总金额 ¥${totalAmount.toFixed(2)} 吗？`,
        `${operationType}确认`,
        {
          confirmButtonText: '确定缴费',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch {
      console.log('👤 用户取消缴费操作')
      return false
    }

    loading.value = true

    try {
      await settleCharges(request)

      ElMessage.success('缴费成功!')

      // 重新获取数据
      await fetchChargeItems()

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `${operationType}失败`
      console.error('❌ 缴费失败:', err)
      ElMessage.error(errorMessage)
      return false
    } finally {
      loading.value = false
    }
  }

  // ✅ 操作函数12：刷新数据
  async function refresh() {
    await fetchChargeItems()
  }

  // ✅ 操作函数13：清除错误
  function clearError() {
    error.value = null
  }

  return {
    // ✅ 状态数据
    chargeItems: readonly(chargeItems),
    paginationMeta: readonly(paginationMeta),
    searchParams: readonly(searchParams),
    selectedItems: readonly(selectedItems),
    loading: readonly(loading),
    error: readonly(error),

    // ✅ 计算属性
    hasData,
    hasSelectedItems,
    statistics,
    selectedTotalAmount,

    // ✅ 搜索和分页操作
    search,
    reset,
    changePage,
    refresh,

    // ✅ 选择操作
    setSelectedItems,
    clearSelectedItems,

    // ✅ 缴费操作
    chargeItem,
    batchCharge,

    // ✅ 工具方法
    clearError
  }
})

export type ChargeStore = ReturnType<typeof useChargeStore>

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRegistrationRecords,
  cancelRegistration as cancelRegistrationAPI
} from '@/api/modules/Registration/Refund'
import type {
  RegistrationRecord,
  RegistrationQueryParams,
  PaginationMeta,
  RegistrationRecordsResponse,
  SearchFilters,
  PaginationSort
} from '@/types/Registration/Refund'

export const useRefundStore = defineStore('refund', () => {
  // ✅ 变量A：搜索筛选条件
  const searchFilters = ref<SearchFilters>({
    deptId: undefined,
    doctorId: undefined,
    status: undefined,
    keyword: undefined,
    date: undefined
  })

  // ✅ 变量B：分页排序条件（带默认值）
  const paginationSort = ref<PaginationSort>({
    page: 1,
    pageSize: 10,
    order: 'desc',
    sortBy: 'date'
  })

  // ✅ 变量C：挂号记录数组
  const registrationRecords = ref<RegistrationRecord[]>([])

  // ✅ 分页信息
  const paginationMeta = ref<PaginationMeta>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  })

  // ✅ 加载状态
  const loading = ref(false)

  // ✅ 错误信息
  const error = ref<string | null>(null)

  // ✅ 计算属性：合并搜索条件和分页排序（变量D）
  const queryParams = computed<RegistrationQueryParams>(() => {
    // 过滤掉 undefined 和空字符串的值
    const filters = Object.fromEntries(
      Object.entries(searchFilters.value).filter(
        ([_, value]) => value !== undefined && value !== ''
      )
    )

    return {
      ...filters,
      ...paginationSort.value
    }
  })

  // ✅ 计算属性：是否有数据
  const hasData = computed(() => registrationRecords.value.length > 0)

  // ✅ 计算属性：总金额统计
  const totalAmount = computed(() => {
    return registrationRecords.value.reduce(
      (sum, record) => sum + record.payableAmount,
      0
    )
  })

  // ✅ 操作函数1：更新搜索筛选条件（变量A）
  function updateSearchFilters(filters: Partial<SearchFilters>) {
    Object.assign(searchFilters.value, filters)

    // 搜索时重置到第一页
    paginationSort.value.page = 1
  }

  // ✅ 操作函数2：更新分页排序条件（变量B）
  function updatePaginationSort(params: Partial<PaginationSort>) {
    Object.assign(paginationSort.value, params)
  }

  // ✅ 重置搜索条件
  function resetSearchFilters() {
    searchFilters.value = {
      deptId: undefined,
      doctorId: undefined,
      status: undefined,
      keyword: undefined,
      date: undefined
    }

    // 重置分页到第一页
    paginationSort.value.page = 1
  }

  // ✅ 重置分页排序到默认值
  function resetPaginationSort() {
    paginationSort.value = {
      page: 1,
      pageSize: 10,
      order: 'desc',
      sortBy: 'date'
    }
  }

  // ✅ 业务函数1：获取挂号记录数据
  async function fetchRegistrationRecords() {
    loading.value = true
    error.value = null

    try {
      // 使用计算属性获取合并后的查询参数
      const params = queryParams.value

      const response: RegistrationRecordsResponse =
        await getRegistrationRecords(params)

      // 更新数据
      registrationRecords.value = response.data
      paginationMeta.value = response.meta

      return response
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取挂号记录失败'
      error.value = errorMessage

      console.error('❌ 获取挂号记录失败:', err)
      ElMessage.error(errorMessage)

      // 清空数据
      registrationRecords.value = []
      paginationMeta.value = {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ 业务函数2：取消挂号（退号）
  async function cancelRegistration(registrationId: number) {
    // 找到对应的挂号记录
    const record = registrationRecords.value.find(
      (r) => r.registrationId === registrationId
    )

    if (!record) {
      ElMessage.error('未找到对应的挂号记录')
      return false
    }

    // 检查是否可以退号
    if (record.currentStatus !== '待看诊') {
      ElMessage.error('只有待看诊状态的挂号才能退号')
      return false
    }

    try {
      // 确认对话框
      await ElMessageBox.confirm(
        `确定要为患者 ${
          record.patientName
        } 退号吗？\n退号后将返还 ¥${record.payableAmount.toFixed(2)}`,
        '确认退号',
        {
          confirmButtonText: '确定退号',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      )

      loading.value = true

      // ✅ 调用退号 API
      const response = await cancelRegistrationAPI(registrationId)

      ElMessage.success('退号成功')

      // ✅ 重新获取数据以确保数据同步（移除了本地更新）
      await fetchRegistrationRecords()

      return true
    } catch (err) {
      if (err === 'cancel') {
        // 用户取消退号
        return false
      }

      const errorMessage = err instanceof Error ? err.message : '退号失败'
      console.error('❌ 退号失败:', err)
      ElMessage.error(errorMessage)
      return false
    } finally {
      loading.value = false
    }
  }

  // ✅ 搜索功能：更新搜索条件并获取数据
  async function search(filters: Partial<SearchFilters>) {
    updateSearchFilters(filters)
    await fetchRegistrationRecords()
  }

  // ✅ 分页功能：切换页码
  async function changePage(page: number) {
    updatePaginationSort({ page })
    await fetchRegistrationRecords()
  }

  // ✅ 分页功能：切换每页大小
  async function changePageSize(pageSize: number) {
    updatePaginationSort({ page: 1, pageSize })
    await fetchRegistrationRecords()
  }

  // ✅ 排序功能：切换排序
  async function changeSort(
    sortBy: 'date' | 'patientName' | 'doctorName',
    order: 'asc' | 'desc'
  ) {
    updatePaginationSort({ sortBy, order })
    await fetchRegistrationRecords()
  }

  // ✅ 刷新数据
  async function refresh() {
    await fetchRegistrationRecords()
  }

  // ✅ 重置所有条件并重新获取数据
  async function reset() {
    resetSearchFilters()
    resetPaginationSort()
    await fetchRegistrationRecords()
  }

  // ✅ 获取指定挂号记录
  function getRegistrationById(
    registrationId: number
  ): RegistrationRecord | undefined {
    return registrationRecords.value.find(
      (r) => r.registrationId === registrationId
    )
  }

  // ✅ 获取可退号的记录数量
  const refundableCount = computed(() => {
    return registrationRecords.value.filter((r) => r.currentStatus === '待看诊')
      .length
  })

  return {
    // ✅ 状态变量
    searchFilters: readonly(searchFilters),
    paginationSort: readonly(paginationSort),
    registrationRecords: readonly(registrationRecords),
    paginationMeta: readonly(paginationMeta),
    loading: readonly(loading),
    error: readonly(error),

    // ✅ 计算属性
    queryParams,
    hasData,
    totalAmount,
    refundableCount,

    // ✅ 操作函数
    updateSearchFilters,
    updatePaginationSort,
    resetSearchFilters,
    resetPaginationSort,

    // ✅ 业务函数
    fetchRegistrationRecords,
    cancelRegistration,

    // ✅ 便捷函数
    search,
    changePage,
    changePageSize,
    changeSort,
    refresh,
    reset,
    getRegistrationById
  }
})

// ✅ 类型导出
export type RefundStore = ReturnType<typeof useRefundStore>

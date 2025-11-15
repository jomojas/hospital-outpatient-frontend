import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getDoctorRegisteredPatients,
  getPatientDetailByMedicalNo,
  getPatientStatusCount
} from '@/api/modules/Outpatient/PatientView'
import type {
  DoctorPatient,
  PatientQueryParams,
  PatientStatistics,
  PaginationMeta,
  FrontendPatientStatusType,
  PatientDetailInfo,
  PatientStatusCountResponse
} from '@/types/Outpatient/PatientView'
import { DEFAULT_PATIENT_PARAMS } from '@/types/Outpatient/PatientView'
import {
  mapBackendStatusToFrontend,
  getStatusDisplayInfo,
  FrontendPatientStatus
} from '@/types/Outpatient/PatientView'

// ✅ 扩展的患者信息（包含前端状态）
export interface EnhancedDoctorPatient extends DoctorPatient {
  /** 前端状态 */
  frontendStatus: FrontendPatientStatusType
  /** 状态显示信息 */
  statusDisplay: {
    label: string
    type: string
    color: string
  }
}

export const usePatientViewStore = defineStore('patientView', () => {
  // ✅ 数据状态
  const patients = ref<EnhancedDoctorPatient[]>([])

  // ✅ 搜索参数状态
  const searchParams = ref<PatientQueryParams>({ ...DEFAULT_PATIENT_PARAMS })

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

  // ✅ 患者详情相关状态
  const patientDetail = ref<PatientDetailInfo | null>(null)
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)
  const showDetailDialog = ref(false)

  // ✅ 统计数据状态
  const statusCountData = ref<PatientStatusCountResponse | null>(null)
  const statusCountLoading = ref(false)
  const statusCountError = ref<string | null>(null)

  // ✅ 计算属性：是否有数据
  const hasData = computed(() => patients.value.length > 0)

  // ✅ 计算属性：统计信息（优先使用后端统计数据）
  const statistics = computed<PatientStatistics>(() => {
    // 如果有后端统计数据，优先使用
    if (statusCountData.value) {
      const data = statusCountData.value
      return {
        totalPatients:
          data.WAITING_INITIAL +
          data.AFTER_INITIAL +
          data.WAITING_REVISIT +
          data.REVISIT_COMPLETED,
        waitingInitialCount: data.WAITING_INITIAL,
        afterInitialCount: data.AFTER_INITIAL,
        waitingRevisitCount: data.WAITING_REVISIT,
        revisitCompletedCount: data.REVISIT_COMPLETED
      }
    }

    // 降级方案：使用当前页面数据计算（原有逻辑）
    const patientsList = patients.value

    const waitingInitialCount = patientsList.filter(
      (p) => p.frontendStatus === FrontendPatientStatus.WAITING_INITIAL
    ).length

    const afterInitialCount = patientsList.filter(
      (p) => p.frontendStatus === FrontendPatientStatus.AFTER_INITIAL
    ).length

    const waitingRevisitCount = patientsList.filter(
      (p) => p.frontendStatus === FrontendPatientStatus.WAITING_REVISIT
    ).length

    const revisitCompletedCount = patientsList.filter(
      (p) => p.frontendStatus === FrontendPatientStatus.REVISIT_COMPLETED
    ).length

    return {
      totalPatients: patientsList.length,
      waitingInitialCount,
      afterInitialCount,
      waitingRevisitCount,
      revisitCompletedCount
    }
  })

  // ✅ 计算属性：按前端状态分组的患者
  const patientsByStatus = computed(() => {
    const groups = {
      [FrontendPatientStatus.WAITING_INITIAL]: [] as EnhancedDoctorPatient[],
      [FrontendPatientStatus.AFTER_INITIAL]: [] as EnhancedDoctorPatient[],
      [FrontendPatientStatus.WAITING_REVISIT]: [] as EnhancedDoctorPatient[],
      [FrontendPatientStatus.REVISIT_COMPLETED]: [] as EnhancedDoctorPatient[]
    }

    patients.value.forEach((patient) => {
      groups[patient.frontendStatus].push(patient)
    })

    return groups
  })

  // ✅ 操作函数1：更新搜索参数
  function updateSearchParams(params: Partial<PatientQueryParams>) {
    console.log('🔄 开始更新患者查询参数:', params)

    // 过滤掉 undefined 的值
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    ) as Partial<PatientQueryParams>

    console.log('📋 过滤后的查询参数：', filteredParams)

    // ✅ 获取最终的 pageSize 值
    const finalPageSize =
      filteredParams.pageSize ??
      searchParams.value.pageSize ??
      DEFAULT_PATIENT_PARAMS.pageSize

    // ✅ 完全替换搜索参数
    searchParams.value = {
      ...DEFAULT_PATIENT_PARAMS,
      ...filteredParams,
      page: filteredParams.page ?? 1,
      pageSize: finalPageSize
    }

    console.log('✅ 更新后的患者查询参数:', searchParams.value)
  }

  // ✅ 操作函数2：处理原始患者数据（状态转换）
  function enhancePatientData(
    rawPatients: DoctorPatient[]
  ): EnhancedDoctorPatient[] {
    return rawPatients.map((patient) => {
      const frontendStatus = mapBackendStatusToFrontend(patient.status)
      const statusDisplay = getStatusDisplayInfo(patient.status)

      return {
        ...patient,
        frontendStatus,
        statusDisplay: {
          label: statusDisplay.label,
          type: statusDisplay.type,
          color: statusDisplay.color
        }
      }
    })
  }

  // ✅ 操作函数2.1：处理患者详情数据（状态转换）
  function enhancePatientDetailData(
    rawPatientDetail: PatientDetailInfo
  ): PatientDetailInfo & {
    frontendStatus: FrontendPatientStatusType
    statusDisplay: {
      label: string
      type: string
      color: string
    }
  } {
    const frontendStatus = mapBackendStatusToFrontend(rawPatientDetail.status)
    const statusDisplay = getStatusDisplayInfo(rawPatientDetail.status)

    return {
      ...rawPatientDetail,
      frontendStatus,
      statusDisplay: {
        label: statusDisplay.label,
        type: statusDisplay.type,
        color: statusDisplay.color
      }
    }
  }

  // ✅ 操作函数3：获取状态统计数据
  async function fetchStatusCount() {
    if (statusCountLoading.value) {
      console.log('⏳ 正在加载统计数据中，跳过重复请求')
      return
    }

    try {
      statusCountLoading.value = true
      statusCountError.value = null

      console.log('📊 获取患者状态统计数据...')
      const response = await getPatientStatusCount()

      statusCountData.value = response
      console.log('✅ 患者状态统计获取成功:', statusCountData.value)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取统计数据失败'
      statusCountError.value = errorMessage
      statusCountData.value = null
      console.error('❌ 获取患者状态统计失败:', err)

      // 统计数据获取失败不显示错误提示，降级到页面数据计算
      console.warn('⚠️ 统计数据获取失败，将使用当前页面数据计算')
    } finally {
      statusCountLoading.value = false
    }
  }

  // ✅ 操作函数4：获取患者列表
  async function fetchPatients() {
    if (loading.value) {
      console.log('⏳ 正在加载中，跳过重复请求')
      return
    }

    try {
      loading.value = true
      error.value = null

      console.log('🔍 获取患者列表，参数:', searchParams.value)

      // 同时请求患者列表和统计数据
      const [patientsResponse] = await Promise.allSettled([
        getDoctorRegisteredPatients(searchParams.value),
        fetchStatusCount() // 并行获取统计数据
      ])

      // 处理患者列表响应
      if (patientsResponse.status === 'fulfilled') {
        const rawPatients = patientsResponse.value.data || []
        const enhancedPatients = enhancePatientData(rawPatients)

        patients.value = enhancedPatients
        paginationMeta.value =
          patientsResponse.value.meta || paginationMeta.value

        console.log('✅ 患者列表获取成功:', patients.value.length, '条')
        console.log('📊 分页信息:', paginationMeta.value)
        console.log('📈 统计信息:', statistics.value)
      } else {
        throw new Error('获取患者列表失败')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取患者列表失败'
      error.value = errorMessage
      patients.value = []
      console.error('❌ 获取患者列表失败:', err)
      ElMessage.error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // ✅ 操作函数5：搜索（接收所有查询参数）
  async function search(params: Partial<PatientQueryParams> = {}) {
    console.log('🔍 执行患者搜索，参数:', params)
    updateSearchParams(params)
    await fetchPatients()
  }

  // ✅ 操作函数6：按前端状态筛选
  async function searchByFrontendStatus(
    frontendStatus: FrontendPatientStatusType | string
  ) {
    console.log('🎯 按前端状态筛选患者:', frontendStatus)

    if (!frontendStatus || frontendStatus === '') {
      // 清除状态筛选，获取全部数据
      await search({ status: undefined })
      return
    }

    // 直接使用前端状态请求后端接口
    await search({ status: frontendStatus })
  }

  // ✅ 操作函数7：获取患者详情（修正版）
  async function fetchPatientDetail(medicalNo: string) {
    if (detailLoading.value) {
      console.log('⏳ 正在加载患者详情中，跳过重复请求')
      return
    }

    try {
      detailLoading.value = true
      detailError.value = null

      console.log('🔍 获取患者详情，病历号:', medicalNo)
      const response = await getPatientDetailByMedicalNo(medicalNo)

      // ✅ 对患者详情数据进行状态转换处理
      const enhancedPatientDetail = enhancePatientDetailData(response)
      patientDetail.value = enhancedPatientDetail

      console.log('✅ 患者详情获取成功:', patientDetail.value)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取患者详情失败'
      detailError.value = errorMessage
      patientDetail.value = null
      console.error('❌ 获取患者详情失败:', err)
      ElMessage.error(errorMessage)
    } finally {
      detailLoading.value = false
    }
  }

  // ✅ 操作函数8：打开患者详情弹窗
  async function openPatientDetail(medicalNo: string) {
    console.log('👁️ 打开患者详情弹窗，病历号:', medicalNo)

    // 重置状态
    patientDetail.value = null
    detailError.value = null

    // 显示弹窗
    showDetailDialog.value = true

    // 获取详情数据
    await fetchPatientDetail(medicalNo)
  }

  // ✅ 操作函数9：关闭患者详情弹窗
  function closePatientDetail() {
    console.log('❌ 关闭患者详情弹窗')
    showDetailDialog.value = false

    // 可选：延迟清理数据，避免弹窗关闭动画时数据消失
    setTimeout(() => {
      patientDetail.value = null
      detailError.value = null
    }, 300)
  }

  // ✅ 操作函数10：重置
  async function reset() {
    console.log('🔄 重置患者查询')
    updateSearchParams({})
    await fetchPatients()
  }

  // ✅ 操作函数11：刷新
  async function refresh() {
    console.log('🔄 刷新患者列表')
    await fetchPatients()
  }

  // ✅ 操作函数12：独立刷新统计数据
  async function refreshStatusCount() {
    console.log('🔄 刷新患者状态统计数据')
    await fetchStatusCount()
  }

  // ✅ 操作函数13：切换页面
  async function changePage(page: number, pageSize?: number) {
    console.log('📖 切换患者列表页面:', { page, pageSize })

    const newParams: Partial<PatientQueryParams> = { page }
    if (pageSize) {
      newParams.pageSize = pageSize
    }

    updateSearchParams({ ...searchParams.value, ...newParams })
    await fetchPatients()
  }

  // ✅ 操作函数14：清除错误状态
  function clearError() {
    error.value = null
  }

  // ✅ 操作函数15：清除详情错误状态
  function clearDetailError() {
    detailError.value = null
  }

  // ✅ 操作函数16：清除统计数据错误状态
  function clearStatusCountError() {
    statusCountError.value = null
  }

  // ✅ 辅助函数：根据病历号查找患者
  function findPatientByMedicalNo(
    medicalNo: string
  ): EnhancedDoctorPatient | undefined {
    return patients.value.find((patient) => patient.medicalNo === medicalNo)
  }

  // ✅ 辅助函数：获取指定状态的患者数量
  function getPatientCountByStatus(
    frontendStatus: FrontendPatientStatusType
  ): number {
    return patients.value.filter(
      (patient) => patient.frontendStatus === frontendStatus
    ).length
  }

  // ✅ 辅助函数：检查是否有指定状态的患者
  function hasPatientWithStatus(
    frontendStatus: FrontendPatientStatusType
  ): boolean {
    return patients.value.some(
      (patient) => patient.frontendStatus === frontendStatus
    )
  }

  return {
    // ✅ 状态数据（只读）
    patients: readonly(patients),
    searchParams: readonly(searchParams),
    paginationMeta: readonly(paginationMeta),
    loading: readonly(loading),
    error: readonly(error),

    // ✅ 患者详情相关状态（只读）
    patientDetail: readonly(patientDetail),
    detailLoading: readonly(detailLoading),
    detailError: readonly(detailError),
    showDetailDialog: readonly(showDetailDialog),

    // ✅ 统计数据相关状态（只读）
    statusCountData: readonly(statusCountData),
    statusCountLoading: readonly(statusCountLoading),
    statusCountError: readonly(statusCountError),

    // ✅ 计算属性（只读）
    hasData,
    statistics,
    patientsByStatus,

    // ✅ 核心操作方法
    fetchPatients,
    search,
    searchByFrontendStatus,
    reset,
    refresh,
    changePage,
    clearError,

    // ✅ 患者详情相关方法
    fetchPatientDetail,
    openPatientDetail,
    closePatientDetail,
    clearDetailError,

    // ✅ 统计数据相关方法
    fetchStatusCount,
    refreshStatusCount,
    clearStatusCountError,

    // ✅ 辅助方法
    findPatientByMedicalNo,
    getPatientCountByStatus,
    hasPatientWithStatus
  }
})

export type PatientViewStore = ReturnType<typeof usePatientViewStore>

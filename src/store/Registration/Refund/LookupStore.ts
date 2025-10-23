import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import { listDepartments } from '@/api/modules/Registration/Register'
import { listDoctors } from '@/api/modules/Registration/Refund'
import type { Department } from '@/types/Registration/Register'
import type { BasicDoctor } from '@/types/Registration/Refund'

// ✅ 挂号状态类型
interface RegistrationStatus {
  value: string
  label: string
  description?: string
}

export const useRefundLookupStore = defineStore('refundLookup', () => {
  // ✅ 科室列表
  const departments = ref<Department[]>([])
  const loadingDepartments = ref(false)
  const departmentsError = ref<string | null>(null)

  // ✅ 医生列表
  const doctors = ref<BasicDoctor[]>([])
  const loadingDoctors = ref(false)
  const doctorsError = ref<string | null>(null)

  // ✅ 挂号状态列表（固定值）
  const registrationStatuses = ref<RegistrationStatus[]>([
    {
      value: 'WAITING_FOR_CONSULTATION',
      label: '待看诊',
      description: '已挂号但未看诊的状态'
    }
  ])

  // ✅ 是否已初始化
  const initialized = ref(false)

  // ✅ 计算属性：科室选项（用于下拉框）
  const departmentOptions = computed(() => {
    return departments.value.map((dept) => ({
      value: dept.departmentId,
      label: dept.departmentName, // ✅ 修正字段名
      disabled: false
    }))
  })

  // ✅ 计算属性：医生选项（用于下拉框）
  const doctorOptions = computed(() => {
    return doctors.value.map((doctor) => {
      // 根据 departmentId 查找科室名称
      const department = departments.value.find(
        (d) => d.departmentId === doctor.departmentId
      )

      return {
        value: doctor.staffId, // ✅ 使用 staffId 作为值
        label: doctor.name,
        disabled: false,
        departmentId: doctor.departmentId,
        departmentName: department?.departmentName || '未知科室',
        isExpert: doctor.isExpert
      }
    })
  })

  // ✅ 计算属性：状态选项（用于下拉框）
  const statusOptions = computed(() => {
    return registrationStatuses.value.map((status) => ({
      value: status.value,
      label: status.label,
      description: status.description
    }))
  })

  // ✅ 计算属性：是否加载中
  const loading = computed(() => {
    return loadingDepartments.value || loadingDoctors.value
  })

  // ✅ 计算属性：是否有错误
  const hasError = computed(() => {
    return departmentsError.value !== null || doctorsError.value !== null
  })

  // ✅ 获取科室列表
  async function fetchDepartments() {
    if (loadingDepartments.value) return

    loadingDepartments.value = true
    departmentsError.value = null

    try {
      const response = await listDepartments('OUTPATIENT')
      departments.value = response
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '获取科室列表失败'
      departmentsError.value = errorMessage

      console.error('❌ 获取科室列表失败:', error)
      ElMessage.error(errorMessage)

      // 清空数据
      departments.value = []
    } finally {
      loadingDepartments.value = false
    }
  }

  // ✅ 获取医生列表
  async function fetchDoctors() {
    if (loadingDoctors.value) return

    loadingDoctors.value = true
    doctorsError.value = null

    try {
      const response = await listDoctors()
      doctors.value = response
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '获取医生列表失败'
      doctorsError.value = errorMessage

      console.error('❌ 获取医生列表失败:', error)
      ElMessage.error(errorMessage)

      // 清空数据
      doctors.value = []
    } finally {
      loadingDoctors.value = false
    }
  }

  // ✅ 初始化所有数据
  async function initialize() {
    if (initialized.value) {
      return
    }

    try {
      // 并行加载科室和医生数据
      await Promise.all([fetchDepartments(), fetchDoctors()])

      initialized.value = true
    } catch (error) {
      console.error('❌ 退号查询数据初始化失败:', error)
      ElMessage.error('初始化查询数据失败，请刷新页面重试')
    }
  }

  // ✅ 重新加载所有数据
  async function refresh() {
    initialized.value = false
    await initialize()
  }

  // ✅ 根据科室ID获取科室信息
  function getDepartmentById(departmentId: number): Department | undefined {
    return departments.value.find((dept) => dept.departmentId === departmentId)
  }

  // ✅ 根据医生ID获取医生信息（使用 staffId）
  function getDoctorById(staffId: number): BasicDoctor | undefined {
    return doctors.value.find((doctor) => doctor.staffId === staffId)
  }

  // ✅ 根据科室ID获取该科室的医生列表
  function getDoctorsByDepartment(departmentId: number): BasicDoctor[] {
    return doctors.value.filter(
      (doctor) => doctor.departmentId === departmentId
    )
  }

  // ✅ 获取专家医生列表
  function getExpertDoctors(): BasicDoctor[] {
    return doctors.value.filter((doctor) => doctor.isExpert)
  }

  // ✅ 获取普通医生列表
  function getRegularDoctors(): BasicDoctor[] {
    return doctors.value.filter((doctor) => !doctor.isExpert)
  }

  // ✅ 根据状态值获取状态信息
  function getStatusByValue(value: string): RegistrationStatus | undefined {
    return registrationStatuses.value.find((status) => status.value === value)
  }

  // ✅ 清除错误信息
  function clearErrors() {
    departmentsError.value = null
    doctorsError.value = null
  }

  // ✅ 重置所有数据
  function reset() {
    departments.value = []
    doctors.value = []
    loadingDepartments.value = false
    loadingDoctors.value = false
    departmentsError.value = null
    doctorsError.value = null
    initialized.value = false
  }

  return {
    // ✅ 原始数据
    departments: readonly(departments),
    doctors: readonly(doctors),
    registrationStatuses: readonly(registrationStatuses),

    // ✅ 加载状态
    loadingDepartments: readonly(loadingDepartments),
    loadingDoctors: readonly(loadingDoctors),
    loading,

    // ✅ 错误状态
    departmentsError: readonly(departmentsError),
    doctorsError: readonly(doctorsError),
    hasError,

    // ✅ 初始化状态
    initialized: readonly(initialized),

    // ✅ 计算属性（用于下拉框）
    departmentOptions,
    doctorOptions,
    statusOptions,

    // ✅ 数据获取方法
    fetchDepartments,
    fetchDoctors,
    initialize,
    refresh,

    // ✅ 查询方法
    getDepartmentById,
    getDoctorById,
    getDoctorsByDepartment,
    getExpertDoctors,
    getRegularDoctors,
    getStatusByValue,

    // ✅ 工具方法
    clearErrors,
    reset
  }
})

// ✅ 类型导出
export type RefundLookupStore = ReturnType<typeof useRefundLookupStore>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Department,
  Doctor,
  SettlementCategory,
  PaymentMethod,
  NumberType
} from '@/types/Registration/Register'
import {
  listDepartments,
  listDoctorsByDepartment,
  listSettlementCategories,
  listPaymentMethods,
  listNumberTypes
} from '@/api/modules/Registration/Register'

export const useLookupStore = defineStore('lookup', () => {
  // ========== 基础数据状态 ==========
  const departments = ref<Department[]>([])
  const doctors = ref<Doctor[]>([])
  const settlementCategories = ref<SettlementCategory[]>([])
  const paymentMethods = ref<PaymentMethod[]>([])
  const numberTypes = ref<NumberType[]>([])

  // ========== 加载状态 ==========
  const loadingDepartments = ref(false)
  const loadingDoctors = ref(false)
  const loadingSettlementCategories = ref(false)
  const loadingPaymentMethods = ref(false)
  const loadingNumberTypes = ref(false)

  // ========== 午别数据（通常是固定的） ==========
  const noonSessions = ref([
    { code: 'MORNING', label: '上午' },
    { code: 'AFTERNOON', label: '下午' }
  ])

  // ========== 核心计算属性：构建 Cascader 数据结构 ==========
  const departmentDoctorOptions = computed(() => {
    return departments.value.map((dept) => ({
      // 🎯 第一层：科室信息
      id: dept.departmentId,
      name: dept.departmentName,
      type: dept.type,
      typeName: dept.typeName,
      // 🎯 第二层：该科室下的所有医生
      doctors: doctors.value
        .filter((doctor) => doctor.departmentId === dept.departmentId)
        .map((doctor) => ({
          id: doctor.staffId,
          name: doctor.name,
          phone: doctor.phone,
          idCard: doctor.idCard,
          departmentId: doctor.departmentId,
          description: doctor.description,
          roleId: doctor.roleId,
          createTime: doctor.createTime,
          isExpert: doctor.isExpert,
          initQuota: doctor.initQuota,
          usedQuota: doctor.usedQuota,
          // 🎯 计算剩余号源
          remainingQuota: Math.max(0, doctor.initQuota - doctor.usedQuota)
        }))
    }))
  })

  // ========== 辅助计算属性 ==========

  // // 根据医生ID获取医生详细信息
  const getDoctorById = computed(() => {
    return (doctorId: number) => {
      return doctors.value.find((doctor) => doctor.staffId === doctorId)
    }
  })

  // // 根据医生专家状态获取可用号别
  const getAvailableNumberTypes = computed(() => {
    return (isExpert: boolean) => {
      if (isExpert) {
        // 专家医生可以挂专家号或者普通号
        return numberTypes.value.filter(
          (type) =>
            type.numberType === 'SPECIALIST' || type.numberType === 'GENERAL'
        )
      } else {
        // 普通医生只能挂选择普通号
        return numberTypes.value.filter((type) => type.numberType === 'GENERAL')
      }
    }
  })

  // 根据号别代码获取费用
  const getNumberTypeFee = computed(() => {
    return (numberTypeCode: string) => {
      const numberType = numberTypes.value.find(
        (type) => type.numberType === numberTypeCode
      )
      return numberType?.fee || 0
    }
  })

  // ========== 数据获取函数 ==========

  // 获取门诊科室列表
  async function fetchOutpatientDepartments() {
    if (loadingDepartments.value) return departments.value

    try {
      loadingDepartments.value = true
      // 🎯 专门获取门诊科室
      const data = await listDepartments('OUTPATIENT')
      departments.value = data
      // console.log('Lookup所有门诊科室：', departments.value)
      return data
    } catch (error) {
      console.error('获取门诊科室列表失败:', error)
      throw error
    } finally {
      loadingDepartments.value = false
    }
  }

  // 获取所有门诊科室的医生
  async function fetchAllOutpatientDoctors() {
    if (loadingDoctors.value) return doctors.value

    try {
      loadingDoctors.value = true

      // 🎯 确保科室数据已加载
      const deptList =
        departments.value.length > 0
          ? departments.value
          : await fetchOutpatientDepartments()

      // 🎯 并行获取所有科室的医生
      const doctorPromises = deptList.map((dept) => {
        return listDoctorsByDepartment(dept.departmentId)
      })

      const doctorArrays = await Promise.all(doctorPromises)

      // 🎯 合并所有医生数据
      doctors.value = doctorArrays.flat()

      return doctors.value
    } catch (error) {
      console.error('❌ 获取医生列表失败:', error)
      throw error
    } finally {
      loadingDoctors.value = false
    }
  }

  // 获取指定科室的医生（用于刷新特定科室数据）
  async function fetchDoctorsByDepartment(departmentId: number) {
    try {
      const departmentDoctors = await listDoctorsByDepartment(departmentId)

      // 🎯 更新该科室的医生数据
      doctors.value = doctors.value.filter(
        (d) => d.departmentId !== departmentId
      )
      doctors.value.push(...departmentDoctors)

      return departmentDoctors
    } catch (error) {
      console.error(`获取科室 ${departmentId} 医生失败:`, error)
      throw error
    }
  }

  // 获取结算类型
  async function fetchSettlementCategories() {
    if (loadingSettlementCategories.value) return settlementCategories.value

    try {
      loadingSettlementCategories.value = true
      const data = await listSettlementCategories()
      settlementCategories.value = data
      return data
    } catch (error) {
      console.error('获取结算类型失败:', error)
      throw error
    } finally {
      loadingSettlementCategories.value = false
    }
  }

  // 获取支付方式
  async function fetchPaymentMethods() {
    if (loadingPaymentMethods.value) return paymentMethods.value

    try {
      loadingPaymentMethods.value = true
      const data = await listPaymentMethods()
      paymentMethods.value = data
      return data
    } catch (error) {
      console.error('获取支付方式失败:', error)
      throw error
    } finally {
      loadingPaymentMethods.value = false
    }
  }

  // 获取号别
  async function fetchNumberTypes() {
    if (loadingNumberTypes.value) return numberTypes.value

    try {
      loadingNumberTypes.value = true
      const data = await listNumberTypes()
      numberTypes.value = data
      return data
    } catch (error) {
      console.error('获取号别失败:', error)
      throw error
    } finally {
      loadingNumberTypes.value = false
    }
  }

  // 🎯 初始化所有挂号相关的基础数据
  async function initializeRegistrationData() {
    try {
      // 🎯 并行加载不依赖的数据
      const independentData = Promise.all([
        fetchSettlementCategories(),
        fetchPaymentMethods(),
        fetchNumberTypes()
      ])

      // 🎯 先加载科室，再加载医生（有依赖关系）
      await fetchOutpatientDepartments()
      await fetchAllOutpatientDoctors()

      // 等待其他独立数据加载完成
      await independentData

      // console.log('挂号基础数据初始化完成')
    } catch (error) {
      console.error('初始化挂号基础数据失败:', error)
      throw error
    }
  }

  // 🎯 刷新特定医生的号源信息
  async function refreshDoctorQuota(doctorId: number) {
    try {
      const doctor = doctors.value.find((d) => d.staffId === doctorId)
      if (doctor) {
        // 重新获取该科室的医生信息
        await fetchDoctorsByDepartment(doctor.departmentId)
      }
    } catch (error) {
      console.error('刷新医生号源失败:', error)
      throw error
    }
  }

  // 🎯 重置所有数据
  function resetAllData() {
    departments.value = []
    doctors.value = []
    settlementCategories.value = []
    paymentMethods.value = []
    numberTypes.value = []
  }

  return {
    // 基础数据
    departments,
    doctors,
    settlementCategories,
    paymentMethods,
    numberTypes,
    noonSessions,

    // 加载状态
    loadingDepartments,
    loadingDoctors,
    loadingSettlementCategories,
    loadingPaymentMethods,
    loadingNumberTypes,

    // 核心计算属性
    departmentDoctorOptions,
    getDoctorById,
    getAvailableNumberTypes,
    getNumberTypeFee,

    // 数据操作函数
    fetchOutpatientDepartments,
    fetchAllOutpatientDoctors,
    fetchDoctorsByDepartment,
    fetchSettlementCategories,
    fetchPaymentMethods,
    fetchNumberTypes,
    initializeRegistrationData,
    refreshDoctorQuota,
    resetAllData
  }
})

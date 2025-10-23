import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import type { DrugCategory, ProjectType } from '@/types/Registration/Charge'

import type {
  SettlementCategory,
  PaymentMethod
} from '@/types/Registration/Register'

// ✅ 从不同的 API 模块导入接口
import {
  listDrugCategories,
  listProjectTypes
} from '@/api/modules/Registration/Charge'

import {
  listPaymentMethods,
  listSettlementCategories
} from '@/api/modules/Registration/Register'

export const useChargeLookupStore = defineStore('chargeLookup', () => {
  // ✅ 药品分类数据
  const drugCategories = ref<DrugCategory[]>([])
  const loadingDrugCategories = ref(false)
  const drugCategoriesError = ref<string | null>(null)

  // ✅ 项目类型数据
  const projectTypes = ref<ProjectType[]>([])
  const loadingProjectTypes = ref(false)
  const projectTypesError = ref<string | null>(null)

  // ✅ 支付方式数据
  const paymentMethods = ref<PaymentMethod[]>([])
  const loadingPaymentMethods = ref(false)
  const paymentMethodsError = ref<string | null>(null)

  // ✅ 结算类型数据
  const settlementCategories = ref<SettlementCategory[]>([])
  const loadingSettlementCategories = ref(false)
  const settlementCategoriesError = ref<string | null>(null)

  // ✅ 初始化状态
  const initialized = ref(false)

  // ✅ 计算属性：药品分类选项（用于下拉框）
  const drugCategoryOptions = computed(() => {
    return drugCategories.value.map((category) => ({
      value: category.categoryId,
      label: category.categoryName,
      description: category.description
    }))
  })

  // ✅ 计算属性：项目类型选项（用于下拉框）
  const projectTypeOptions = computed(() => {
    return projectTypes.value.map((type) => ({
      value: type.code,
      label: type.name
    }))
  })

  // ✅ 计算属性：支付方式选项（用于下拉框）
  const paymentMethodOptions = computed(() => {
    return paymentMethods.value.map((method) => ({
      value: method.paymentMethodId,
      label: method.name,
      description: method.description
    }))
  })

  // ✅ 计算属性：结算类型选项（用于下拉框）
  const settlementCategoryOptions = computed(() => {
    return settlementCategories.value.map((category) => ({
      value: category.settlementTypeId,
      label: category.name,
      description: category.description
    }))
  })

  // ✅ 计算属性：是否加载中
  const loading = computed(() => {
    return (
      loadingDrugCategories.value ||
      loadingProjectTypes.value ||
      loadingPaymentMethods.value ||
      loadingSettlementCategories.value
    )
  })

  // ✅ 计算属性：是否有错误
  const hasError = computed(() => {
    return (
      drugCategoriesError.value !== null ||
      projectTypesError.value !== null ||
      paymentMethodsError.value !== null ||
      settlementCategoriesError.value !== null
    )
  })

  // ✅ 获取药品分类列表
  async function fetchDrugCategories() {
    if (loadingDrugCategories.value) return

    loadingDrugCategories.value = true
    drugCategoriesError.value = null

    try {
      const response = await listDrugCategories()
      drugCategories.value = response
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '获取药品分类列表失败'
      drugCategoriesError.value = errorMessage

      console.error('❌ 获取药品分类列表失败:', error)
      ElMessage.error(errorMessage)

      drugCategories.value = []
    } finally {
      loadingDrugCategories.value = false
    }
  }

  // ✅ 获取项目类型列表
  async function fetchProjectTypes() {
    if (loadingProjectTypes.value) return

    loadingProjectTypes.value = true
    projectTypesError.value = null

    try {
      const response = await listProjectTypes()
      projectTypes.value = response
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '获取项目类型列表失败'
      projectTypesError.value = errorMessage

      console.error('❌ 获取项目类型列表失败:', error)
      ElMessage.error(errorMessage)

      projectTypes.value = []
    } finally {
      loadingProjectTypes.value = false
    }
  }

  // ✅ 获取支付方式列表
  async function fetchPaymentMethods() {
    if (loadingPaymentMethods.value) return

    loadingPaymentMethods.value = true
    paymentMethodsError.value = null

    try {
      const response = await listPaymentMethods()
      paymentMethods.value = response
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '获取支付方式列表失败'
      paymentMethodsError.value = errorMessage

      console.error('❌ 获取支付方式列表失败:', error)
      ElMessage.error(errorMessage)

      paymentMethods.value = []
    } finally {
      loadingPaymentMethods.value = false
    }
  }

  // ✅ 获取结算类型列表
  async function fetchSettlementCategories() {
    if (loadingSettlementCategories.value) return

    loadingSettlementCategories.value = true
    settlementCategoriesError.value = null

    try {
      const response = await listSettlementCategories()
      settlementCategories.value = response
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '获取结算类型列表失败'
      settlementCategoriesError.value = errorMessage

      console.error('❌ 获取结算类型列表失败:', error)
      ElMessage.error(errorMessage)

      settlementCategories.value = []
    } finally {
      loadingSettlementCategories.value = false
    }
  }

  // ✅ 初始化所有数据
  async function initialize() {
    if (initialized.value) {
      return
    }

    try {
      // 并行加载所有下拉框数据
      await Promise.all([
        fetchDrugCategories(),
        fetchProjectTypes(),
        fetchPaymentMethods(),
        fetchSettlementCategories()
      ])

      initialized.value = true
    } catch (error) {
      console.error('❌ 缴费查询数据初始化失败:', error)
      ElMessage.error('初始化查询数据失败，请刷新页面重试')
    }
  }

  // ✅ 重新加载所有数据
  async function refresh() {
    initialized.value = false
    await initialize()
  }

  // ✅ 根据ID获取对应的数据
  function getDrugCategoryById(categoryId: number): DrugCategory | undefined {
    return drugCategories.value.find(
      (category) => category.categoryId === categoryId
    )
  }

  function getProjectTypeByCode(code: string): ProjectType | undefined {
    return projectTypes.value.find((type) => type.code === code)
  }

  function getPaymentMethodById(methodId: number): PaymentMethod | undefined {
    return paymentMethods.value.find(
      (method) => method.paymentMethodId === methodId
    )
  }

  function getSettlementCategoryById(
    categoryId: number
  ): SettlementCategory | undefined {
    return settlementCategories.value.find(
      (category) => category.settlementTypeId === categoryId
    )
  }

  // ✅ 清除错误信息
  function clearErrors() {
    drugCategoriesError.value = null
    projectTypesError.value = null
    paymentMethodsError.value = null
    settlementCategoriesError.value = null
  }

  // ✅ 重置所有数据
  function reset() {
    drugCategories.value = []
    projectTypes.value = []
    paymentMethods.value = []
    settlementCategories.value = []

    loadingDrugCategories.value = false
    loadingProjectTypes.value = false
    loadingPaymentMethods.value = false
    loadingSettlementCategories.value = false

    clearErrors()
    initialized.value = false
  }

  return {
    // ✅ 原始数据
    drugCategories: readonly(drugCategories),
    projectTypes: readonly(projectTypes),
    paymentMethods: readonly(paymentMethods),
    settlementCategories: readonly(settlementCategories),

    // ✅ 加载状态
    loadingDrugCategories: readonly(loadingDrugCategories),
    loadingProjectTypes: readonly(loadingProjectTypes),
    loadingPaymentMethods: readonly(loadingPaymentMethods),
    loadingSettlementCategories: readonly(loadingSettlementCategories),
    loading,

    // ✅ 错误状态
    drugCategoriesError: readonly(drugCategoriesError),
    projectTypesError: readonly(projectTypesError),
    paymentMethodsError: readonly(paymentMethodsError),
    settlementCategoriesError: readonly(settlementCategoriesError),
    hasError,

    // ✅ 初始化状态
    initialized: readonly(initialized),

    // ✅ 计算属性（用于下拉框）
    drugCategoryOptions,
    projectTypeOptions,
    paymentMethodOptions,
    settlementCategoryOptions,

    // ✅ 数据获取方法
    fetchDrugCategories,
    fetchProjectTypes,
    fetchPaymentMethods,
    fetchSettlementCategories,
    initialize,
    refresh,

    // ✅ 查询方法
    getDrugCategoryById,
    getProjectTypeByCode,
    getPaymentMethodById,
    getSettlementCategoryById,

    // ✅ 工具方法
    clearErrors,
    reset
  }
})

export type ChargeLookupStore = ReturnType<typeof useChargeLookupStore>

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import {
  listDrugCategories,
  listProjectTypes
} from '@/api/modules/Registration/Charge'
import type { DrugCategory, ProjectType } from '@/types/Registration/Charge'

// ✅ 下拉框选项类型
interface SelectOption {
  value: number | string
  label: string
  description?: string
}

export const useRefundChargeLookupStore = defineStore(
  'refundChargeLookup',
  () => {
    // ✅ 状态数据
    const drugCategories = ref<DrugCategory[]>([])
    const projectTypes = ref<ProjectType[]>([])

    // ✅ 加载状态
    const loadingDrugCategories = ref(false)
    const loadingProjectTypes = ref(false)

    // ✅ 错误状态
    const error = ref<string | null>(null)

    // ✅ 计算属性：转换为下拉框选项格式
    const drugCategoryOptions = computed<SelectOption[]>(() => {
      return drugCategories.value.map((category) => ({
        value: category.categoryId,
        label: category.categoryName,
        description: category.description
      }))
    })

    const projectTypeOptions = computed<SelectOption[]>(() => {
      return projectTypes.value.map((type) => ({
        value: type.code,
        label: type.name
      }))
    })

    // ✅ 计算属性：加载状态
    const isLoading = computed(() => {
      return loadingDrugCategories.value || loadingProjectTypes.value
    })

    // ✅ 计算属性：是否已初始化
    const isInitialized = computed(() => {
      return drugCategories.value.length > 0 || projectTypes.value.length > 0
    })

    // ✅ 获取药品分类列表
    async function fetchDrugCategories() {
      if (loadingDrugCategories.value) return

      try {
        loadingDrugCategories.value = true
        error.value = null

        const response = await listDrugCategories()
        drugCategories.value = response || []

        // console.log('✅ 药品分类获取成功:', drugCategories.value.length, '项')
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取药品分类失败'
        error.value = errorMessage
        console.error('❌ 获取药品分类失败:', err)
        throw err
      } finally {
        loadingDrugCategories.value = false
      }
    }

    // ✅ 获取项目类型列表
    async function fetchProjectTypes() {
      if (loadingProjectTypes.value) return

      try {
        loadingProjectTypes.value = true
        error.value = null

        const response = await listProjectTypes()
        projectTypes.value = response || []

        // console.log('✅ 项目类型获取成功:', projectTypes.value.length, '项')
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取项目类型失败'
        error.value = errorMessage
        console.error('❌ 获取项目类型失败:', err)
        throw err
      } finally {
        loadingProjectTypes.value = false
      }
    }

    // ✅ 初始化所有下拉框数据
    async function initialize() {
      try {
        // 并发获取所有下拉框数据
        await Promise.all([fetchDrugCategories(), fetchProjectTypes()])
      } catch (err) {
        console.error('❌ 退费模块下拉框数据初始化失败:', err)
        throw err
      }
    }

    // ✅ 刷新所有数据
    async function refresh() {
      // 清空现有数据
      drugCategories.value = []
      projectTypes.value = []

      // 重新初始化
      await initialize()
    }

    // ✅ 清除错误状态
    function clearError() {
      error.value = null
    }

    // ✅ 根据ID获取药品分类名称
    function getDrugCategoryName(categoryId: number): string {
      const category = drugCategories.value.find(
        (cat) => cat.categoryId === categoryId
      )
      return category?.categoryName || '未知分类'
    }

    // ✅ 根据code获取项目类型名称
    function getProjectTypeName(code: string): string {
      const projectType = projectTypes.value.find((type) => type.code === code)
      return projectType?.name || '未知类型'
    }

    return {
      // ✅ 状态数据（只读）
      drugCategories: readonly(drugCategories),
      projectTypes: readonly(projectTypes),
      error: readonly(error),

      // ✅ 加载状态（只读）
      loadingDrugCategories: readonly(loadingDrugCategories),
      loadingProjectTypes: readonly(loadingProjectTypes),
      isLoading,
      isInitialized,

      // ✅ 下拉框选项（只读）
      drugCategoryOptions,
      projectTypeOptions,

      // ✅ 操作方法
      initialize,
      refresh,
      fetchDrugCategories,
      fetchProjectTypes,
      clearError,
      getDrugCategoryName,
      getProjectTypeName
    }
  }
)

export type RefundChargeLookupStore = ReturnType<
  typeof useRefundChargeLookupStore
>

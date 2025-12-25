import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

// API 策略
import { ExamApi } from '@/api/modules/Exam/ExamStation'
import { LabApi } from '@/api/modules/Lab/LabStation'
import { DisposalApi } from '@/api/modules/Disposal/DisposalStation'

// Types
import {
  type TechApplyItem,
  type TechApplyQueryParams,
  type SubmitResultRequest,
  type TechRecordItem,
  type TechRecordQueryParams
} from '@/types/Tech/TechStation'

export type TechModuleType = 'EXAM' | 'LAB' | 'DISPOSAL'

const API_STRATEGIES = {
  EXAM: ExamApi,
  LAB: LabApi,
  DISPOSAL: DisposalApi
}

export const useTechStore = defineStore('techStore', () => {
  // ============================
  // 0. 上下文与策略
  // ============================
  const currentModule = ref<TechModuleType>('EXAM')
  const currentApi = computed(() => API_STRATEGIES[currentModule.value])
  const storageKey = computed(() => `tech_executing_ids_${currentModule.value}`)

  // ============================
  // 1. State: 录入 (Entry)
  // ============================
  const entryLoading = ref(false)
  const entryList = ref<TechApplyItem[]>([])
  const entryTotal = ref(0)

  const entryParams = reactive<TechApplyQueryParams>({
    page: 1,
    pageSize: 10,
    keyword: ''
  })

  // --- 锁定逻辑 (持久化) ---
  const initExecutingIds = (): Set<number> => {
    const stored = sessionStorage.getItem(storageKey.value)
    if (stored) {
      try {
        return new Set<number>(JSON.parse(stored))
      } catch (e) {
        return new Set()
      }
    }
    return new Set()
  }

  const executingIds = ref<Set<number>>(new Set())

  const saveToStorage = () => {
    sessionStorage.setItem(
      storageKey.value,
      JSON.stringify([...executingIds.value])
    )
  }

  // ============================
  // 2. State: 记录 (Record)
  // ============================
  const recordLoading = ref(false)
  const recordList = ref<TechRecordItem[]>([])
  const recordTotal = ref(0)

  const recordParams = reactive<TechRecordQueryParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    operateType: undefined
  })

  // ============================
  // 3. Actions: 模块切换
  // ============================
  function setModule(type: TechModuleType) {
    if (currentModule.value !== type) {
      currentModule.value = type
      // 清空旧数据
      entryList.value = []
      recordList.value = []
      entryParams.page = 1
      entryParams.keyword = ''
      recordParams.page = 1
      recordParams.keyword = ''

      // 加载对应模块的锁
      executingIds.value = initExecutingIds()
    } else {
      // 刷新页面情况，重新加载锁
      if (executingIds.value.size === 0) {
        executingIds.value = initExecutingIds()
      }
    }
  }

  // ============================
  // 4. Actions: 业务逻辑
  // ============================

  /** 获取列表 */
  async function fetchEntryList() {
    entryLoading.value = true
    try {
      const res = await currentApi.value.getApplies(entryParams)
      entryList.value = res.data
      entryTotal.value = res.meta.total
    } catch (error) {
      console.error(error)
      entryList.value = []
    } finally {
      entryLoading.value = false
    }
  }

  /** 执行 (签到) */
  async function handleExecute(applyId: number) {
    // 1. 加锁
    if (!executingIds.value.has(applyId)) {
      executingIds.value.add(applyId)
      saveToStorage()
    }

    try {
      await currentApi.value.executeItem(applyId)
      ElMessage.success('已开始执行')

      // 2. 刷新列表
      await fetchEntryList()

      // 3. 检查是否还在列表里 (如果变为了 CHECKING/FINISHED 应该从 UNFINISHED 列表消失)
      const stillExists = entryList.value.some(
        (item) => item.applyId === applyId
      )

      if (!stillExists) {
        if (executingIds.value.has(applyId)) {
          executingIds.value.delete(applyId)
          saveToStorage()
        }
      } else {
        // 如果还在，保持锁定
        console.warn('项目仍在列表中，保持锁定')
      }
    } catch (error) {
      ElMessage.error('操作失败')
      // 失败则移除锁
      executingIds.value.delete(applyId)
      saveToStorage()
    }
  }

  /** 提交结果 */
  async function handleSubmitResult(
    applyId: number,
    data: SubmitResultRequest
  ) {
    try {
      await currentApi.value.submitResult(applyId, data)
      ElMessage.success('结果提交成功')

      // 防御性清理锁
      if (executingIds.value.has(applyId)) {
        executingIds.value.delete(applyId)
        saveToStorage()
      }

      await fetchEntryList()
      return true
    } catch (error) {
      ElMessage.error('提交失败')
      return false
    }
  }

  /** 获取记录 */
  async function fetchRecordList() {
    recordLoading.value = true
    try {
      const res = await currentApi.value.getRecords(recordParams)
      recordList.value = res.data
      recordTotal.value = res.meta.total
    } finally {
      recordLoading.value = false
    }
  }

  // Helper
  function resetEntryParams() {
    entryParams.page = 1
    entryParams.keyword = ''
  }

  return {
    currentModule,
    setModule,
    entryLoading,
    entryList,
    entryTotal,
    entryParams,
    executingIds,
    recordLoading,
    recordList,
    recordTotal,
    recordParams,
    fetchEntryList,
    handleExecute,
    handleSubmitResult,
    fetchRecordList,
    resetEntryParams
  }
})

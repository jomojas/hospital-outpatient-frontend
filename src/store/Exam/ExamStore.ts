import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// API
import {
  getExamApplies,
  executeExamItem,
  submitExamResult,
  getExamRecords
} from '@/api/modules/Exam/ExamStation'

// Types
import type {
  ExamApplyItem,
  ExamApplyQueryParams,
  SubmitResultRequest,
  ExamRecordItem,
  ExamRecordQueryParams
} from '@/types/Tech/TechStation'

// 定义 SessionStorage 的 Key
const STORAGE_KEY = 'exam_executing_ids'

export const useExamStore = defineStore('examStore', () => {
  // ============================
  // 1. State: 检查录入 (Entry)
  // ============================
  const entryLoading = ref(false)
  const entryList = ref<ExamApplyItem[]>([])
  const entryTotal = ref(0)

  // 录入页面的查询参数
  const entryParams = reactive<ExamApplyQueryParams>({
    page: 1,
    pageSize: 10,
    keyword: ''
  })

  // ✅ 初始化锁定集合
  const initExecutingIds = (): Set<number> => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return new Set<number>(JSON.parse(stored))
      } catch (e) {
        return new Set<number>()
      }
    }
    return new Set<number>()
  }

  // 正在执行中的 ID 集合
  const executingIds = ref<Set<number>>(initExecutingIds())

  // 辅助函数：保存到 SessionStorage
  const saveToStorage = () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...executingIds.value]))
  }

  // ============================
  // 2. State: 检查记录 (Record)
  // ============================
  const recordLoading = ref(false)
  const recordList = ref<ExamRecordItem[]>([])
  const recordTotal = ref(0)

  const recordParams = reactive<ExamRecordQueryParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    operateType: undefined
  })

  // ============================
  // 3. Actions: 检查录入相关
  // ============================

  /** 获取待办检查列表 */
  async function fetchEntryList() {
    entryLoading.value = true
    try {
      const res = await getExamApplies(entryParams)
      entryList.value = res.data
      entryTotal.value = res.meta.total

      // ❌ 删除之前的自愈逻辑
      // 因为后端只返回 UNFINISHED，所以我们无法通过列表来判断哪些变成 CHECKING 了
      // 锁的清理工作交给 handleExecute 的成功回调来做
    } catch (error) {
      console.error(error)
      entryList.value = []
    } finally {
      entryLoading.value = false
    }
  }

  /** 执行检查 (签到) */
  async function handleExecute(applyId: number) {
    // 1. 立即锁定并持久化 (UI上按钮变灰)
    if (!executingIds.value.has(applyId)) {
      executingIds.value.add(applyId)
      saveToStorage()
    }

    try {
      await executeExamItem(applyId)
      ElMessage.success('已确认开始执行')

      // 2. 刷新列表
      await fetchEntryList()

      // 3. ✅ 修改这里：只有当项目真的从列表中消失了，才移除锁
      // 检查刷新后的列表中是否还包含当前 ID
      const stillExists = entryList.value.some(
        (item) => item.applyId === applyId
      )

      if (!stillExists) {
        // 如果项目消失了，说明状态流转成功，可以安全清理锁
        if (executingIds.value.has(applyId)) {
          executingIds.value.delete(applyId)
          saveToStorage()
        }
      } else {
        // 如果项目还在（可能是后端状态更新延迟），保持锁定状态
        // 这样按钮会一直显示“执行中/请求中”，防止用户再次点击
        console.warn(`项目 ${applyId} 仍在列表中，保持锁定状态`)
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')

      // 4. 只有报错失败时，才强制移除锁定，允许用户重试
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
      await submitExamResult(applyId, data)
      ElMessage.success('结果录入成功，任务已完成')

      // 防御性清理：如果这个 ID 还在锁定集合里，移除它
      if (executingIds.value.has(applyId)) {
        executingIds.value.delete(applyId)
        saveToStorage()
      }

      await fetchEntryList()
      return true
    } catch (error) {
      console.error(error)
      ElMessage.error('提交失败')
      return false
    }
  }

  // ============================
  // 4. Actions: 检查记录相关
  // ============================

  async function fetchRecordList() {
    recordLoading.value = true
    try {
      const res = await getExamRecords(recordParams)
      recordList.value = res.data
      recordTotal.value = res.meta.total
    } catch (error) {
      console.error(error)
    } finally {
      recordLoading.value = false
    }
  }

  // ============================
  // 5. Helper
  // ============================
  function resetEntryParams() {
    entryParams.page = 1
    entryParams.keyword = ''
  }

  return {
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

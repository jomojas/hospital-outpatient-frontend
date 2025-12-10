import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getCaseResults } from '@/api/modules/Outpatient/MedicalTreatment'
import {
  type ExaminationResult,
  ApplyStatus
} from '@/types/Outpatient/MedicalTreatment'

export const useResultStore = defineStore('resultStore', () => {
  // =========================
  // 1. State
  // =========================
  const loading = ref(false)
  const allResults = ref<ExaminationResult[]>([])

  // =========================
  // 2. Getters (核心分拣逻辑)
  // =========================

  // A. 已出结果列表 (状态为 FINISHED)
  const finishedList = computed(() => {
    return allResults.value.filter(
      (item) => item.status === ApplyStatus.FINISHED
    )
  })

  // B. 进行中/待处理/已取消列表 (非 FINISHED 的所有状态)
  const pendingList = computed(() => {
    return allResults.value.filter(
      (item) => item.status !== ApplyStatus.FINISHED
    )
  })

  // C. 顶部统计数据
  const statistics = computed(() => {
    const total = allResults.value.length
    const finished = finishedList.value.length

    // 细分待处理状态
    let checking = 0 // 检查中/待录入
    let unpaid = 0 // 待缴费
    let cancelled = 0 // 已退/已撤

    pendingList.value.forEach((item) => {
      if (item.status === ApplyStatus.UNFINISHED) checking++
      else if (item.status === ApplyStatus.PENDING_PAYMENT) unpaid++
      else if (
        (
          [
            ApplyStatus.CANCELLED,
            ApplyStatus.REVOKED,
            ApplyStatus.RETURNED
          ] as string[]
        ).includes(item.status)
      )
        cancelled++
    })

    return { total, finished, checking, unpaid, cancelled }
  })

  // =========================
  // 3. Actions
  // =========================

  /**
   * 获取某病案的所有检查结果
   */
  async function fetchResults(caseId: number) {
    if (!caseId) return

    loading.value = true
    try {
      const res = await getCaseResults(caseId)
      allResults.value = res || []
    } catch (error) {
      console.error(error)
      ElMessage.error('获取检查结果失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    allResults.value = []
    loading.value = false
  }

  return {
    loading,
    allResults,
    finishedList,
    pendingList,
    statistics,
    fetchResults,
    reset
  }
})

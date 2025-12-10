import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// API
import {
  createPrescriptions,
  getCasePrescriptions,
  revokePrescription
} from '@/api/modules/Outpatient/MedicalTreatment'

// Types
import type {
  DrugInfo,
  SelectedPrescriptionItem,
  PrescriptionHistory
} from '@/types/Outpatient/MedicalTreatment'

// Context
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'

export const usePrescriptionStore = defineStore('prescriptionStore', () => {
  const contextStore = useClinicContextStore()

  // =========================
  // 1. State
  // =========================
  const loading = ref(false)
  const submitting = ref(false)

  // 购物车 (待提交药品)
  const cartList = ref<SelectedPrescriptionItem[]>([])

  // 历史记录 (已提交处方)
  const historyList = ref<PrescriptionHistory[]>([])

  const currentRegId = ref<number | null>(null)

  // =========================
  // 2. 持久化逻辑 (SessionStorage + 防抖)
  // =========================
  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  const getStorageKey = (id: number) => `prescription_cart_draft_${id}`

  watch(
    cartList,
    () => {
      if (!currentRegId.value) return
      if (saveTimeout) clearTimeout(saveTimeout)

      saveTimeout = setTimeout(() => {
        if (currentRegId.value) {
          if (cartList.value.length > 0) {
            sessionStorage.setItem(
              getStorageKey(currentRegId.value),
              JSON.stringify(cartList.value)
            )
          } else {
            sessionStorage.removeItem(getStorageKey(currentRegId.value))
          }
        }
      }, 1000)
    },
    { deep: true }
  )

  function initAutoSave(regId: number) {
    currentRegId.value = regId
    const key = getStorageKey(regId)
    const draft = sessionStorage.getItem(key)
    if (draft) {
      try {
        cartList.value = JSON.parse(draft)
      } catch (e) {
        console.error(e)
      }
    }
  }

  function clearDraft() {
    if (currentRegId.value) {
      sessionStorage.removeItem(getStorageKey(currentRegId.value))
    }
    if (saveTimeout) clearTimeout(saveTimeout)
  }

  // =========================
  // 3. Actions: 购物车操作
  // =========================

  /**
   * 批量添加药品到购物车
   */
  function batchAddToCart(drugs: DrugInfo[]) {
    let count = 0
    drugs.forEach((drug) => {
      // 防重检查
      const exists = cartList.value.some((i) => i.drugId === drug.drugId)
      if (!exists) {
        cartList.value.push({
          tempId: `drug_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          drugId: drug.drugId,
          dosage: '', // 用法用量留空，需医生填写
          quantity: 1, // 默认数量 1
          remark: '',
          drugInfo: drug // 保存完整信息用于展示
        })
        count++
      }
    })

    if (count > 0) {
      ElMessage.success(`成功添加 ${count} 种药品`)
    } else {
      ElMessage.info('所选药品已全部在列表中')
    }
  }

  function removeFromCart(index: number) {
    cartList.value.splice(index, 1)
  }

  // =========================
  // 4. Actions: API 交互
  // =========================

  /**
   * 提交处方
   */
  async function submitPrescription() {
    if (cartList.value.length === 0) {
      ElMessage.warning('处方列表为空')
      return
    }

    // 校验：用法用量必填，数量必须大于0
    for (const item of cartList.value) {
      if (!item.dosage) {
        ElMessage.warning(`请填写【${item.drugInfo?.drugName}】的用法用量`)
        return
      }
      if (!item.quantity || item.quantity <= 0) {
        ElMessage.warning(`【${item.drugInfo?.drugName}】的数量必须大于0`)
        return
      }
      // 简单库存校验 (前端防呆，后端才是最后防线)
      const stock = Number(item.drugInfo?.stockQuantity || 0)
      if (item.quantity > stock) {
        ElMessage.error(
          `【${item.drugInfo?.drugName}】库存不足 (剩余: ${stock})`
        )
        return
      }
    }

    const caseId = contextStore.caseId
    const regId = contextStore.registrationId
    if (!caseId || !regId) return

    submitting.value = true
    try {
      await createPrescriptions(caseId, {
        registrationId: regId,
        prescriptions: cartList.value.map((item) => ({
          drugId: item.drugId,
          dosage: item.dosage,
          quantity: item.quantity,
          remark: item.remark
        }))
      })

      ElMessage.success('处方开立成功')

      // 1. 清空购物车
      cartList.value = []
      // 2. 清除草稿
      clearDraft()
      // 3. 刷新历史
      await fetchHistory()
    } catch (error) {
      console.error(error)
      ElMessage.error('提交失败，请检查库存')
    } finally {
      submitting.value = false
    }
  }

  /**
   * 获取历史处方
   */
  async function fetchHistory() {
    const caseId = contextStore.caseId
    if (!caseId) return

    loading.value = true
    try {
      const res = await getCasePrescriptions(caseId)
      historyList.value = res || []
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 撤销处方 (释放库存)
   */
  async function revokeItem(prescriptionId: number) {
    try {
      await revokePrescription(prescriptionId)
      ElMessage.success('处方已撤销，库存已释放')
      await fetchHistory()
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  }

  /**
   * 重置状态
   */
  function resetState() {
    cartList.value = []
    historyList.value = []
    currentRegId.value = null
    if (saveTimeout) clearTimeout(saveTimeout)
  }

  return {
    loading,
    submitting,
    cartList,
    historyList,
    initAutoSave,
    batchAddToCart,
    removeFromCart,
    submitPrescription,
    fetchHistory,
    revokeItem,
    resetState,
    clearDraft
  }
})

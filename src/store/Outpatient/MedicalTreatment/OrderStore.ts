import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// API
import {
  applyMedicalItems,
  getCaseItemsHistory,
  revokeMedicalItem
} from '@/api/modules/Outpatient/MedicalTreatment'

// Types
import {
  type MedicalItem,
  type SelectedApplyItem,
  type CaseItemHistory,
  ApplyType // 引入申请类型常量
} from '@/types/Outpatient/MedicalTreatment'

import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'

export const useOrderStore = defineStore('orderStore', () => {
  const contextStore = useClinicContextStore()

  // State
  const loading = ref(false)
  const submitting = ref(false)
  const cartList = ref<SelectedApplyItem[]>([]) // 购物车
  const historyList = ref<CaseItemHistory[]>([]) // 历史记录
  const currentRegId = ref<number | null>(null)

  // 持久化逻辑 (保持不变)
  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  const getStorageKey = (id: number) => `order_cart_draft_${id}`

  watch(
    cartList,
    () => {
      if (!currentRegId.value) return
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        if (currentRegId.value) {
          // 购物车为空时删除 Key，否则写入
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
    if (currentRegId.value)
      sessionStorage.removeItem(getStorageKey(currentRegId.value))
    if (saveTimeout) clearTimeout(saveTimeout)
  }

  // =========================
  // Actions: 购物车操作
  // =========================

  // 单个添加
  function addToCart(item: MedicalItem, showMessage = true) {
    const exists = cartList.value.some((i) => i.itemId === item.itemId)
    if (exists) {
      if (showMessage) ElMessage.warning(`${item.itemName} 已在申请列表中`)
      return false
    }

    cartList.value.push({
      tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemId: item.itemId,
      applyType: item.itemType,
      applyPurpose: '',
      applySite: '',
      unit: 1,
      remark: '',
      itemInfo: item
    })
    if (showMessage) ElMessage.success(`已添加: ${item.itemName}`)
    return true
  }

  // ✅ 新增：批量添加 (用于弹窗选择器)
  function batchAddToCart(items: MedicalItem[]) {
    let count = 0
    items.forEach((item) => {
      if (addToCart(item, false)) {
        // 调用单个添加，但不显示消息
        count++
      }
    })
    if (count > 0) {
      ElMessage.success(`成功添加 ${count} 个项目`)
    } else {
      ElMessage.info('所选项目已全部在列表中')
    }
  }

  function removeFromCart(index: number) {
    cartList.value.splice(index, 1)
  }

  // =========================
  // Actions: API 交互 (保持不变)
  // =========================

  async function submitOrder() {
    if (cartList.value.length === 0) {
      ElMessage.warning('申请列表为空')
      return
    }
    // 简单校验
    for (const item of cartList.value) {
      if (!item.applyPurpose || !item.applySite) {
        ElMessage.warning(
          `【${item.itemInfo?.itemName}】的检查部位和目的不能为空`
        )
        return
      }
    }

    const caseId = contextStore.caseId
    const regId = contextStore.registrationId
    if (!caseId || !regId) return

    submitting.value = true
    try {
      await applyMedicalItems(caseId, {
        registrationId: regId,
        items: cartList.value.map((item) => ({
          itemId: item.itemId,
          applyType: item.applyType,
          applyPurpose: item.applyPurpose,
          applySite: item.applySite,
          unit: item.unit,
          remark: item.remark
        }))
      })
      ElMessage.success('申请提交成功')
      cartList.value = []
      clearDraft()
      await fetchHistory()
    } catch (error) {
      console.error(error)
      ElMessage.error('提交失败')
    } finally {
      submitting.value = false
    }
  }

  async function fetchHistory() {
    if (!contextStore.caseId) return
    loading.value = true
    try {
      const res = await getCaseItemsHistory(contextStore.caseId)
      historyList.value = res || []
    } finally {
      loading.value = false
    }
  }

  async function revokeItem(applyId: number) {
    try {
      await revokeMedicalItem(applyId)
      ElMessage.success('项目已作废')
      await fetchHistory()
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  }

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
    addToCart,
    batchAddToCart, // ✅ 导出
    removeFromCart,
    submitOrder,
    fetchHistory,
    revokeItem,
    resetState,
    clearDraft
  }
})

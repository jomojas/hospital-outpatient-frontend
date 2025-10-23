// PaymentDialogStore.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { ChargeItem, BatchChargeForm } from '@/types/Registration/Charge'
import type { ChargeStore } from './ChargeStore'

export const usePaymentDialogStore = defineStore('paymentDialog', () => {
  // ✅ 弹窗状态
  const visible = ref(false)
  const chargeItems = ref<ChargeItem[]>([])

  // ✅ 支付表单数据
  const paymentForm = ref<{
    paymentMethodId?: number
    settlementTypeId?: number
  }>({
    paymentMethodId: undefined,
    settlementTypeId: undefined
  })

  // ✅ 计算属性：总金额
  const totalAmount = computed(() => {
    return chargeItems.value.reduce((sum, item) => sum + item.totalAmount, 0)
  })

  // ✅ 计算属性：表单验证状态
  const isFormValid = computed(() => {
    return (
      paymentForm.value.paymentMethodId !== undefined &&
      paymentForm.value.settlementTypeId !== undefined &&
      chargeItems.value.length > 0
    )
  })

  // ✅ 打开弹窗 - 修改参数类型为 readonly
  function openDialog(items: readonly ChargeItem[]) {
    chargeItems.value = [...items] // 创建副本，去除 readonly
    visible.value = true
    resetForm()
  }

  // ✅ 关闭弹窗
  function closeDialog() {
    visible.value = false
    chargeItems.value = []
    resetForm()
  }

  // ✅ 重置表单
  function resetForm() {
    paymentForm.value = {
      paymentMethodId: undefined,
      settlementTypeId: undefined
    }
  }

  // ✅ 执行缴费操作
  async function performCharge(chargeStore: ChargeStore): Promise<boolean> {
    if (!isFormValid.value) {
      return false
    }

    // 构建缴费表单数据
    const form: BatchChargeForm = {
      selectedItems: chargeItems.value,
      paymentMethodId: paymentForm.value.paymentMethodId!,
      settlementTypeId: paymentForm.value.settlementTypeId!,
      totalAmount: totalAmount.value
    }

    // 调用缴费 Store 的方法
    const success = await chargeStore.batchCharge(form)

    if (success) {
      closeDialog()
    }

    return success
  }

  return {
    // ✅ 状态数据
    visible: readonly(visible),
    chargeItems: readonly(chargeItems),
    paymentForm,

    // ✅ 计算属性
    totalAmount,
    isFormValid,

    // ✅ 操作方法
    openDialog,
    closeDialog,
    resetForm,
    performCharge
  }
})

export type PaymentDialogStore = ReturnType<typeof usePaymentDialogStore>

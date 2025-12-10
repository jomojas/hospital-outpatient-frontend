import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCaseFees } from '@/api/modules/Outpatient/MedicalTreatment'
import type { FeeInquiryResponse } from '@/types/Outpatient/MedicalTreatment'

export const useFeeStore = defineStore('feeStore', () => {
  const loading = ref(false)
  const feeData = ref<FeeInquiryResponse>({
    registrationFee: '0.00',
    medicalItemFees: [],
    prescriptionFees: [],
    totalAmount: '0.00',
    unpaidAmount: '0.00'
  })

  // 计算属性：是否有未缴费项目
  const hasUnpaid = computed(() => Number(feeData.value.unpaidAmount) > 0)

  async function fetchFees(caseId: number) {
    loading.value = true
    try {
      const res = await getCaseFees(caseId)
      if (res) {
        feeData.value = res
      }
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  function reset() {
    feeData.value = {
      registrationFee: '0.00',
      medicalItemFees: [],
      prescriptionFees: [],
      totalAmount: '0.00',
      unpaidAmount: '0.00'
    }
  }

  return {
    loading,
    feeData,
    hasUnpaid,
    fetchFees,
    reset
  }
})

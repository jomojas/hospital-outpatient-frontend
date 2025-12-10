<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'
import { usePrescriptionStore } from '@/store/Outpatient/MedicalTreatment/PrescriptionStore'

import DrugSearch from './components/DrugSearch.vue'
import PrescriptionCart from './components/PrescriptionCart.vue'
import HistoryPrescriptionTable from './components/HistoryPrescriptionTable.vue'

const contextStore = useClinicContextStore()
const prescriptionStore = usePrescriptionStore()

const initPageData = async () => {
  const regId = contextStore.registrationId
  const caseId = contextStore.caseId
  if (!regId) return

  prescriptionStore.initAutoSave(regId)

  if (caseId) {
    await prescriptionStore.fetchHistory()
  }
}

onMounted(() => {
  if (contextStore.registrationId) initPageData()
})

watch(
  () => contextStore.registrationId,
  (val) => {
    if (val) initPageData()
  }
)

onUnmounted(() => {
  prescriptionStore.resetState()
})
</script>

<template>
  <div class="prescription-page">
    <div class="mb-20">
      <DrugSearch class="mb-20" />
      <PrescriptionCart />
    </div>

    <div>
      <HistoryPrescriptionTable />
    </div>
  </div>
</template>

<style scoped>
.prescription-page {
  padding-bottom: 40px;
}
.mb-20 {
  margin-bottom: 20px;
}
</style>

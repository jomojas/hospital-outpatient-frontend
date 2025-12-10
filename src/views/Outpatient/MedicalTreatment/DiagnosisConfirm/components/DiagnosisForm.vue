<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { useMedicalRecordStore } from '@/store/Outpatient/MedicalTreatment/MedicalRecord'

const store = useMedicalRecordStore()
const formRef = ref<FormInstance>()

const rules = {
  diagnosis: [{ required: true, message: '请输入确诊结果', trigger: 'blur' }],
  treatmentPlan: [
    { required: true, message: '请输入治疗方案', trigger: 'blur' }
  ]
}

const validate = () => formRef.value?.validate()

defineExpose({ validate })
</script>

<template>
  <div class="diagnosis-form-container">
    <el-alert
      title="请综合左侧病史及检查结果，下达最终诊断。"
      type="info"
      show-icon
      :closable="false"
      class="mb-20"
    />

    <el-form
      ref="formRef"
      :model="store.diagnosisForm"
      :rules="rules"
      label-position="top"
    >
      <el-card shadow="hover" class="mb-20 diagnosis-card">
        <template #header>
          <div class="card-header">
            <span class="title">诊断结果 (Diagnosis)</span>
            <el-tag type="warning" effect="dark">结论</el-tag>
          </div>
        </template>
        <el-form-item prop="diagnosis">
          <el-input
            v-model="store.diagnosisForm.diagnosis"
            type="textarea"
            :rows="6"
            placeholder="请输入中西医诊断结果 (例如: 急性上呼吸道感染 / 风寒感冒)"
          />
        </el-form-item>
      </el-card>

      <el-card shadow="hover" class="plan-card">
        <template #header>
          <div class="card-header">
            <span class="title">治疗方案 (Treatment Plan)</span>
            <el-tag type="success" effect="dark">医嘱</el-tag>
          </div>
        </template>
        <el-form-item prop="treatmentPlan">
          <el-input
            v-model="store.diagnosisForm.treatmentPlan"
            type="textarea"
            :rows="8"
            placeholder="请输入处置计划、用药指导、生活建议等..."
          />
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-weight: bold;
  font-size: 16px;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useMedicalRecordStore } from '@/store/Outpatient/MedicalTreatment/MedicalRecord'

// 1. 获取 Store
const recordStore = useMedicalRecordStore()

// 2. 表单引用 (用于父组件调用验证)
const formRef = ref<FormInstance>()

// 3. 验证规则
const rules = computed<FormRules>(() => ({
  chiefComplaint: [
    { required: true, message: '主诉不能为空', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  presentHistory: [
    { required: true, message: '现病史不能为空', trigger: 'blur' }
  ],
  physicalExam: [
    { required: true, message: '请输入体格检查情况', trigger: 'blur' } // 可选
  ]
}))

// 4. 暴露验证方法给父组件
const validate = async () => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch (e) {
    return false
  }
}

// 暴露给父组件
defineExpose({ validate })
</script>

<template>
  <el-form
    ref="formRef"
    :model="recordStore.initialForm"
    :rules="rules"
    label-position="top"
    class="case-form"
  >
    <!-- 第一部分：主诉 -->
    <el-card shadow="never" class="form-card">
      <template #header>
        <div class="card-header">
          <span class="title">主诉 (Chief Complaint)</span>
          <el-tag size="small" type="danger" effect="plain">必填</el-tag>
        </div>
      </template>
      <el-form-item prop="chiefComplaint">
        <el-input
          v-model="recordStore.initialForm.chiefComplaint"
          type="textarea"
          :rows="3"
          placeholder="例如：发热伴咽痛3天，加重1天"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-card>

    <!-- 第二部分：现病史 -->
    <el-card shadow="never" class="form-card">
      <template #header>
        <div class="card-header">
          <span class="title">现病史 (History of Present Illness)</span>
          <el-tag size="small" type="danger" effect="plain">必填</el-tag>
        </div>
      </template>
      <el-form-item prop="presentHistory">
        <el-input
          v-model="recordStore.initialForm.presentHistory"
          type="textarea"
          :rows="6"
          placeholder="请详细描述发病过程、症状演变、诊疗经过等..."
        />
      </el-form-item>
    </el-card>

    <!-- 第三部分：体格检查 -->
    <el-card shadow="never" class="form-card">
      <template #header>
        <div class="card-header">
          <span class="title">体格检查 (Physical Examination)</span>
          <el-tag size="small" type="danger" effect="plain">必填</el-tag>
        </div>
      </template>
      <el-form-item prop="physicalExam">
        <el-input
          v-model="recordStore.initialForm.physicalExam"
          type="textarea"
          :rows="5"
          placeholder="例如：T 38.5℃，P 90次/分，R 20次/分，BP 120/80mmHg。咽部充血，双扁桃体II度肿大..."
        />
      </el-form-item>
    </el-card>
  </el-form>
</template>

<style scoped lang="scss">
.form-card {
  margin-bottom: 20px;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 15px 20px;
    background-color: #fafafa;
    border-bottom: 1px solid #f0f0f0;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    font-weight: 600;
    font-size: 15px;
    color: #303133;
    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 14px;
      background-color: var(--el-color-primary);
      margin-right: 8px;
      border-radius: 2px;
      vertical-align: middle;
    }
  }
}
</style>

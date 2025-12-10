<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Select, Files } from '@element-plus/icons-vue'

import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'
import { useMedicalRecordStore } from '@/store/Outpatient/MedicalTreatment/MedicalRecord'
// 记得引入纯更新接口，用于"暂存"
import { updateCase } from '@/api/modules/Outpatient/MedicalTreatment'

import CaseReference from './components/CaseReference.vue'
import DiagnosisForm from './components/DiagnosisForm.vue'

const contextStore = useClinicContextStore()
const recordStore = useMedicalRecordStore()
const formRef = ref<InstanceType<typeof DiagnosisForm>>()

const isEditable = computed(() => contextStore.isMedicalRecordEditable)

// 初始化
const initData = async () => {
  if (contextStore.caseId && contextStore.registrationId) {
    // 1. 加载病案数据 (填充 Reference 的病史 和 Right 的表单)
    await recordStore.loadCaseData(contextStore.caseId)
    // 2. 开启自动保存 (防止手滑刷新)
    recordStore.initAutoSave(contextStore.registrationId)
  }
}

onMounted(() => {
  if (contextStore.caseId) initData()
})

watch(
  () => contextStore.caseId,
  (val) => {
    if (val) initData()
  }
)

onUnmounted(() => {
  recordStore.resetForms()
})

// 暂存 (调用纯 update 接口，不改状态)
const handleSaveDraft = async () => {
  try {
    recordStore.isSubmitting = true
    // 构造全量数据
    await updateCase(contextStore.caseId!, {
      registrationId: contextStore.registrationId!,
      patientNo: contextStore.patientInfo.medicalNo,
      chiefComplaint: recordStore.initialForm.chiefComplaint,
      presentHistory: recordStore.initialForm.presentHistory,
      physicalExam: recordStore.initialForm.physicalExam,
      diagnosis: recordStore.diagnosisForm.diagnosis,
      treatmentPlan: recordStore.diagnosisForm.treatmentPlan
    })
    ElMessage.success('诊断草稿已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    recordStore.isSubmitting = false
  }
}

// 提交确诊 (调用 confirm 接口，修改状态)
const handleConfirm = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  await recordStore.submitDiagnosis()
  // Store 内部已处理 clearDraft 和 updateStatus
}
</script>

<template>
  <div class="diagnosis-page" v-loading="recordStore.isLoading">
    <el-row :gutter="20" style="height: 100%">
      <!-- 左侧：参考区 (40%) -->
      <el-col :span="10" style="height: 100%">
        <CaseReference />
      </el-col>

      <!-- 右侧：录入区 (60%) -->
      <el-col
        :span="14"
        style="height: 100%; display: flex; flex-direction: column"
      >
        <div class="form-area">
          <!-- 使用 fieldset 禁用所有输入框 -->
          <fieldset :disabled="!isEditable" class="no-border">
            <DiagnosisForm ref="formRef" />
          </fieldset>
        </div>

        <!-- 底部固定操作栏 -->
        <div class="action-footer" v-if="isEditable">
          <el-button
            :icon="Files"
            :loading="recordStore.isSubmitting"
            @click="handleSaveDraft"
          >
            暂存草稿
          </el-button>

          <el-button
            type="primary"
            :icon="Select"
            :loading="recordStore.isSubmitting"
            @click="handleConfirm"
          >
            提交确诊
          </el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.diagnosis-page {
  height: 100%; /* 撑满 WorkspaceContent */
  overflow: hidden; /* 内部滚动 */
}

.form-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.action-footer {
  height: 60px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  /* margin-top: auto; */
}

.no-border {
  border: none;
  padding: 0;
  margin: 0;
}
</style>

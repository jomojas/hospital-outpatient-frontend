<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { FolderAdd, Select } from '@element-plus/icons-vue'

// 引入 Store
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'
import { useMedicalRecordStore } from '@/store/Outpatient/MedicalTreatment/MedicalRecord'
import { updateCase } from '@/api/modules/Outpatient/MedicalTreatment'

// 引入子组件
import CaseForm from './components/CaseForm.vue'

const contextStore = useClinicContextStore()
const recordStore = useMedicalRecordStore()

// 组件引用
const caseFormRef = ref<InstanceType<typeof CaseForm>>()

// 计算属性：当前是否有病案ID
const hasCaseId = computed(() => !!contextStore.caseId)

/**
 * ✅ 核心初始化逻辑
 * 必须在 registrationId 存在后才能执行
 */
const initPageData = async () => {
  const regId = contextStore.registrationId
  const caseId = contextStore.caseId

  if (!regId) return

  // 1. 启动持久化 (草稿箱)
  // 如果是初诊，这里会从 SessionStorage 恢复之前未保存的内容
  recordStore.initAutoSave(regId)

  // 2. 如果已建档 (API 优先)
  // 从服务器拉取数据，这会覆盖掉上面的草稿 (符合预期：以服务器为准)
  if (caseId) {
    await recordStore.loadCaseData(caseId)
  }
}

// 生命周期挂载
onMounted(async () => {
  // 🛡️ 竞态条件处理 A：
  // 如果从列表页跳转过来，Layout 可能已经加载完 Context 了
  if (contextStore.registrationId) {
    await initPageData()
  }
  // 🛡️ 竞态条件处理 B：
  // 如果是 F5 刷新，Context 正在 loading，下面的 watch 会处理
})

// ✅ 监听 Context 加载完成
watch(
  () => contextStore.registrationId,
  (newVal) => {
    if (newVal) {
      initPageData()
    }
  }
)

// 离开时清理内存 (不清除 Storage，除非是结束接诊)
onUnmounted(() => {
  recordStore.resetForms()
})

/**
 * 提交按钮处理
 */
const handleSubmit = async () => {
  const valid = await caseFormRef.value?.validate()
  if (!valid) {
    ElMessage.warning('请检查表单填写是否完整')
    return
  }

  if (!hasCaseId.value) {
    await handleCreate()
  } else {
    await handleUpdate()
  }
}

// 创建逻辑 (使用 Store Action)
const handleCreate = async () => {
  await recordStore.submitInitialCase()
  // 成功后 Store 内部会自动清除草稿并更新 Context
}

// 更新逻辑 (手动调用 API 实现全量更新)
const handleUpdate = async () => {
  try {
    // ✅ 修正：正确获取 ID
    const regId = contextStore.registrationId
    const medicalNo = contextStore.patientInfo.medicalNo

    if (!contextStore.caseId || !regId) {
      ElMessage.error('关键信息丢失，无法更新，请刷新页面')
      return
    }

    recordStore.isSubmitting = true

    // 构造更新请求
    await updateCase(contextStore.caseId, {
      registrationId: regId,
      patientNo: medicalNo,

      // 首页表单数据
      chiefComplaint: recordStore.initialForm.chiefComplaint,
      presentHistory: recordStore.initialForm.presentHistory,
      physicalExam: recordStore.initialForm.physicalExam,

      // ⚠️ 关键：保持诊断信息不变，防止覆盖后续页面的操作
      // 因为我们已经通过 loadCaseData 加载了所有数据，直接回传即可
      diagnosis: recordStore.diagnosisForm.diagnosis,
      treatmentPlan: recordStore.diagnosisForm.treatmentPlan
    })

    ElMessage.success('病历信息已更新')

    // 手动清除草稿 (因为数据已落库)
    recordStore.clearDraft()
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败')
  } finally {
    recordStore.isSubmitting = false
  }
}
</script>

<template>
  <div
    class="case-homepage"
    v-loading="recordStore.isLoading || contextStore.loading"
  >
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <div class="tips">
        <el-alert
          v-if="!hasCaseId"
          title="当前为初诊状态，请填写病历并创建病案，以解锁后续诊疗功能。"
          type="warning"
          show-icon
          :closable="false"
        />
        <el-alert
          v-else
          title="病案已建立，您可以随时修改病历信息，修改后请点击保存。"
          type="success"
          show-icon
          :closable="false"
        />
      </div>

      <div class="buttons">
        <el-button
          v-if="!hasCaseId"
          type="primary"
          size="large"
          :icon="FolderAdd"
          :loading="recordStore.isSubmitting"
          @click="handleSubmit"
        >
          创建病案并开始诊疗
        </el-button>

        <el-button
          v-else
          type="primary"
          size="large"
          :icon="Select"
          :loading="recordStore.isSubmitting"
          @click="handleSubmit"
        >
          保存修改
        </el-button>
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="content-area">
      <!-- 只有当 Context 加载完后才渲染表单，避免数据错乱 -->
      <CaseForm v-if="contextStore.registrationId" ref="caseFormRef" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.case-homepage {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  .tips {
    flex: 1;
  }

  .buttons {
    flex-shrink: 0;
  }
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 40px;
}
</style>

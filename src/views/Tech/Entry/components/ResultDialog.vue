<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useTechStore } from '@/store/Tech/TechStore'
import type { TechApplyItem } from '@/types/Tech/TechStation'

const store = useTechStore()
const visible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const currentItem = ref<TechApplyItem | null>(null)

const form = reactive({
  result: '',
  remark: ''
})

const rules = reactive<FormRules>({
  result: [{ required: true, message: '结果内容不能为空', trigger: 'blur' }]
})

// 根据不同模块显示不同标题
const dialogTitle = computed(() => {
  const map = { EXAM: '检查', LAB: '检验', DISPOSAL: '处置' }
  return `录入${map[store.currentModule] || '项目'}结果`
})

const open = (item: TechApplyItem) => {
  currentItem.value = item
  form.result = ''
  form.remark = ''
  visible.value = true
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

const handleSubmit = async () => {
  if (!formRef.value || !currentItem.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      const success = await store.handleSubmitResult(
        currentItem.value!.applyId,
        {
          result: form.result,
          remark: form.remark
        }
      )
      submitting.value = false
      if (success) visible.value = false
    }
  })
}

defineExpose({ open })
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="info-box" v-if="currentItem">
      <div class="row">
        <span class="label">患者：</span>
        <span class="value"
          >{{ currentItem.patientName }} ({{ currentItem.patientNo }})</span
        >
      </div>
      <div class="row">
        <span class="label">项目：</span>
        <span class="value highlight">{{ currentItem.itemName }}</span>
      </div>
      <div class="row">
        <span class="label">部位：</span>
        <span class="value">{{ currentItem.applySite || '-' }}</span>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="mt-4"
    >
      <el-form-item label="结果内容" prop="result">
        <el-input
          v-model="form.result"
          type="textarea"
          :rows="6"
          placeholder="请输入详细结果..."
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" placeholder="可选填" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit"
        >提交</el-button
      >
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.info-box {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}
.row {
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
}
.label {
  color: #909399;
}
.value {
  color: #303133;
  font-weight: 500;
}
.highlight {
  color: var(--el-color-primary);
  font-weight: bold;
}
.mt-4 {
  margin-top: 20px;
}
</style>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import type {
  ResetPasswordRequest,
  StaffDetailResponse
} from '@/types/Information/Employee'

const props = defineProps<{
  modelValue: boolean
  row: StaffDetailResponse | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: ResetPasswordRequest): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const formRef = ref<FormInstance>()
const form = reactive<ResetPasswordRequest>({
  newPassword: ''
})

const rules: FormRules = {
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
}

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    form.newPassword = ''
  }
)

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('submit', { newPassword: form.newPassword })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="重置密码"
    width="420px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" show-password />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSubmit"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import type { CreateRegistrationLevelRequest } from '@/types/Information/RegistrationLevel'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: CreateRegistrationLevelRequest): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const formRef = ref<FormInstance>()
const form = reactive<CreateRegistrationLevelRequest>({
  code: '',
  name: '',
  price: 0
})

const rules: FormRules = {
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const onOpen = () => {
  form.code = ''
  form.name = ''
  form.price = 0
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('submit', { code: form.code, name: form.name, price: form.price })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="新增挂号级别"
    width="520px"
    :close-on-click-modal="false"
    @open="onOpen"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input v-model="form.price" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSubmit"
        >创建</el-button
      >
    </template>
  </el-dialog>
</template>

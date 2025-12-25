<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import type { RegistrationLevelResponse } from '@/types/Information/RegistrationLevel'

const props = defineProps<{
  modelValue: boolean
  row: RegistrationLevelResponse | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: { code: string; price: number | string }): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const formRef = ref<FormInstance>()
const form = reactive<{ price: number | string }>({ price: 0 })

const rules: FormRules = {
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

watch(
  () => props.row,
  (r) => {
    if (!r) return
    form.price = r.price
  },
  { immediate: true }
)

const code = computed(() => props.row?.code ?? '')

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!code.value) return
  emit('submit', { code: code.value, price: form.price })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="修改挂号价格"
    width="420px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="号别编码">
        <el-input :model-value="row?.code" disabled />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input v-model="form.price" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSubmit"
        >保存</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DepartmentResponse } from '@/types/Information/Department'
import type { CopyScheduleRequest } from '@/types/Information/Schedule'

const props = defineProps<{
  modelValue: boolean
  departments: DepartmentResponse[]
  loading?: boolean
  initialData: Pick<CopyScheduleRequest, 'departmentId'> | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: CopyScheduleRequest): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const formRef = ref<FormInstance>()
const form = reactive<CopyScheduleRequest>({
  departmentId: 0,
  sourceStartDate: '',
  targetStartDate: ''
})

watch(
  () => props.initialData,
  (data) => {
    form.departmentId = data?.departmentId ?? 0
    form.sourceStartDate = ''
    form.targetStartDate = ''
  },
  { immediate: true }
)

const rules: FormRules = {
  departmentId: [{ required: true, message: '请选择科室', trigger: 'change' }],
  sourceStartDate: [
    { required: true, message: '请选择源周开始日期', trigger: 'change' }
  ],
  targetStartDate: [
    { required: true, message: '请选择目标周开始日期', trigger: 'change' }
  ]
}

const disabledDateForTarget = (time: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return time < today
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('submit', {
    departmentId: Number(form.departmentId),
    sourceStartDate: form.sourceStartDate,
    targetStartDate: form.targetStartDate
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="复制排班"
    width="560px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="科室" prop="departmentId">
        <el-select v-model="form.departmentId" filterable>
          <el-option
            v-for="d in props.departments"
            :key="d.departmentId"
            :label="d.departmentName"
            :value="d.departmentId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="源周开始日期" prop="sourceStartDate">
        <el-date-picker
          v-model="form.sourceStartDate"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="目标周开始日期" prop="targetStartDate">
        <el-date-picker
          v-model="form.targetStartDate"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDateForTarget"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="props.loading" @click="onSubmit"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

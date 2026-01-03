<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type {
  BatchSetQuotaRequest,
  DoctorScheduleResponse
} from '@/types/Information/Schedule'

const props = defineProps<{
  modelValue: boolean
  schedules: DoctorScheduleResponse[]
  loading?: boolean
  initialData: Pick<
    BatchSetQuotaRequest,
    'staffId' | 'startDate' | 'endDate'
  > | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: BatchSetQuotaRequest): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const formRef = ref<FormInstance>()
const form = reactive<BatchSetQuotaRequest>({
  staffId: 0,
  startDate: '',
  endDate: '',
  quota: 0,
  weekDays: []
})

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.staffId = data.staffId
      form.startDate = data.startDate
      form.endDate = data.endDate
      form.quota = 0
      form.weekDays = []
    }
  },
  { immediate: true }
)

const rules: FormRules = {
  staffId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  quota: [{ required: true, message: '请输入号源', trigger: 'blur' }]
}

const disabledDate = (time: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return time < today
}

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('submit', {
    staffId: Number(form.staffId),
    startDate: form.startDate,
    endDate: form.endDate,
    quota: Number(form.quota),
    weekDays: form.weekDays?.length ? form.weekDays : undefined
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="批量设置号源"
    width="640px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="医生" prop="staffId">
        <el-select v-model="form.staffId" filterable>
          <el-option
            v-for="d in props.schedules"
            :key="d.staffId"
            :label="d.staffName"
            :value="d.staffId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="form.startDate"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="form.endDate"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
        />
      </el-form-item>
      <el-form-item label="号源" prop="quota">
        <el-input v-model="form.quota" />
      </el-form-item>
      <el-form-item label="周几(可选)">
        <el-checkbox-group v-model="form.weekDays">
          <el-checkbox :label="1">周一</el-checkbox>
          <el-checkbox :label="2">周二</el-checkbox>
          <el-checkbox :label="3">周三</el-checkbox>
          <el-checkbox :label="4">周四</el-checkbox>
          <el-checkbox :label="5">周五</el-checkbox>
          <el-checkbox :label="6">周六</el-checkbox>
          <el-checkbox :label="7">周日</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="props.loading" @click="onSubmit"
        >保存</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type {
  DoctorScheduleResponse,
  SetQuotaRequest
} from '@/types/Information/Schedule'

const props = defineProps<{
  modelValue: boolean
  schedules: DoctorScheduleResponse[]
  loading?: boolean
  initialData: SetQuotaRequest | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: SetQuotaRequest): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const formRef = ref<FormInstance>()
const form = reactive<SetQuotaRequest>({
  staffId: 0,
  date: '',
  quota: 0
})

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.staffId = data.staffId
      form.date = data.date
      form.quota = data.quota
    }
  },
  { immediate: true }
)

const rules: FormRules = {
  staffId: [{ required: true, message: '请选择医生', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
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
    date: form.date,
    quota: Number(form.quota)
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="设置号源"
    width="520px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
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
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
        />
      </el-form-item>
      <el-form-item label="号源" prop="quota">
        <el-input v-model="form.quota" />
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

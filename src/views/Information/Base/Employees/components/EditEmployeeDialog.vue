<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import type { DepartmentResponse } from '@/types/Information/Department'
import type {
  StaffDetailResponse,
  StaffRoleResponse,
  UpdateEmployeeDTO
} from '@/types/Information/Employee'

const props = defineProps<{
  modelValue: boolean
  row: StaffDetailResponse | null
  departments: DepartmentResponse[]
  roles: StaffRoleResponse[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: UpdateEmployeeDTO): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const title = computed(() => '编辑员工')

const formRef = ref<FormInstance>()
const form = reactive<UpdateEmployeeDTO>({
  departmentId: 0,
  roleId: 0,
  name: '',
  phone: '',
  idCard: '',
  isExpert: false
})

const isDoctorRole = computed(() => {
  const roleId = Number(form.roleId)
  const role = props.roles.find((r) => r.roleId === roleId)
  const code = String(role?.roleName ?? '').toUpperCase()
  const label = String(role?.description ?? '')
  return code === 'DOCTOR' || label.includes('医生')
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择科室', trigger: 'change' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const syncFromRow = () => {
  const row = props.row
  if (!row) return
  form.departmentId = row.departmentId
  form.roleId = row.roleId
  form.name = row.name
  form.phone = row.phone
  form.idCard = row.idCard
  form.isExpert = Boolean(row.isExpert)
}

watch(
  () => [props.row, props.modelValue] as const,
  () => {
    if (!props.modelValue) return
    syncFromRow()
  },
  { immediate: true }
)

watch(
  () => form.roleId,
  () => {
    if (!isDoctorRole.value) {
      form.isExpert = false
    }
  }
)

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const payload: UpdateEmployeeDTO = {
    ...form,
    departmentId: Number(form.departmentId),
    roleId: Number(form.roleId)
  }

  if (!isDoctorRole.value) {
    delete (payload as any).isExpert
  }

  emit('submit', payload)
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="560px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" />
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard">
        <el-input v-model="form.idCard" />
      </el-form-item>
      <el-form-item label="科室" prop="departmentId">
        <el-select
          v-model="form.departmentId"
          filterable
          placeholder="选择科室"
        >
          <el-option
            v-for="d in props.departments"
            :key="d.departmentId"
            :label="d.departmentName"
            :value="d.departmentId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="角色" prop="roleId">
        <el-select v-model="form.roleId" filterable placeholder="选择角色">
          <el-option
            v-for="r in props.roles"
            :key="r.roleId"
            :label="r.description"
            :value="r.roleId"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="isDoctorRole" label="专家">
        <el-switch v-model="form.isExpert" />
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

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import type { DepartmentResponse } from '@/types/Information/Department'
import type {
  CreateEmployeeRequest,
  StaffRoleResponse
} from '@/types/Information/Employee'

const props = defineProps<{
  modelValue: boolean
  departments: DepartmentResponse[]
  roles: StaffRoleResponse[]
  loading?: boolean
  suggestAccountName?: (roleId: number) => Promise<string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: CreateEmployeeRequest): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const formRef = ref<FormInstance>()
const form = reactive<CreateEmployeeRequest>({
  name: '',
  phone: '',
  idCard: '',
  departmentId: 0,
  roleId: 0,
  description: '',
  accountName: '',
  password: '',
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
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  accountName: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }]
}

const resetForm = () => {
  form.name = ''
  form.phone = ''
  form.idCard = ''
  form.departmentId = 0
  form.roleId = 0
  form.description = ''
  form.accountName = ''
  form.password = ''
  form.isExpert = false
}

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    resetForm()
  }
)

watch(
  () => form.roleId,
  async (roleId) => {
    if (!roleId) return

    if (!isDoctorRole.value) {
      form.isExpert = false
    }

    if (form.accountName) return
    if (!props.suggestAccountName) return
    try {
      const suggested = await props.suggestAccountName(roleId)
      if (!form.accountName) form.accountName = suggested
    } catch {
      // ignore
    }
  }
)

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const payload: CreateEmployeeRequest = {
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
    title="新增员工"
    width="640px"
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
      <el-form-item label="账号" prop="accountName">
        <el-input v-model="form.accountName" />
      </el-form-item>
      <el-form-item label="初始密码" prop="password">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>
      <el-form-item v-if="isDoctorRole" label="专家">
        <el-switch v-model="form.isExpert" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" />
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

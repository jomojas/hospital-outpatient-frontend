<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import type {
  CreateDepartmentRequest,
  DepartmentResponse,
  DepartmentTypeResponse,
  UpdateDepartmentRequest
} from '@/types/Information/Department'

type Mode = 'create' | 'edit'

type RoleOption = {
  roleId: number
  roleName: string
  description: string
}

const props = defineProps<{
  modelValue: boolean
  mode: Mode
  row: DepartmentResponse | null
  types: DepartmentTypeResponse[]
  roles: RoleOption[]
  initialRoleIds: number[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (
    e: 'submit',
    payload: CreateDepartmentRequest | UpdateDepartmentRequest
  ): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const title = computed(() =>
  props.mode === 'create' ? '新增科室' : '编辑科室'
)

const formRef = ref<FormInstance>()
const form = reactive<{
  departmentName: string
  type: string
  roleIds: number[]
}>({
  departmentName: '',
  type: '',
  roleIds: []
})

const rules: FormRules = {
  departmentName: [
    { required: true, message: '请输入科室名称', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择科室类型', trigger: 'change' }]
}

const syncFromProps = () => {
  form.departmentName = props.row?.departmentName ?? ''
  form.type = props.row?.type ?? ''
  form.roleIds = [...(props.initialRoleIds ?? [])]
}

watch(
  () =>
    [props.row, props.initialRoleIds, props.mode, props.modelValue] as const,
  () => {
    if (!props.modelValue) return
    syncFromProps()
  },
  { immediate: true }
)

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('submit', {
    departmentName: form.departmentName,
    type: form.type,
    roleIds: form.roleIds
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="620px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="科室名称" prop="departmentName">
        <el-input v-model="form.departmentName" placeholder="请输入科室名称" />
      </el-form-item>

      <el-form-item label="科室类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择科室类型" filterable>
          <el-option
            v-for="t in types"
            :key="t.type"
            :label="t.typeName"
            :value="t.type"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="绑定角色">
        <el-select
          v-model="form.roleIds"
          multiple
          filterable
          clearable
          placeholder="选择角色(可多选)"
        >
          <el-option
            v-for="r in roles"
            :key="r.roleId"
            :label="`${r.roleName}${
              r.description ? ' - ' + r.description : ''
            }`"
            :value="r.roleId"
          />
        </el-select>
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

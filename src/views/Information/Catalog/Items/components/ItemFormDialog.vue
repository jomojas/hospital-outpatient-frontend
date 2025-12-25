<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import type { DepartmentResponse } from '@/types/Information/Department'
import type {
  CreateMedicalItemRequest,
  MedicalItemResponse,
  UpdateMedicalItemRequest
} from '@/types/Information/MedicalItem'

type Mode = 'create' | 'edit'

const props = defineProps<{
  modelValue: boolean
  mode: Mode
  row: MedicalItemResponse | null
  itemTypes: Array<{ type: string; typeName: string }>
  departments: DepartmentResponse[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (
    e: 'submit',
    payload: CreateMedicalItemRequest | UpdateMedicalItemRequest
  ): void
}>()

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const title = computed(() =>
  props.mode === 'create' ? '新增医疗项目' : '编辑医疗项目'
)

const formRef = ref<FormInstance>()
const form = reactive<CreateMedicalItemRequest>({
  itemCode: '',
  itemName: '',
  itemType: '',
  price: 0,
  departmentId: 0,
  description: ''
})

const rules: FormRules = {
  itemCode: [{ required: true, message: '请输入项目编码', trigger: 'blur' }],
  itemName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  itemType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  departmentId: [
    { required: true, message: '请选择执行科室', trigger: 'change' }
  ],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const syncFromRow = () => {
  if (props.mode === 'create') {
    form.itemCode = ''
    form.itemName = ''
    form.itemType = ''
    form.price = 0
    form.departmentId = 0
    form.description = ''
    return
  }

  const row = props.row
  if (!row) return
  form.itemCode = row.itemCode
  form.itemName = row.itemName
  form.itemType = row.itemType
  form.price = Number(row.price)
  form.departmentId = row.departmentId
  form.description = row.description
}

watch(
  () => [props.modelValue, props.mode, props.row] as const,
  () => {
    if (!props.modelValue) return
    syncFromRow()
  },
  { immediate: true }
)

const onSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  emit('submit', {
    itemCode: form.itemCode,
    itemName: form.itemName,
    itemType: form.itemType,
    price: Number(form.price),
    departmentId: Number(form.departmentId),
    description: form.description
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="720px"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="项目编码" prop="itemCode">
        <el-input v-model="form.itemCode" />
      </el-form-item>
      <el-form-item label="项目名称" prop="itemName">
        <el-input v-model="form.itemName" />
      </el-form-item>
      <el-form-item label="项目类型" prop="itemType">
        <el-select v-model="form.itemType" filterable>
          <el-option
            v-for="t in props.itemTypes"
            :key="t.type"
            :label="t.typeName"
            :value="t.type"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="执行科室" prop="departmentId">
        <el-select v-model="form.departmentId" filterable>
          <el-option
            v-for="d in props.departments"
            :key="d.departmentId"
            :label="d.departmentName"
            :value="d.departmentId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input v-model="form.price" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSubmit">{{
        props.mode === 'create' ? '创建' : '保存'
      }}</el-button>
    </template>
  </el-dialog>
</template>

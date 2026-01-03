<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import type {
  CreateDrugRequest,
  DrugCategoryResponse,
  DrugDetailResponse,
  DrugUnitCode,
  UpdateDrugRequest
} from '@/types/Information/DrugCatalog'

type Mode = 'create' | 'edit'

type Form = CreateDrugRequest & Partial<UpdateDrugRequest>

const props = defineProps<{
  modelValue: boolean
  mode: Mode
  row: DrugDetailResponse | null
  categories: DrugCategoryResponse[]
  units: DrugUnitCode[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: CreateDrugRequest | UpdateDrugRequest): void
}>()

const unitLabelMap: Record<string, string> = {
  BOX: '盒',
  BOTTLE: '瓶',
  PIECE: '片',
  CAPSULE: '粒'
}

const isCreate = computed(() => props.mode === 'create')

const unitOptions = computed(() =>
  props.units.map((u) => ({ value: u, label: unitLabelMap[u] ?? u }))
)

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (visible.value = v)
)
watch(visible, (v) => emit('update:modelValue', v))

const title = computed(() =>
  props.mode === 'create' ? '新增药品' : '编辑药品'
)

const formRef = ref<FormInstance>()
const form = reactive<Form>({
  drugCode: '',
  drugName: '',
  categoryId: 0,
  productionDate: '',
  shelfLife: '',
  stockQuantity: 0,
  specification: '',
  unit: 'BOX',
  retailPrice: 0,
  description: '',
  manufacturer: ''
})

const baseRules: FormRules = {
  drugCode: [{ required: true, message: '请输入药品编码', trigger: 'blur' }],
  drugName: [{ required: true, message: '请输入药品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  productionDate: [
    { required: true, message: '请选择生产日期', trigger: 'change' }
  ],
  shelfLife: [{ required: true, message: '请输入保质期', trigger: 'blur' }],
  specification: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
  retailPrice: [{ required: true, message: '请输入零售价', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }]
}

const formRules = computed<FormRules>(() => {
  if (isCreate.value) {
    return {
      ...baseRules,
      stockQuantity: [
        { required: true, message: '请输入库存数量', trigger: 'blur' }
      ]
    }
  }
  return baseRules
})

const syncFromRow = () => {
  if (props.mode === 'create') {
    form.drugCode = ''
    form.drugName = ''
    form.categoryId = 0
    form.productionDate = ''
    form.shelfLife = ''
    form.stockQuantity = 0
    form.specification = ''
    form.unit = 'BOX'
    form.retailPrice = 0
    form.description = ''
    form.manufacturer = ''
    return
  }

  const row = props.row
  if (!row) return
  form.drugCode = row.drugCode
  form.drugName = row.drugName
  form.categoryId = row.categoryId
  form.productionDate = row.productionDate
  form.shelfLife = row.shelfLife
  form.stockQuantity = Number(row.stockQuantity)
  form.specification = row.specification
  form.unit = row.unit
  form.retailPrice = Number(row.retailPrice)
  form.description = row.description
  form.manufacturer = row.manufacturer
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

  if (props.mode === 'create') {
    emit('submit', {
      drugCode: form.drugCode,
      drugName: form.drugName,
      categoryId: Number(form.categoryId),
      productionDate: form.productionDate,
      shelfLife: form.shelfLife,
      stockQuantity: Number(form.stockQuantity),
      specification: form.specification,
      unit: form.unit,
      retailPrice: Number(form.retailPrice),
      description: form.description,
      manufacturer: form.manufacturer
    })
    return
  }

  emit('submit', {
    drugCode: form.drugCode,
    drugName: form.drugName,
    categoryId: Number(form.categoryId),
    productionDate: form.productionDate,
    shelfLife: form.shelfLife,
    specification: form.specification,
    unit: form.unit,
    retailPrice: Number(form.retailPrice),
    description: form.description,
    manufacturer: form.manufacturer
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
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="药品编码" prop="drugCode">
        <el-input v-model="form.drugCode" />
      </el-form-item>
      <el-form-item label="药品名称" prop="drugName">
        <el-input v-model="form.drugName" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="form.categoryId" filterable>
          <el-option
            v-for="c in props.categories"
            :key="c.categoryId"
            :label="c.categoryName"
            :value="c.categoryId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生产日期" prop="productionDate">
        <el-date-picker
          v-model="form.productionDate"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="保质期" prop="shelfLife">
        <el-input v-model="form.shelfLife" placeholder="如：24个月" />
      </el-form-item>
      <el-form-item v-if="isCreate" label="库存" prop="stockQuantity">
        <el-input v-model="form.stockQuantity" />
      </el-form-item>
      <el-form-item label="规格" prop="specification">
        <el-input v-model="form.specification" />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-select v-model="form.unit" filterable>
          <el-option
            v-for="u in unitOptions"
            :key="u.value"
            :label="u.label"
            :value="u.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="零售价" prop="retailPrice">
        <el-input v-model="form.retailPrice" />
      </el-form-item>
      <el-form-item label="生产厂家" prop="manufacturer">
        <el-input v-model="form.manufacturer" />
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

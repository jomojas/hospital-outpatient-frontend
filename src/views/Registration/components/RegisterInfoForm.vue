<script setup lang="ts">
import { ref, watch, onMounted, defineExpose } from 'vue'
import type { FormInstance } from 'element-plus'
import { CloseBold } from '@element-plus/icons-vue'
import { useDepartmentAndDoctors } from '@/composables/useDepartmentAndDoctors'
import {
  listNoonSessions,
  listNumberTypes,
  listPaymentMethods,
  listSettlementCategories
} from '@/api/modules/Registration/Register'
import type {
  NumberType,
  PaymentMethod,
  SettlementCategory,
  NoonSession
} from '@/api/modules/Registration/Register'

const props = defineProps<{
  modelValue: any
}>()
const emit = defineEmits(['update:modelValue'])

const formRef = ref<FormInstance>()
defineExpose({ formRef }) // 暴露表单实例给父组件

// 保证cascaderValue有默认值，且与父组件单向同步
const form = ref({ ...props.modelValue, cascaderValue: [] })

watch(
  () => props.modelValue,
  (val) => {
    // 只更新除 cascaderValue 以外的字段，cascaderValue 保持自身状态
    form.value = { ...val, cascaderValue: form.value.cascaderValue }
  }
)

// 监听 cascaderValue，自动同步 departmentId/doctorId
watch(
  () => form.value.cascaderValue,
  (val) => {
    if (Array.isArray(val) && val.length === 2) {
      form.value.departmentId = val[0]
      form.value.doctorId = val[1]
    } else {
      form.value.departmentId = null
      form.value.doctorId = null
    }
  }
)

// 监听 form 的所有字段变化，emit 只回传 registerInfo 需要的字段
watch(
  form,
  (val) => {
    const { cascaderValue, ...rest } = val
    if (JSON.stringify(rest) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', rest)
    }
  },
  { deep: true }
)

const { fetchDepartments, fetchDoctors } = useDepartmentAndDoctors()

const cascaderOptions = ref<
  Array<{
    label: string
    value: number
    children: Array<{
      label: string
      value: number
      doctor: any
    }>
  }>
>([])

const numberTypes = ref<NumberType[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const settlementCategories = ref<SettlementCategory[]>([])
const noonSessions = ref<NoonSession[]>([])

// 选择号别时自动带出应收金额
watch(
  [() => form.value.numberType, numberTypes],
  ([numberTypeVal, numberTypesVal]) => {
    if (!numberTypeVal) {
      form.value.payableAmount = 0
      return
    }
    const selected = numberTypesVal.find((n) => n.numberType === numberTypeVal)
    form.value.payableAmount = selected ? selected.fee : 0
  }
)

onMounted(async () => {
  noonSessions.value = (await listNoonSessions()) || []
  numberTypes.value = (await listNumberTypes()) || []
  paymentMethods.value = (await listPaymentMethods()) || []
  settlementCategories.value = (await listSettlementCategories()) || []

  // 1. 获取所有科室
  const departments = (await fetchDepartments('OUTPATIENT')) || []

  // 2. 并发获取每个科室下的医生
  const doctorPromises = departments.map((dept) =>
    fetchDoctors(dept.departmentId).then((docs) => ({
      departmentId: dept.departmentId,
      doctors: docs || []
    }))
  )
  const doctorsByDept = await Promise.all(doctorPromises)

  // 3. 组装 cascaderOptions
  cascaderOptions.value = departments.map((dept) => {
    const deptDoctors =
      doctorsByDept.find((d) => d.departmentId === dept.departmentId)
        ?.doctors || []
    return {
      label: dept.departmentName,
      value: dept.departmentId,
      children: deptDoctors.map((doc) => ({
        label: doc.name,
        value: doc.staffId,
        doctor: doc
      }))
    }
  })
})

const rules = {
  cascaderValue: [
    { required: true, message: '请选择科室和医生', trigger: 'change' }
  ],
  visitDate: [{ required: true, message: '请选择就诊日期', trigger: 'change' }],
  period: [{ required: true, message: '请选择时段', trigger: 'change' }],
  numberType: [{ required: true, message: '请选择号别', trigger: 'change' }],
  settlementTypeId: [
    { required: true, message: '请选择结算类型', trigger: 'change' }
  ],
  paymentMethodId: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ],
  payableAmount: [
    { required: true, message: '请输入应收金额', trigger: 'blur' }
  ]
}
</script>

<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
    <el-form-item label="科室/医生" prop="cascaderValue">
      <el-cascader
        v-model="form.cascaderValue"
        :options="cascaderOptions"
        :props="{
          checkStrictly: true
        }"
        clearable
        :clear-icon="CloseBold"
        placeholder="请选择科室和医生"
      />
    </el-form-item>
    <el-form-item label="就诊日期" prop="visitDate">
      <el-date-picker
        v-model="form.visitDate"
        type="date"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>
    <el-form-item label="时段" prop="period">
      <el-select v-model="form.period" placeholder="请选择时段">
        <el-option
          v-for="n in noonSessions"
          :key="n.code"
          :label="n.label"
          :value="n.code"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="号别" prop="numberType">
      <el-select v-model="form.numberType" placeholder="请选择号别">
        <el-option
          v-for="n in numberTypes"
          :key="n.numberType"
          :label="n.displayName"
          :value="n.numberType"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="结算类型" prop="settlementTypeId">
      <el-select v-model="form.settlementTypeId" placeholder="请选择结算类型">
        <el-option
          v-for="s in settlementCategories"
          :key="s.settlementTypeId"
          :label="s.name"
          :value="s.settlementTypeId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="支付方式" prop="paymentMethodId">
      <el-select v-model="form.paymentMethodId" placeholder="请选择支付方式">
        <el-option
          v-for="p in paymentMethods"
          :key="p.paymentMethodId"
          :label="p.name"
          :value="p.paymentMethodId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="应收金额" prop="payableAmount">
      <el-input-number v-model="form.payableAmount" :min="0" :disabled="true" />
    </el-form-item>
    <el-form-item label="病历本" prop="medicalRecordBook">
      <el-switch
        v-model="form.medicalRecordBook"
        :active-value="1"
        :inactive-value="0"
      />
    </el-form-item>
  </el-form>
</template>

<style scoped></style>

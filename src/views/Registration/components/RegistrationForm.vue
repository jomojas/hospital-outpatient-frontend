<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  listDepartments,
  listDoctorsByDepartment,
  listSettlementCategories,
  listPaymentMethods,
  listNumberTypes,
  listNoonSessions
} from '@/api/modules/Registration/Register'
import type {
  Department,
  Doctor,
  SettlementCategory,
  PaymentMethod,
  NumberType,
  NoonSession,
  RegistrationPayload
} from '@/api/modules/Registration/Register'
import type { FormInstance } from 'element-plus'

// Form data
const registrationPayload = reactive<RegistrationPayload>({
  patientId: 0,
  departmentId: 0,
  doctorId: 0,
  visitDate: '',
  period: '',
  numberType: '',
  initQuota: 0,
  usedQuota: 0,
  settlementTypeId: 0,
  paymentMethodId: 0,
  payableAmount: 0,
  medicalRecordBook: 0
})

// Form rules
const rules = {
  departmentDoctor: [
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
  ]
}

// Cascader props for department and doctor selection
const cascaderProps = {
  value: 'departmentId',
  label: 'departmentName',
  children: 'doctors'
}

// State for dropdowns and cascader
const departmentDoctorOptions = ref<Department[]>([])
const noonSessions = ref<NoonSession[]>([])
const numberTypes = ref<NumberType[]>([])
const settlementCategories = ref<SettlementCategory[]>([])
const paymentMethods = ref<PaymentMethod[]>([])

// Selected department and doctor (for cascader)
const selectedDepartmentDoctor = ref(null)

// Fetch data on component mount
onMounted(async () => {
  const departments = await listDepartments('someType') // Replace 'someType' with the actual type
  departmentDoctorOptions.value = await Promise.all(
    departments.map(async (department) => ({
      ...department,
      doctors: await listDoctorsByDepartment(department.departmentId)
    }))
  )
  noonSessions.value = await listNoonSessions()
  numberTypes.value = await listNumberTypes()
  settlementCategories.value = await listSettlementCategories()
  paymentMethods.value = await listPaymentMethods()
})

// Handle cascader selection
function handleDepartmentDoctorChange(value: (number | undefined)[]) {
  registrationPayload.departmentId = value[0] || 0 // Assign 0 if no department selected
  registrationPayload.doctorId = value[1] || 0 // Assign 0 if no doctor selected
}

// Handle number type selection
function handleNumberTypeChange(value: string) {
  const selectedNumberType = numberTypes.value.find(
    (item) => item.numberType === value
  )
  registrationPayload.payableAmount = selectedNumberType
    ? selectedNumberType.fee
    : 0
}

// Reset form
function resetForm() {
  registrationPayload.departmentId = 0 // Reset to 0
  registrationPayload.doctorId = 0 // Reset to 0
  registrationPayload.visitDate = '' // Reset to empty string
  registrationPayload.period = '' // Reset to empty string
  registrationPayload.numberType = '' // Reset to empty string
  registrationPayload.settlementTypeId = 0 // Reset to 0
  registrationPayload.paymentMethodId = 0 // Reset to 0
  registrationPayload.payableAmount = 0 // Reset to 0
}

// Submit form

function submitForm() {
  const form = ref<FormInstance | null>(null) // Explicitly type the form reference

  form.value?.validate((valid: boolean) => {
    // Explicitly type "valid" as boolean
    if (valid) {
      console.log('Submitting registration:', registrationPayload)
      emit('register', registrationPayload) // Emit to parent
    } else {
      console.log('Validation failed!')
    }
  })
}

// Emit event
const emit = defineEmits(['register'])
</script>

<template>
  <el-form
    :model="registrationPayload"
    :rules="rules"
    ref="registrationForm"
    label-width="120px"
  >
    <!-- Department and Doctor Selection -->
    <el-form-item label="科室 / 医生" prop="departmentDoctor">
      <el-cascader
        v-model="selectedDepartmentDoctor"
        :options="departmentDoctorOptions"
        :props="cascaderProps"
        placeholder="请选择科室和医生"
        @change="handleDepartmentDoctorChange"
      />
    </el-form-item>

    <!-- Visit Date -->
    <el-form-item label="就诊日期" prop="visitDate">
      <el-date-picker
        v-model="registrationPayload.visitDate"
        type="date"
        placeholder="选择就诊日期"
      />
    </el-form-item>

    <!-- Noon Session -->
    <el-form-item label="时段" prop="period">
      <el-select v-model="registrationPayload.period" placeholder="选择时段">
        <el-option
          v-for="session in noonSessions"
          :key="session.code"
          :label="session.label"
          :value="session.code"
        />
      </el-select>
    </el-form-item>

    <!-- Number Type -->
    <el-form-item label="号别" prop="numberType">
      <el-select
        v-model="registrationPayload.numberType"
        placeholder="选择号别"
        @change="handleNumberTypeChange"
      >
        <el-option
          v-for="numberType in numberTypes"
          :key="numberType.numberType"
          :label="`${numberType.displayName} (费用: ¥${numberType.fee})`"
          :value="numberType.numberType"
        />
      </el-select>
    </el-form-item>

    <!-- Settlement Type -->
    <el-form-item label="结算类型" prop="settlementTypeId">
      <el-select
        v-model="registrationPayload.settlementTypeId"
        placeholder="选择结算类型"
      >
        <el-option
          v-for="settlement in settlementCategories"
          :key="settlement.settlementTypeId"
          :label="settlement.name"
          :value="settlement.settlementTypeId"
        />
      </el-select>
    </el-form-item>

    <!-- Payment Method -->
    <el-form-item label="支付方式" prop="paymentMethodId">
      <el-select
        v-model="registrationPayload.paymentMethodId"
        placeholder="选择支付方式"
      >
        <el-option
          v-for="paymentMethod in paymentMethods"
          :key="paymentMethod.paymentMethodId"
          :label="paymentMethod.name"
          :value="paymentMethod.paymentMethodId"
        />
      </el-select>
    </el-form-item>

    <!-- Non-editable Fields -->
    <el-form-item label="初始配额" prop="initQuota">
      <el-input v-model="registrationPayload.initQuota" disabled />
    </el-form-item>
    <el-form-item label="已用配额" prop="usedQuota">
      <el-input v-model="registrationPayload.usedQuota" disabled />
    </el-form-item>
    <el-form-item label="应付金额" prop="payableAmount">
      <el-input v-model="registrationPayload.payableAmount" disabled />
    </el-form-item>

    <!-- Buttons -->
    <el-form-item>
      <el-button @click="resetForm">重置</el-button>
      <el-button type="primary" @click="submitForm">挂号</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped></style>

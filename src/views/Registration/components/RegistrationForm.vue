<script setup lang="ts">
import { ref, reactive, onMounted, defineProps, toRaw, watch } from 'vue'
import {
  listDepartments,
  listDoctorsByDepartment,
  listSettlementCategories,
  listPaymentMethods,
  listNumberTypes,
  listNoonSessions
} from '@/api/modules/Registration/Register'
import type {
  SettlementCategory,
  PaymentMethod,
  NumberType,
  NoonSession
} from '@/api/modules/Registration/Register'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  patientId: number | undefined
}>()

// Emit event
const emit = defineEmits(['register', 'update:modelValue'])

const registrationForm = ref() // Form reference

// Form data
const registrationPayload = reactive({
  patientId: props.patientId || 0,
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
  medicalRecordBook: 0,
  selectedDepartmentDoctor: [] // Include selectedDepartmentDoctor here
})

// Watch for changes in props.patientId and update registrationPayload.patientId
watch(
  () => props.patientId,
  (newValue) => {
    if (newValue !== undefined) {
      registrationPayload.patientId = newValue
      console.log(
        'Updated registrationPayload.patientId:',
        registrationPayload.patientId
      )
    }
  }
)

// Watch for changes in selected doctor (registrationPayload.doctorId)
watch(
  () => registrationPayload.doctorId,
  (newDoctorId) => {
    if (newDoctorId && doctorsMap.value[newDoctorId]) {
      // Retrieve doctor details from doctorsMap
      const selectedDoctor = doctorsMap.value[newDoctorId]

      // Update registrationPayload with doctor details
      registrationPayload.initQuota = selectedDoctor.initQuota
      registrationPayload.usedQuota = selectedDoctor.usedQuota

      console.log('Updated registrationPayload:', registrationPayload)
    } else {
      console.warn('Doctor details not found for staffId:', newDoctorId)
      registrationPayload.initQuota = 0
      registrationPayload.usedQuota = 0
    }
  }
)

// Form rules
// const rules = {
//   // departmentDoctor: [
//   //   { required: true, message: '请选择科室和医生', trigger: 'change' }
//   // ],
//   // visitDate: [{ required: true, message: '请选择就诊日期', trigger: 'change' }],
//   // period: [{ required: true, message: '请选择时段', trigger: 'change' }],
//   // numberType: [{ required: true, message: '请选择号别', trigger: 'change' }],
//   // settlementTypeId: [
//   //   { required: true, message: '请选择结算类型', trigger: 'change' }
//   // ],
//   // paymentMethodId: [
//   //   { required: true, message: '请选择支付方式', trigger: 'change' }
//   // ]
// }

// Cascader props for department and doctor selection
// const cascaderProps = {
//   value: 'departmentId',
//   label: 'departmentName',
//   children: 'doctors'
// }

// Define interfaces for cascader options
interface CascaderOption {
  value: number
  label: string
  children: { value: number; label: string }[]
}

// State for dropdowns and cascader
const departmentDoctorOptions = ref<CascaderOption[]>([])
const noonSessions = ref<NoonSession[]>([])
const numberTypes = ref<NumberType[]>([])
const settlementCategories = ref<SettlementCategory[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const doctorsMap = ref<Record<number, any>>({})
// Selected department and doctor (for cascader)
// const selectedDepartmentDoctor = ref([])

// Fetch data on component mount
onMounted(async () => {
  const departments = await listDepartments('OUTPATIENT') // Replace 'OUTPATIENT' with the actual type
  // Populate departmentDoctorOptions and doctorsMap
  departmentDoctorOptions.value = await Promise.all(
    departments.map(async (department) => {
      const doctors = await listDoctorsByDepartment(department.departmentId)

      // Store doctor details in doctorsMap
      doctors.forEach((doctor) => {
        doctorsMap.value[doctor.staffId] = doctor // Key is staffId, value is doctor details
      })

      return {
        value: department.departmentId, // Use `value` as the unique identifier
        label: department.departmentName, // Use `label` as the display name
        children: doctors.map((doctor) => ({
          value: doctor.staffId, // Doctor's unique identifier
          label: doctor.name // Display doctor's name
        }))
      }
    })
  )
  noonSessions.value = await listNoonSessions()
  numberTypes.value = await listNumberTypes()
  settlementCategories.value = await listSettlementCategories()
  paymentMethods.value = await listPaymentMethods()
})

// Handle cascader selection
function handleDepartmentDoctorChange() {
  registrationPayload.departmentId =
    registrationPayload.selectedDepartmentDoctor[0] || 0
  registrationPayload.doctorId =
    registrationPayload.selectedDepartmentDoctor[1] || 0
  // console.log('Updated departmentId:', registrationPayload.departmentId)
  // console.log('Updated doctorId:', registrationPayload.doctorId)
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

const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}

// Submit form
function submitForm() {
  console.log('Current registrationPayload:', registrationPayload)
  // Extract and update departmentId and doctorId before submission
  registrationPayload.departmentId =
    registrationPayload.selectedDepartmentDoctor[0] || 0
  console.log('departmentId:', registrationPayload.departmentId)
  registrationPayload.doctorId =
    registrationPayload.selectedDepartmentDoctor[1] || 0
  console.log('doctorId:', registrationPayload.doctorId)

  console.log(
    'Current registrationPayload (plain object):',
    JSON.stringify(toRaw(registrationPayload))
  )
  console.log(
    'registrationPayLoad ISingle Fields',
    registrationPayload.patientId,
    registrationPayload.departmentId,
    registrationPayload.doctorId,
    registrationPayload.visitDate,
    registrationPayload.period,
    registrationPayload.numberType,
    registrationPayload.settlementTypeId,
    registrationPayload.paymentMethodId,
    registrationPayload.medicalRecordBook
  )

  registrationForm.value?.validate((valid: boolean) => {
    console.log('Form validation result:', valid) // Debug log
    if (valid) {
      // Emit only the necessary registrationPayload data
      console.log('Submitting registration:', registrationPayload)
      emit('register', {
        ...registrationPayload,
        selectedDepartmentDoctor: undefined
      }) // Emit to parent
      resetForm() // Reset the form to initial state
      emit('update:modelValue', false) // Close the dialog
    } else {
      console.log('Validation failed!')
    }
  })
}
</script>

<template>
  <el-dialog
    :model-value="props.modelValue"
    title="挂号信息"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      :model="registrationPayload"
      ref="registrationForm"
      label-width="120px"
    >
      <!-- Department and Doctor Selection -->
      <el-form-item label="科室 / 医生" prop="departmentDoctor">
        <el-cascader
          v-model="registrationPayload.selectedDepartmentDoctor"
          :options="departmentDoctorOptions"
          :props="{ value: 'value', label: 'label', children: 'children' }"
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
          value-format="YYYY-MM-DD"
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
      <el-form-item label="是否有病历本" prop="medicalRecordBook">
        <el-switch v-model="registrationPayload.medicalRecordBook" />
      </el-form-item>

      <!-- Buttons -->
      <el-form-item>
        <el-button @click="handleCancel">取消</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="submitForm">挂号</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped></style>

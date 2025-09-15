<script setup lang="ts">
import { ref, toRaw } from 'vue'
import PatientSearch from './components/PatientSearch.vue'
import PatientCard from './components/PatientCard.vue'
import AddPatientDialog from './components/AddPatientDialog.vue'
import RegistrationForm from './components/RegistrationForm.vue'
import RegistrationCard from './components/RegistrationCard.vue'
import type {
  RegistrationPayload,
  PatientRequest,
  PatientInfo,
  RegistrationResult
} from '@/api/modules/Registration/Register'
import {
  createRegistration,
  searchPatient,
  createPatient
} from '@/api/modules/Registration/Register'

// State for patient search
const patientFound = ref(false)
// const patientInfo = ref<PatientInfo | null>(null) // Initialize as null
const patientInfo = ref<Partial<PatientInfo>>({})

const registrationResult = ref<RegistrationResult | null>(null)

const addPatientDialogVisible = ref(false)
const addRegistrationFormVisible = ref(false)
const registrationCardVisible = ref(false)

// Open AddPatientDialog
function openAddPatientDialog() {
  addPatientDialogVisible.value = true
  console.log('Add Patient Dialog opened')
}

// Mapping for period localization
const periodMap: Record<string, string> = {
  MORNING: '上午',
  AFTERNOON: '下午',
  EVENING: '晚上'
}

// Mapping for numberType localization
const numberTypeMap: Record<string, string> = {
  GENERAL: '普通号',
  SPECIALIST: '专家号'
}

// Handle registration creation
async function handleRegister(payload: RegistrationPayload) {
  try {
    const transformedPayload = {
      ...payload,
      medicalRecordBook: payload.medicalRecordBook ? 1 : 0 // Convert Boolean to Integer
    }
    console.log('Creating registration with payload:', transformedPayload)
    const response = await createRegistration(transformedPayload) // Call the backend API
    if (response) {
      alert('挂号成功！') // Notify the user of success
      // Localize period and numberType
      response.period = periodMap[response.period] || response.period // Convert period to Chinese
      response.numberType =
        numberTypeMap[response.numberType] || response.numberType // Convert numberType to Chinese

      registrationResult.value = response
      registrationCardVisible.value = true // Show the registration Card
    } else {
      alert('挂号失败，请重试！') // Notify the user of failure
    }
  } catch (error) {
    console.error('Failed to create registration:', error) // Log the error
    alert('挂号时发生错误，请重试！') // Notify the user of an error
  }
}

// Method to search for a patient
async function handleSearchPatient(query: { name: string; idCard: string }) {
  try {
    const response = await searchPatient(query) // Call the backend API
    console.log('Search Patient response:', response)
    if (response && response.length > 0) {
      patientInfo.value = response[0]
      console.log('Patient found:', patientInfo.value)
      patientFound.value = true
    } else {
      patientInfo.value = {}
      patientFound.value = false
    }
  } catch (error) {
    console.error('Failed to search for patient:', error)
    alert('搜索患者失败，请重试！')
  }
}

// Method to create a new patient
async function handleCreatePatient(patientData: PatientRequest) {
  try {
    const response = await createPatient(patientData) // Call the backend API
    if (response && typeof response.patientId === 'number') {
      console.log('Patient created with ID:', response)
      alert('患者创建成功！')
      patientInfo.value = {
        ...patientData,
        patientId: toRaw(response.patientId) // Assign the patient ID from API response
      }
      patientFound.value = true // Update state to indicate the patient has been created
    } else {
      alert('患者创建失败，请重试！')
    }
  } catch (error) {
    console.error('Failed to create patient:', error)
    alert('创建患者时发生错误，请重试！')
  }
}

// Method to open the registration form
function handleOpenRegisterForm(patientId: number | undefined) {
  if (patientId) {
    console.log('Opening registration form for patient ID:', patientId)
    patientInfo.value.patientId = patientId // Ensure patientId is set
    addRegistrationFormVisible.value = true
    console.log('addRegistrationFormVisible:', addRegistrationFormVisible.value)
  } else {
    alert('无效的患者ID，无法打开挂号表单！')
  }
}
</script>

<template>
  <div class="register-page">
    <!-- Patient Search -->
    <PatientSearch @search="handleSearchPatient" />

    <!-- Patient Card -->
    <PatientCard
      :patientFound="patientFound"
      :patientInfo="patientInfo"
      @add-patient="openAddPatientDialog"
      @open-register="handleOpenRegisterForm"
    />

    <!-- Add Patient Dialog -->
    <AddPatientDialog
      v-model="addPatientDialogVisible"
      @save="handleCreatePatient"
    />

    <!-- Registration Form -->
    <RegistrationForm
      v-model="addRegistrationFormVisible"
      :patientId="patientInfo?.patientId"
      @register="handleRegister"
    />

    <!-- Registration Card -->
    <RegistrationCard
      :visible="registrationCardVisible"
      :registration="registrationResult"
    />
  </div>
</template>

<style scoped lang="scss">
.register-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>

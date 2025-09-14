<script setup lang="ts">
import { ref, reactive } from 'vue'
import PatientSearch from './components/PatientSearch.vue'
import PatientCard from './components/PatientCard.vue'
import AddPatientDialog from './components/AddPatientDialog.vue'
import RegistrationForm from './components/RegistrationForm.vue'
import RegistrationCard from './components/RegistrationCard.vue'
import type {
  RegistrationPayload,
  PatientRequest
} from '@/api/modules/Registration/Register'
import {
  createRegistration,
  searchPatient,
  createPatient
} from '@/api/modules/Registration/Register'

// State for patient search
const patientFound = ref(false)
const patientInfo = ref<Record<string, any> | undefined>(undefined)

// State for registration
const registration = ref<RegistrationPayload | null>(null)

// State for AddPatientDialog visibility
const addPatientDialogVisible = ref(false)

// Open AddPatientDialog
function openAddPatientDialog() {
  addPatientDialogVisible.value = true
}

// Handle patient addition
function handlePatientAdded(newPatientInfo: any) {
  patientInfo.value = newPatientInfo
  patientFound.value = true
  addPatientDialogVisible.value = false
}

// Handle registration creation
async function handleRegister(payload: RegistrationPayload) {
  try {
    const response = await createRegistration(payload) // Call the backend API
    if (response) {
      alert('挂号成功！') // Notify the user of success
      registration.value = payload // Update the registration state
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
    if (response) {
      patientInfo.value = response[0]
      console.log('Patient found:', patientInfo.value)
      patientFound.value = true
    } else {
      patientInfo.value = undefined
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
    if (response) {
      alert('患者创建成功！')
      patientInfo.value = {
        ...patientData,
        patientId: response // Assign the patient ID from API response
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
    // patientFound.value = true
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
      v-if="addPatientDialogVisible"
      @save="handlePatientAdded"
    />

    <!-- Registration Form -->
    <RegistrationForm
      v-if="patientFound && !registration"
      @register="handleRegister"
    />

    <!-- Registration Card -->
    <RegistrationCard v-if="registration" :registration="registration" />
  </div>
</template>

<style scoped lang="scss">
.register-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>

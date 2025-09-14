<script setup lang="ts">
import { ref } from 'vue'
import PatientInfoForm from '@/views/Registration/components/PatientInfoForm.vue'
import RegisterInfoForm from '@/views/Registration/components/RegisterInfoForm.vue'
import {
  searchPatient,
  createPatient,
  createRegistration,
  generatePatientNo
} from '@/api/modules/Registration/Register'
import { ElMessage, type FormInstance } from 'element-plus'

type ExposedFormRef = { formRef: FormInstance }

const searchFormRef = ref<FormInstance>()
const patientInfoFormRef = ref<ExposedFormRef | null>(null)
const registerInfoFormRef = ref<ExposedFormRef | null>(null)
// 搜索表单
const searchForm = ref({
  name: '',
  idCard: ''
})
// 搜索表单校验规则
const searchRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    {
      pattern: /^[0-9A-Z]+$/,
      message: '身份证号只能为数字和大写字母',
      trigger: 'blur'
    }
  ]
}

// 患者基本信息
const patientInfo = ref({
  patientNo: '',
  name: '',
  gender: '',
  birthday: '',
  idCard: '',
  address: ''
})
const isEdit = ref(false)
const currentPatientId = ref<number | null>(null)

// 挂号信息
const registerInfo = ref<{
  patientId: number | null
  departmentId: number | null
  doctorId: number | null
  visitDate: string
  period: string
  numberType: string
  initQuota: number
  usedQuota: number
  settlementTypeId: number | null
  paymentMethodId: number | null
  payableAmount: number
  medicalRecordBook: number
}>({
  patientId: null,
  departmentId: null,
  doctorId: null,
  visitDate: '',
  period: '',
  numberType: '',
  initQuota: 0,
  usedQuota: 0,
  settlementTypeId: null,
  paymentMethodId: null,
  payableAmount: 0,
  medicalRecordBook: 0
})

// 查询患者
const onSearchPatient = async () => {
  searchFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    const res = await searchPatient({
      name: searchForm.value.name,
      idCard: searchForm.value.idCard
    })
    if (res && Array.isArray(res) && res.length > 0) {
      patientInfo.value = res[0]
      currentPatientId.value = res[0].patientId
      isEdit.value = true
    } else {
      // 未查到，先获取病历号
      const noRes = await generatePatientNo()
      patientInfo.value = {
        patientNo: noRes.patientNo || '',
        name: searchForm.value.name,
        gender: '',
        birthday: '',
        idCard: searchForm.value.idCard,
        address: ''
      }
      currentPatientId.value = null
      isEdit.value = false
      ElMessage.info('未找到该患者，请手动录入信息')
    }
  })
}

// 校验所有表单（患者和挂号信息）
const validateForms = async () => {
  return Promise.all([
    patientInfoFormRef.value?.formRef?.validate?.(),
    registerInfoFormRef.value?.formRef?.validate?.()
  ]).then((results) => results.every(Boolean))
}

// 挂号
const onRegister = async () => {
  // 校验患者表单和挂号表单
  const valid = await validateForms()
  if (!valid) {
    ElMessage.warning('请完善表单信息')
    return
  }

  let pid = currentPatientId.value
  if (!pid) {
    console.log('新增患者:', patientInfo.value)
    const patientRes = await createPatient(patientInfo.value)
    console.log('patientRes:', patientRes)
    if (patientRes) {
      pid = patientRes
      currentPatientId.value = pid
    } else {
      ElMessage.error('新增患者失败')
      return
    }
  }
  // 组装挂号请求体
  const regPayload = { ...registerInfo.value, patientId: pid }
  const regRes = await createRegistration(regPayload)
  if (regRes) {
    ElMessage.success('挂号成功')
    // 其他后续操作
  } else {
    ElMessage.error('挂号失败')
  }
}
</script>

<template>
  <div class="charge-container">
    <!-- 搜索患者表单 -->
    <el-form
      :inline="true"
      :model="searchForm"
      :rules="searchRules"
      ref="searchFormRef"
      class="search-form"
    >
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入患者姓名" />
      </el-form-item>
      <el-form-item label="身份证号">
        <el-input v-model="searchForm.idCard" placeholder="请输入身份证号" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearchPatient">搜索</el-button>
      </el-form-item>
    </el-form>

    <!-- 患者基本信息表单 -->
    <patient-info-form
      ref="patientInfoFormRef"
      v-model="patientInfo"
      :is-edit="isEdit"
    />

    <!-- 挂号信息表单 -->
    <register-info-form ref="registerInfoFormRef" v-model="registerInfo" />

    <!-- 挂号按钮 -->
    <div style="margin-top: 24px; text-align: right">
      <el-button type="primary" @click="onRegister">挂号</el-button>
    </div>
  </div>
</template>

<style scoped>
.charge-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.search-form {
  margin-bottom: 24px;
}
</style>

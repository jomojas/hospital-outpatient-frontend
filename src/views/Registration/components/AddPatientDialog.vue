<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { generatePatientNo } from '@/api/modules/Registration/Register'
import type { PatientRequest } from '@/api/modules/Registration/Register'

// Patient info request data
const newPatientInfo = ref<PatientRequest>({
  patientNo: '',
  name: '',
  gender: '',
  birthday: '',
  idCard: '',
  address: ''
})

// Dialog visibility state
const dialogVisible = ref(false)

// Validation rules
const rules = {
  patientNo: [{ required: true, message: '患者编号不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthday: [{ required: true, message: '生日不能为空', trigger: 'change' }],
  idCard: [
    { required: true, message: '身份证号不能为空', trigger: 'blur' },
    {
      type: 'string',
      pattern: /^\d+$/,
      message: '身份证号必须为数字',
      trigger: 'blur'
    }
  ],
  address: [{ required: false }]
}

// Reference to the form
const addPatientForm = ref()

// Generate patient number
async function getGeneratedPatientNo() {
  try {
    const response = await generatePatientNo()
    newPatientInfo.value.patientNo = response.patientNo
  } catch (error) {
    console.error('Failed to generate patient number:', error)
    alert('生成患者编号失败，请重试！')
  }
}

// Submit patient info
function submitPatient() {
  addPatientForm.value.validate((valid: boolean) => {
    if (valid) {
      console.log('Submitting new patient info:', newPatientInfo.value)
      emit('save', newPatientInfo.value) // Emit event to parent
      dialogVisible.value = false // Close dialog after saving
    } else {
      console.log('Validation failed!')
    }
  })
}

// Event emitter
const emit = defineEmits(['save'])

onMounted(() => {
  getGeneratedPatientNo() // Generate patient number on mount
})
</script>

<template>
  <el-dialog :visible.sync="dialogVisible" title="新增患者信息">
    <el-form
      :model="newPatientInfo"
      :rules="rules"
      ref="addPatientForm"
      label-width="100px"
    >
      <el-form-item label="患者编号" prop="patientNo">
        <el-input
          v-model="newPatientInfo.patientNo"
          placeholder="自动生成患者编号"
          disabled
        />
        <el-button type="primary" @click="generatePatientNo"
          >生成患者编号</el-button
        >
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="newPatientInfo.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="newPatientInfo.gender" placeholder="选择性别">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="newPatientInfo.birthday"
          placeholder="选择生日"
        />
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard">
        <el-input
          v-model="newPatientInfo.idCard"
          placeholder="请输入身份证号"
        />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="newPatientInfo.address" placeholder="请输入地址" />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitPatient">保存</el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.patient-form {
  padding: 20px;
}
</style>

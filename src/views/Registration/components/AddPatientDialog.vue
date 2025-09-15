<script setup lang="ts">
import { onMounted, ref, defineProps, reactive } from 'vue'
import { generatePatientNo } from '@/api/modules/Registration/Register'

const props = defineProps<{
  modelValue: boolean
}>()

// Event emitter
const emit = defineEmits(['save', 'update:modelValue'])
// Patient info request data
const newPatientInfoForm = reactive({
  patientNo: '',
  name: '',
  gender: '',
  birthday: '',
  idCard: '',
  address: ''
})

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

const formRef = ref()

// Generate patient number
async function getGeneratedPatientNo() {
  try {
    const response = await generatePatientNo()
    newPatientInfoForm.patientNo = response.patientNo
  } catch (error) {
    console.error('Failed to generate patient number:', error)
    alert('生成患者编号失败，请重试！')
  }
}

const resetForm = () => {
  newPatientInfoForm.patientNo = ''
  newPatientInfoForm.name = ''
  newPatientInfoForm.gender = ''
  newPatientInfoForm.birthday = ''
  newPatientInfoForm.idCard = ''
  newPatientInfoForm.address = ''
}

const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}

// Submit patient info
function submitPatient() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      console.log('Submitting new patient info:', newPatientInfoForm)
      emit('save', newPatientInfoForm) // Emit event to parent
      emit('update:modelValue', false)
    } else {
      console.log('Validation failed!')
    }
  })
}

onMounted(() => {
  getGeneratedPatientNo() // Generate patient number on mount
})
</script>

<template>
  <el-dialog
    :model-value="props.modelValue"
    title="新增患者信息"
    :before-close="handleClose"
  >
    <el-form
      :model="newPatientInfoForm"
      :rules="rules"
      ref="formRef"
      label-width="100px"
    >
      <el-form-item label="患者编号" prop="patientNo">
        <el-input
          v-model="newPatientInfoForm.patientNo"
          placeholder="自动生成患者编号"
          disabled
        />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="newPatientInfoForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="newPatientInfoForm.gender" placeholder="选择性别">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="newPatientInfoForm.birthday"
          placeholder="选择生日"
          type="date"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard">
        <el-input
          v-model="newPatientInfoForm.idCard"
          placeholder="请输入身份证号"
        />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input
          v-model="newPatientInfoForm.address"
          placeholder="请输入地址"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="submitPatient">保存</el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.patient-form {
  padding: 20px;
}
</style>

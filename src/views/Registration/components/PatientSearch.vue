<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref({
  name: '',
  idCard: ''
})

// Rules for validation
const rules = {
  name: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { type: 'number', message: '身份证号必须为数字', trigger: 'blur' }
  ]
}

// Reference to the form
const searchForm = ref()

// Method to handle search
function searchPatient() {
  searchForm.value.validate((valid: boolean) => {
    if (valid) {
      console.log('Searching for patient:', searchQuery.value)
      // Emit search query to parent
      emit('search', searchQuery.value)
    } else {
      console.log('Validation failed!')
    }
  })
}

// Event emitter
const emit = defineEmits(['search'])

// Method to reset the form
function resetForm() {
  searchForm.value.resetFields()
}
</script>

<template>
  <el-form
    :model="searchQuery"
    :rules="rules"
    ref="searchForm"
    label-width="100px"
  >
    <el-form-item label="患者姓名" prop="name">
      <el-input
        v-model="searchQuery.name"
        placeholder="请输入患者姓名"
        clearable
      />
    </el-form-item>
    <el-form-item label="身份证号" prop="idCard">
      <el-input
        v-model="searchQuery.idCard"
        placeholder="请输入身份证号"
        clearable
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="searchPatient">查询</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped></style>

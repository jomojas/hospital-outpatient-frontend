<script setup lang="ts">
import { defineProps, defineEmits, ref, defineExpose } from 'vue'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  modelValue: any
  isEdit?: boolean
}>()
const emit = defineEmits(['update:modelValue'])

const formRef = ref<FormInstance>() // 用于暴露 el-form 实例

const rules = {
  patientNo: [{ required: true, message: '请输入患者编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthday: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }]
}

// 只在表单输入时 emit，直接操作 props.modelValue
const onInput = () => {
  emit('update:modelValue', props.modelValue)
}

// 暴露 formRef 给父组件
defineExpose({ formRef })
</script>

<template>
  <el-form
    :model="props.modelValue"
    :rules="rules"
    label-width="100px"
    ref="formRef"
  >
    <el-form-item label="患者编号" prop="patientNo">
      <el-input
        v-model="props.modelValue.patientNo"
        :disabled="true"
        @input="onInput"
      />
    </el-form-item>
    <el-form-item label="姓名" prop="name">
      <el-input v-model="props.modelValue.name" @input="onInput" />
    </el-form-item>
    <el-form-item label="性别" prop="gender">
      <el-select
        v-model="props.modelValue.gender"
        placeholder="请选择"
        @change="onInput"
      >
        <el-option label="男" value="男" />
        <el-option label="女" value="女" />
      </el-select>
    </el-form-item>
    <el-form-item label="出生日期" prop="birthday">
      <el-date-picker
        v-model="props.modelValue.birthday"
        type="date"
        value-format="YYYY-MM-DD"
        @change="onInput"
      />
    </el-form-item>
    <el-form-item label="身份证号" prop="idCard">
      <el-input v-model="props.modelValue.idCard" @input="onInput" />
    </el-form-item>
    <el-form-item label="地址" prop="address">
      <el-input v-model="props.modelValue.address" @input="onInput" />
    </el-form-item>
  </el-form>
</template>

<style scoped></style>

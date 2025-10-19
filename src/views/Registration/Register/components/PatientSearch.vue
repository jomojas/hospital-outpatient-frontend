<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import type { SearchPayload } from '@/types/Registration/Register'

const emit = defineEmits<{
  (e: 'search', payload: SearchPayload): void
}>()

const form = reactive<SearchPayload>({
  name: '',
  idNumber: ''
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const rules = {
  name: [
    { required: true, message: '请输入患者姓名' },
    { min: 2, max: 50, message: '姓名长度应为 2-50 个字符' }
  ],
  idNumber: [
    { required: true, message: '请输入身份证号' },
    {
      pattern: /^\d{15}|\d{18}$/,
      message: '身份证号格式不正确'
    }
  ]
}

const resetForm = () => {
  form.name = ''
  form.idNumber = ''
  formRef.value?.clearValidate()
}

/**
 * 点击查询或回车时触发
 * 会通过 emit('search', { name, idNumber }) 将输入传给父组件
 */
async function onSearch() {
  if (!formRef.value) return

  const valid = await formRef.value.validate()

  if (!valid) return

  loading.value = true
  try {
    // 这里只负责把输入发给父组件，具体请求由父组件或 Pinia 处理
    emit('search', {
      name: form.name.trim(),
      idNumber: form.idNumber.trim()
    })
  } finally {
    // 小幅延时以给调用方做 UX 处理更友好（可去掉）
    setTimeout(() => {
      loading.value = false
      resetForm()
    }, 150)
  }
}
</script>

<template>
  <el-card class="patient-search-card" shadow="never">
    <div class="search-title">患者信息查询</div>
    <el-form :model="form" :inline="true" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入患者姓名"
          clearable
          :validate-event="false"
        />
      </el-form-item>

      <el-form-item label="身份证号" prop="idNumber">
        <el-input
          v-model="form.idNumber"
          placeholder="请输入身份证号"
          clearable
          :validate-event="false"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSearch"
          >查询</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped lang="scss">
.patient-search-card {
  padding: $padding-sm;
}

.search-title {
  font-size: $font-subtitle;
  font-weight: 600;
  color: $text-color;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid $border-color;
}

.el-form-item {
  margin-right: $margin-base;
}
</style>

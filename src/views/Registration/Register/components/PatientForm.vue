<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRegistrationStore } from '@/store/Registration/Register/RegistrationStore'
import type { PatientRequest, PatientInfo } from '@/types/Registration/Register'

const registrationStore = useRegistrationStore()
/**
 * computed 中的函数不会立即执行
 * 只有在访问 .value 时才会执行，并且会缓存结果
 * 只有当依赖的响应式数据变化时，才会重新计算
 *
 * 响应性：Store → 组件
 * registrationStore.patientFound 变化 → patientFound 自动更新
 */
const patientFound = computed(() => registrationStore.patientFound)
const currentPatient = computed(() => registrationStore.patientInfo)

const form = ref<PatientRequest>({
  patientNo: '',
  name: '',
  gender: '男',
  birthday: '',
  idCard: '',
  address: ''
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入患者姓名' },
    { min: 2, max: 50, message: '姓名长度应为 2-50 个字符' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号' },
    {
      pattern: /^\d{15}|\d{18}$/,
      message: '身份证号格式不正确'
    }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthday: [{ required: true, message: '请选择出生日期', trigger: 'change' }]
}

const formRef = ref<FormInstance>()
const loading = ref(false)

// 监听患者信息变化
watch(
  currentPatient,
  (newPatient: Partial<PatientInfo>) => {
    // 正确的类型
    // console.log('患者信息变化:', newPatient)

    // ✅ 使用可选链和trim，更安全的检查
    const hasName = newPatient?.name?.trim()
    const hasIdCard = newPatient?.idCard?.trim()
    const hasValidSearchInfo = Boolean(hasName || hasIdCard)

    if (!hasValidSearchInfo) {
      // console.log('没有有效搜索信息，重置表单')
      resetForm()
      return
    }

    if (patientFound.value) {
      // 🎯 查询到完整患者信息的情况
      form.value = {
        patientNo: newPatient.patientNo || '',
        name: newPatient.name || '',
        gender: newPatient.gender || '男',
        birthday: newPatient.birthday || '',
        idCard: newPatient.idCard || '',
        address: newPatient.address || ''
      }
    } else {
      // 🎯 只有搜索条件，没查到患者的情况
      form.value = {
        patientNo: newPatient.patientNo || '', // 保留后端自动生成的患者编号
        name: newPatient.name || '', // 保留搜索的姓名
        gender: '男', // 默认值
        birthday: '', // 空值，待填写
        idCard: newPatient.idCard || '', // 保留搜索的身份证
        address: '' // 空值，待填写
      }
    }
  },
  { immediate: true, deep: true }
)

// 🎯 表单数据变化时同步到 store（仅在添加模式）
watch(
  form,
  (newForm) => {
    if (!patientFound.value) {
      // 只在添加模式下同步到 store
      registrationStore.updatePatientRequest(newForm)
    }
  },
  { deep: true }
)

// 重置表单
function resetForm() {
  form.value = {
    patientNo: '',
    name: '',
    gender: '男',
    birthday: '',
    idCard: '',
    address: ''
  }
}

// 提交表单
async function onSubmit() {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  try {
    loading.value = true
    await registrationStore.createPatientFun()
    ElMessage.success('患者创建成功')
  } catch (error) {
    // ElMessage.error(error instanceof Error ? error.message : '创建失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="patient-form">
    <el-card>
      <!-- 头部信息 -->
      <template #header>
        <div class="card-header">
          <span v-if="patientFound" class="header-title">
            <el-icon><View /></el-icon>
            患者信息 - {{ currentPatient?.name }}
          </span>
          <span v-else class="header-title">
            <el-icon><Plus /></el-icon>
            新增患者信息
          </span>
        </div>
      </template>

      <!-- 表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="patientFound ? {} : rules"
        label-width="100px"
        :disabled="patientFound"
        class="patient-form-content"
      >
        <el-form-item label="患者编号" prop="patientNo">
          <el-input v-model="form.patientNo" disabled />
        </el-form-item>

        <el-form-item label="患者姓名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入患者姓名"
            :readonly="patientFound"
          />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender" :disabled="patientFound">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="出生日期" prop="birthday">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="请选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled="patientFound"
          />
        </el-form-item>

        <el-form-item label="身份证号" prop="idCard">
          <el-input
            v-model="form.idCard"
            placeholder="请输入身份证号"
            :readonly="patientFound"
          />
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            placeholder="请输入详细地址"
            :rows="3"
            :readonly="patientFound"
          />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item v-if="!patientFound" class="form-actions">
          <el-button
            type="primary"
            :loading="loading"
            @click="onSubmit"
            class="submit-btn"
          >
            <el-icon><Plus /></el-icon>
            创建患者
          </el-button>
          <el-button @click="resetForm" class="reset-btn">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.patient-form {
  max-width: 800px;
  margin: 0 auto;
  font-family: $font-family-body;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: $margin-sm;
  font-size: $font-subtitle;
  font-family: $font-family-title;
  font-weight: 500;
  color: $text-color;
}

.mode-alert {
  margin-bottom: $margin-base;
}

.patient-form-content {
  margin-top: $margin-base;
}

.form-actions {
  margin-top: $margin-lg;
  text-align: left;

  .submit-btn {
    margin-right: $margin-sm;
  }

  .reset-btn {
    margin-left: $margin-sm;
  }
}

/* 查看模式样式 */
.form-view-mode {
  :deep(.el-input__wrapper) {
    background-color: $background-color-secondary;
    border-color: $border-color-light;

    .el-input__inner {
      background-color: transparent;
      color: $text-color-secondary;
    }
  }

  :deep(.el-textarea__inner) {
    background-color: $background-color-secondary;
    border-color: $border-color-light;
    color: $text-color-secondary;
  }

  :deep(.el-radio__input.is-disabled + .el-radio__label) {
    color: $text-color-secondary;
  }

  :deep(.el-date-editor.is-disabled) {
    background-color: $background-color-secondary;
    border-color: $border-color-light;

    .el-input__inner {
      color: $text-color-secondary;
    }
  }
}

/* 添加模式样式 */
.form-add-mode {
  :deep(.el-form-item__label) {
    color: $primary-color;
    font-weight: 500;
  }

  :deep(.el-input__wrapper:hover) {
    border-color: $primary-hover;
  }

  :deep(.el-input__wrapper:focus-within) {
    border-color: $primary-active;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
  }

  :deep(.el-textarea__inner:hover) {
    border-color: $primary-hover;
  }

  :deep(.el-textarea__inner:focus) {
    border-color: $primary-active;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
  }
}

/* 表单项间距调整 */
.patient-form-content {
  :deep(.el-form-item) {
    margin-bottom: $margin-base;
  }

  :deep(.el-form-item__label) {
    font-size: $font-body;
    color: $text-color;
    line-height: 1.5;
  }

  :deep(.el-form-item__content) {
    line-height: 1.5;
  }
}

/* 输入框样式统一 */
:deep(.el-input) {
  .el-input__wrapper {
    border-radius: $border-radius-base;
    border-color: $border-color;
    transition: all 0.2s ease;
  }

  .el-input__inner {
    font-size: $font-body;
    color: $text-color;
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    border-radius: $border-radius-base;
    border-color: $border-color;
    font-size: $font-body;
    color: $text-color;
    transition: all 0.2s ease;
  }
}

/* 单选按钮样式 */
:deep(.el-radio-group) {
  .el-radio {
    margin-right: $margin-base;

    .el-radio__label {
      font-size: $font-body;
      color: $text-color;
    }
  }
}

/* 日期选择器样式 */
:deep(.el-date-editor) {
  width: 100%;

  .el-input__wrapper {
    border-radius: $border-radius-base;
    border-color: $border-color;
  }

  .el-input__inner {
    font-size: $font-body;
    color: $text-color;
  }
}

/* 按钮样式 */
.submit-btn {
  background-color: $primary-color;
  border-color: $primary-color;
  color: $white;
  border-radius: $border-radius-base;
  font-size: $font-body;
  padding: $padding-sm $padding-base;

  &:hover {
    background-color: $primary-hover;
    border-color: $primary-hover;
  }

  &:active {
    background-color: $primary-active;
    border-color: $primary-active;
  }
}

.reset-btn {
  background-color: $background-color;
  border-color: $border-color;
  color: $text-color;
  border-radius: $border-radius-base;
  font-size: $font-body;
  padding: $padding-sm $padding-base;

  &:hover {
    background-color: $background-color-hover;
    border-color: $primary-color;
    color: $primary-color;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .patient-form {
    margin: 0 $margin-sm;
  }

  .patient-form-content {
    :deep(.el-form-item__label) {
      width: 80px !important;
    }
  }

  .form-actions {
    text-align: center;

    .submit-btn,
    .reset-btn {
      margin: 0 $margin-sm $margin-sm 0;
    }
  }
}
</style>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useLookupStore } from '@/store/Registration/Register/LookupStore'
import { useRegistrationStore } from '@/store/Registration/Register/RegistrationStore'
import type {
  RegistrationPayload,
  RegistrationFormData
} from '@/types/Registration/Register'
import { isValidRegistrationForm } from '@/types/Registration/Register'

const lookupStore = useLookupStore()
const registrationStore = useRegistrationStore()

// ========== 表单数据 ==========
const registrationForm = ref<RegistrationFormData>({
  patientId: 0,
  doctorPath: [],
  departmentId: 0,
  doctorId: 0,
  visitDate: '',
  period: '',
  numberType: '',
  settlementTypeId: undefined,
  paymentMethodId: undefined,
  medicalRecordBook: 0
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

// ========== 计算属性 ==========

// 选中的医生信息
const selectedDoctor = computed(() => {
  if (registrationForm.value.doctorId) {
    return lookupStore.getDoctorById(registrationForm.value.doctorId)
  }
  return null
})

// 根据选中医生获取可用号别
const availableNumberTypes = computed(() => {
  if (selectedDoctor.value) {
    return lookupStore.getAvailableNumberTypes(selectedDoctor.value.isExpert)
  }
  return []
})

// 选中号别的费用
const selectedNumberTypeFee = computed(() => {
  return lookupStore.getNumberTypeFee(registrationForm.value.numberType)
})

// 总费用计算（病历本免费）
const totalPayableAmount = computed(() => {
  return selectedNumberTypeFee.value
})

// 剩余号源
const remainingQuota = computed(() => {
  if (selectedDoctor.value) {
    return Math.max(
      0,
      selectedDoctor.value.initQuota - selectedDoctor.value.usedQuota
    )
  }
  return 0
})

// 是否显示号源不足警告
const showQuotaWarning = computed(() => {
  return (
    selectedDoctor.value &&
    remainingQuota.value <= 5 &&
    remainingQuota.value > 0
  )
})

// ========== 表单验证 ==========
const rules: FormRules = {
  doctorPath: [
    { required: true, message: '请选择科室和医生', trigger: 'change' }
  ],
  visitDate: [{ required: true, message: '请选择挂号日期', trigger: 'change' }],
  period: [{ required: true, message: '请选择午别', trigger: 'change' }],
  numberType: [{ required: true, message: '请选择号别', trigger: 'change' }],
  settlementTypeId: [
    { required: true, message: '请选择结算类型', trigger: 'change' }
  ],
  paymentMethodId: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ]
}

// ========== 事件处理函数 ==========

// 🎯 处理医生选择变化
function handleDoctorChange(value: number[]) {
  // console.log('选择的路径:', value)

  if (value && value.length === 2) {
    const [departmentId, doctorId] = value
    registrationForm.value.departmentId = departmentId
    registrationForm.value.doctorId = doctorId

    // 🎯 清空号别选择，因为可用号别可能发生变化
    registrationForm.value.numberType = ''

    // 🎯 刷新医生号源信息
    lookupStore.refreshDoctorQuota(doctorId)

    // console.log('选中医生:', selectedDoctor.value)
  } else {
    // 清空选择
    registrationForm.value.departmentId = 0
    registrationForm.value.doctorId = 0
    registrationForm.value.numberType = ''
  }
}

// 处理号别变化
function handleNumberTypeChange(value: string) {
  console.log('选择号别:', value, '费用:', selectedNumberTypeFee.value)
}

// 日期禁用逻辑
function disabledDate(time: Date) {
  // 禁用过去的日期
  return time.getTime() < Date.now() - 8.64e7
}

// 🎯 提交挂号
async function handleSubmit() {
  if (!formRef.value) return

  const valid = await formRef.value.validate()

  if (!valid) return

  // 使用类型守卫
  if (!isValidRegistrationForm(registrationForm.value)) {
    ElMessage.error('请完整填写所有必填信息')
    return
  }

  // 检查是否选择了患者
  if (!registrationStore.patientInfo?.patientId) {
    ElMessage.error('请先选择患者')
    return
  }

  // 检查剩余号源
  if (remainingQuota.value <= 0) {
    ElMessage.error('该医生当日号源已满，请选择其他医生或日期')
    return
  }

  try {
    submitting.value = true

    // 类型安全的转换
    const payload: RegistrationPayload = {
      patientId: registrationStore.patientInfo!.patientId,
      departmentId: registrationForm.value.departmentId,
      doctorId: registrationForm.value.doctorId,
      visitDate: registrationForm.value.visitDate,
      period: registrationForm.value.period,
      numberType: registrationForm.value.numberType,
      initQuota: selectedDoctor.value?.initQuota || 0,
      usedQuota: selectedDoctor.value?.usedQuota || 0,
      settlementTypeId: registrationForm.value.settlementTypeId,
      paymentMethodId: registrationForm.value.paymentMethodId,
      payableAmount: totalPayableAmount.value,
      medicalRecordBook: registrationForm.value.medicalRecordBook
    }

    await registrationStore.registerWithPatient(payload)
    ElMessage.success('挂号成功')

    // 🎯 挂号成功后刷新医生号源
    await lookupStore.refreshDoctorQuota(registrationForm.value.doctorId)

    // 重置表单
    resetForm()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '挂号失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  registrationForm.value = {
    patientId: 0,
    doctorPath: [],
    departmentId: 0,
    doctorId: 0,
    visitDate: '',
    period: '',
    numberType: '',
    settlementTypeId: undefined,
    paymentMethodId: undefined,
    medicalRecordBook: 0
  }

  // 重置表单验证状态
  formRef.value?.resetFields()
}

// ========== 生命周期 ==========
onMounted(async () => {
  try {
    // console.log('开始初始化挂号基础数据...')
    await lookupStore.initializeRegistrationData()
    // console.log('挂号基础数据加载完成')
  } catch (error) {
    ElMessage.error('加载基础数据失败，请刷新页面重试')
    console.error('基础数据加载失败:', error)
  }
})

// 🎯 监听患者信息变化
watch(
  () => registrationStore.patientInfo,
  (newPatientInfo) => {
    if (newPatientInfo?.patientId) {
      registrationForm.value.patientId = newPatientInfo.patientId
    } else {
      registrationForm.value.patientId = 0
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="registration-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><DocumentAdd /></el-icon>
            患者挂号
          </span>
          <el-tag
            v-if="registrationStore.patientInfo?.name"
            type="success"
            size="small"
          >
            当前患者: {{ registrationStore.patientInfo.name }}
          </el-tag>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="registrationForm"
        :rules="rules"
        label-width="120px"
        class="registration-form-content"
      >
        <!-- 🎯 科室医生级联选择器 -->
        <el-form-item label="科室医生" prop="doctorPath">
          <el-cascader
            v-model="registrationForm.doctorPath"
            :options="lookupStore.departmentDoctorOptions"
            :props="{
              value: 'id',
              label: 'name',
              children: 'doctors',
              emitPath: true,
              checkStrictly: false
            }"
            placeholder="请选择科室和医生"
            style="width: 100%"
            filterable
            clearable
            :loading="
              lookupStore.loadingDepartments || lookupStore.loadingDoctors
            "
            @change="handleDoctorChange"
          >
            <template #default="{ node, data }">
              <span>{{ data.name }}</span>
              <!-- 显示医生的专家标识 -->
              <span v-if="node.level === 2 && data.isExpert" class="expert-tag">
                专家
              </span>
              <!-- 显示剩余号源 -->
              <span v-if="node.level === 2" class="quota-info">
                ({{ data.remainingQuota }}/{{ data.initQuota }})
              </span>
            </template>
          </el-cascader>

          <!-- 🎯 显示选中医生的详细信息 -->
          <div v-if="selectedDoctor" class="doctor-info">
            <el-tag type="info" size="small">
              {{ selectedDoctor.description }}
            </el-tag>
            <span v-if="selectedDoctor.isExpert" class="expert-indicator">
              专家医生
            </span>
            <span
              class="quota-indicator"
              :class="{ 'quota-warning': showQuotaWarning }"
            >
              剩余号源: {{ remainingQuota }}/{{ selectedDoctor.initQuota }}
            </span>
          </div>

          <!-- 号源不足警告 -->
          <el-alert
            v-if="showQuotaWarning"
            title="号源紧张，请尽快完成挂号"
            type="warning"
            size="small"
            :closable="false"
            style="margin-top: 8px"
          />
        </el-form-item>

        <!-- 挂号日期 -->
        <el-form-item label="挂号日期" prop="visitDate">
          <el-date-picker
            v-model="registrationForm.visitDate"
            type="date"
            placeholder="请选择挂号日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 午别 -->
        <el-form-item label="午别" prop="period">
          <el-select
            v-model="registrationForm.period"
            placeholder="请选择午别"
            style="width: 100%"
          >
            <el-option
              v-for="session in lookupStore.noonSessions"
              :key="session.code"
              :label="session.label"
              :value="session.code"
            />
          </el-select>
        </el-form-item>

        <!-- 🎯 号别（根据医生类型动态更新） -->
        <el-form-item label="号别" prop="numberType">
          <el-select
            v-model="registrationForm.numberType"
            placeholder="请选择号别"
            style="width: 100%"
            :loading="lookupStore.loadingNumberTypes"
            :disabled="!selectedDoctor"
            @change="handleNumberTypeChange"
          >
            <el-option
              v-for="numberType in availableNumberTypes"
              :key="numberType.numberType"
              :label="`${numberType.displayName} (¥${numberType.fee})`"
              :value="numberType.numberType"
            />
          </el-select>
          <div v-if="!selectedDoctor" class="field-tip">请先选择医生</div>
        </el-form-item>

        <!-- 结算类型 -->
        <el-form-item label="结算类型" prop="settlementTypeId">
          <el-select
            v-model="registrationForm.settlementTypeId"
            placeholder="请选择结算类型"
            style="width: 100%"
            :loading="lookupStore.loadingSettlementCategories"
          >
            <el-option
              v-for="category in lookupStore.settlementCategories"
              :key="category.settlementTypeId"
              :label="category.name"
              :value="category.settlementTypeId"
            >
              <span>{{ category.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ category.description }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 支付方式 -->
        <el-form-item label="支付方式" prop="paymentMethodId">
          <el-select
            v-model="registrationForm.paymentMethodId"
            placeholder="请选择支付方式"
            style="width: 100%"
            :loading="lookupStore.loadingPaymentMethods"
          >
            <el-option
              v-for="method in lookupStore.paymentMethods"
              :key="method.paymentMethodId"
              :label="method.name"
              :value="method.paymentMethodId"
            >
              <span>{{ method.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ method.description }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 医疗本 -->
        <el-form-item label="购买医疗本" prop="medicalRecordBook">
          <el-radio-group v-model="registrationForm.medicalRecordBook">
            <el-radio :label="1">是（免费）</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 🎯 费用汇总 -->
        <el-form-item label="应付金额" v-if="selectedNumberTypeFee > 0">
          <div class="fee-summary">
            <el-descriptions :column="2" size="small" border>
              <el-descriptions-item label="挂号费">
                ¥{{ selectedNumberTypeFee.toFixed(2) }}
              </el-descriptions-item>
              <el-descriptions-item label="医疗本费">
                免费
              </el-descriptions-item>
              <el-descriptions-item label="总计" label-class-name="total-label">
                <span class="total-amount"
                  >¥{{ totalPayableAmount.toFixed(2) }}</span
                >
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
            class="submit-btn"
          >
            <el-icon><Check /></el-icon>
            确认挂号
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
@use '@/styles/semantic' as *;

.registration-form {
  max-width: 800px;
  margin: 0 auto;
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
  font-weight: 500;
  color: $text-color;
}

.registration-form-content {
  margin-top: $margin-base;
}

.doctor-info {
  margin-top: $margin-sm;
  display: flex;
  align-items: center;
  gap: $margin-sm;
  flex-wrap: wrap;

  .expert-indicator {
    color: $primary-color;
    font-size: $font-caption;
    font-weight: 500;
  }

  .quota-indicator {
    color: $text-color-secondary;
    font-size: $font-caption;

    &.quota-warning {
      color: #e6a23c;
      font-weight: 500;
    }
  }
}

.expert-tag {
  margin-left: $margin-sm;
  padding: 1px 4px;
  background-color: $primary-color;
  color: white;
  border-radius: 2px;
  font-size: 10px;
  transform: scale(0.8);
}

.quota-info {
  margin-left: $margin-sm;
  color: $text-color-secondary;
  font-size: 12px;
}

.field-tip {
  margin-top: 4px;
  font-size: 12px;
  color: $text-color-secondary;
}

.fee-summary {
  width: 100%;

  :deep(.total-label) {
    font-weight: 500;
  }

  .total-amount {
    font-size: $font-subtitle;
    font-weight: 500;
    color: $primary-color;
  }
}

.form-actions {
  margin-top: $margin-lg;
  text-align: center;

  .submit-btn {
    margin-right: $margin-sm;
    background-color: $primary-color;
    border-color: $primary-color;

    &:hover {
      background-color: $primary-hover;
      border-color: $primary-hover;
    }
  }
}

// 级联选择器自定义样式
:deep(.el-cascader) {
  .el-cascader__dropdown {
    .el-cascader-node {
      .el-cascader-node__label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
    }
  }
}

// 表单项样式
:deep(.el-form-item) {
  margin-bottom: $margin-base;

  .el-form-item__label {
    font-size: $font-body;
    color: $text-color;
    font-weight: 500;
  }
}

// 下拉框选项样式
:deep(.el-select-dropdown__item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

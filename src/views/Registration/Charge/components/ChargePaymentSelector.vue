<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useChargeLookupStore } from '@/store/Registration/Charge/LookupStore'
import { useChargeStore } from '@/store/Registration/Charge/ChargeStore'
import { usePaymentDialogStore } from '@/store/Registration/Charge/PaymentDialogStore'

// Store
const lookupStore = useChargeLookupStore()
const chargeStore = useChargeStore()
const paymentDialogStore = usePaymentDialogStore()

// 表单引用
const formRef = ref<FormInstance>()

// 表单验证规则
const formRules: FormRules = {
  paymentMethodId: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ],
  settlementTypeId: [
    { required: true, message: '请选择结算类型', trigger: 'change' }
  ]
}

// 选中的支付方式信息
const selectedPaymentMethod = computed(() => {
  if (!paymentDialogStore.paymentForm.paymentMethodId) return null
  return lookupStore.paymentMethodOptions.find(
    (option) => option.value === paymentDialogStore.paymentForm.paymentMethodId
  )
})

// 选中的结算类型信息
const selectedSettlementCategory = computed(() => {
  if (!paymentDialogStore.paymentForm.settlementTypeId) return null
  return lookupStore.settlementCategoryOptions.find(
    (option) => option.value === paymentDialogStore.paymentForm.settlementTypeId
  )
})

// 确认缴费
async function handleConfirm() {
  if (!formRef.value) return

  try {
    // 表单验证
    await formRef.value.validate()

    // 调用 Store 中的缴费方法
    const success = await paymentDialogStore.performCharge(chargeStore)

    if (success) {
      chargeStore.refresh()
      // 缴费成功后清空表单验证
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 取消缴费
function handleCancel() {
  paymentDialogStore.closeDialog()
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}
</script>

<template>
  <el-dialog
    v-model="paymentDialogStore.visible"
    title="缴费确认"
    width="600px"
    :close-on-click-modal="false"
    :before-close="handleCancel"
  >
    <!-- 缴费项目列表 -->
    <div class="charge-items-section">
      <h4>缴费项目 ({{ paymentDialogStore.chargeItems.length }}项)</h4>
      <el-table
        :data="paymentDialogStore.chargeItems"
        border
        size="small"
        max-height="200"
      >
        <el-table-column prop="patientName" label="患者" width="100" />
        <el-table-column prop="itemName" label="项目名称" min-width="150" />
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.type === 'DRUG' ? 'success' : 'primary'"
              size="small"
            >
              {{ row.type === 'DRUG' ? '药品' : '医疗' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="quantity"
          label="数量"
          width="60"
          align="center"
        />
        <el-table-column label="单价" width="80" align="right">
          <template #default="{ row }"> ¥{{ row.price.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.totalAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 支付信息选择 -->
    <div class="payment-section">
      <h4>支付信息</h4>
      <el-form
        :model="paymentDialogStore.paymentForm"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付方式" prop="paymentMethodId" required>
              <el-select
                v-model="paymentDialogStore.paymentForm.paymentMethodId"
                placeholder="请选择支付方式"
                style="width: 100%"
                :loading="lookupStore.loadingPaymentMethods"
              >
                <el-option
                  v-for="option in lookupStore.paymentMethodOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  :title="option.description"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="结算类型" prop="settlementTypeId" required>
              <el-select
                v-model="paymentDialogStore.paymentForm.settlementTypeId"
                placeholder="请选择结算类型"
                style="width: 100%"
                :loading="lookupStore.loadingSettlementCategories"
              >
                <el-option
                  v-for="option in lookupStore.settlementCategoryOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                  :title="option.description"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 支付方式和结算类型的详细信息 -->
        <el-row v-if="selectedPaymentMethod || selectedSettlementCategory">
          <el-col :span="24">
            <div class="selection-info">
              <div v-if="selectedPaymentMethod" class="info-item">
                <span class="info-label">支付方式：</span>
                <span class="info-value">{{
                  selectedPaymentMethod.label
                }}</span>
                <span
                  v-if="selectedPaymentMethod.description"
                  class="info-desc"
                >
                  ({{ selectedPaymentMethod.description }})
                </span>
              </div>
              <div v-if="selectedSettlementCategory" class="info-item">
                <span class="info-label">结算类型：</span>
                <span class="info-value">{{
                  selectedSettlementCategory.label
                }}</span>
                <span
                  v-if="selectedSettlementCategory.description"
                  class="info-desc"
                >
                  ({{ selectedSettlementCategory.description }})
                </span>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 费用汇总 -->
    <div class="amount-summary">
      <el-row justify="space-between" class="summary-row">
        <el-col>
          <span class="summary-label">总计项目：</span>
          <span class="summary-value"
            >{{ paymentDialogStore.chargeItems.length }} 项</span
          >
        </el-col>
        <el-col class="total-amount">
          <span class="summary-label">应收金额：</span>
          <span class="amount-highlight"
            >¥{{ paymentDialogStore.totalAmount.toFixed(2) }}</span
          >
        </el-col>
      </el-row>
    </div>

    <!-- 弹窗底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="chargeStore.loading">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          :loading="chargeStore.loading"
          :disabled="!paymentDialogStore.isFormValid"
        >
          确定缴费
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.charge-items-section {
  margin-bottom: $margin-lg;

  h4 {
    margin: 0 0 $margin-sm 0;
    color: $text-color;
    font-size: $font-subtitle;
    font-weight: 600;
    font-family: $font-family-title;
  }
}

.payment-section {
  margin-bottom: $margin-lg;

  h4 {
    margin: 0 0 $margin-base 0;
    color: $text-color;
    font-size: $font-subtitle;
    font-weight: 600;
    font-family: $font-family-title;
  }

  .selection-info {
    background-color: $background-color-secondary;
    border-radius: $border-radius-base;
    padding: $padding-sm;
    margin-top: $margin-sm;
    border: 1px solid $border-color-light;

    .info-item {
      margin-bottom: $margin-sm;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        color: $text-color-secondary;
        font-weight: 500;
        font-size: $font-body;
      }

      .info-value {
        color: $text-color;
        font-weight: 600;
        margin-left: $margin-sm;
        font-size: $font-body;
      }

      .info-desc {
        color: $text-color-disabled;
        font-size: $font-caption;
        margin-left: 4px;
      }
    }
  }

  // 表单样式优化
  :deep(.el-form-item__label) {
    color: $text-color;
    font-weight: 500;
    font-size: $font-body;
  }
}

.amount-summary {
  padding: $padding-base;
  background-color: $background-color-secondary;
  border-radius: $border-radius-base;
  border: 1px solid $border-color;
  margin-bottom: $margin-lg;

  .summary-row {
    align-items: center;
    font-size: $font-body;
  }

  .summary-label {
    color: $text-color-secondary;
    font-weight: 500;
  }

  .summary-value {
    color: $text-color;
    font-weight: 500;
    margin-left: $margin-sm;
  }

  .total-amount {
    text-align: right;
    font-weight: 600;
  }

  .amount-highlight {
    color: $warning-color;
    font-size: $font-subtitle;
    font-weight: 700;
    margin-left: $margin-sm;
  }
}

.amount-text {
  color: $warning-color;
  font-weight: 600;
  font-size: $font-body;
}

.dialog-footer {
  text-align: right;

  :deep(.el-button) {
    margin-left: $margin-sm;

    &:first-child {
      margin-left: 0;
    }
  }
}

// 表格内样式优化
:deep(.el-table) {
  font-size: $font-body;

  .el-table__header {
    background-color: $background-color-secondary;

    th {
      color: $text-color;
      font-weight: 600;
    }
  }

  .el-table__body {
    td {
      color: $text-color;
    }
  }
}

// 弹窗内容区域样式
:deep(.el-dialog__body) {
  padding: $padding-lg;
}

:deep(.el-dialog__header) {
  padding: $padding-base $padding-lg;
  border-bottom: 1px solid $border-color-light;

  .el-dialog__title {
    color: $text-color;
    font-weight: 600;
    font-size: $font-subtitle;
    font-family: $font-family-title;
  }
}

:deep(.el-dialog__footer) {
  padding: $padding-base $padding-lg;
  border-top: 1px solid $border-color-light;
}
</style>

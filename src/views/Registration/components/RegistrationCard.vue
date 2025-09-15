<script setup lang="ts">
import type { RegistrationResult } from '@/api/modules/Registration/Register'
import { defineProps } from 'vue'

// Props for the registration data
const props = defineProps<{
  visible: boolean
  registration: RegistrationResult | null
}>()
</script>

<template>
  <el-card class="registration-card" v-if="registration">
    <div class="registration-info">
      <p><strong>科室：</strong>{{ registration.departmentName }}</p>
      <p><strong>医生：</strong>{{ registration.doctorName }}</p>
      <p><strong>就诊日期：</strong>{{ registration.visitDate }}</p>
      <p><strong>时段：</strong>{{ registration.period }}</p>
      <p><strong>号别：</strong>{{ registration.numberType }}</p>
      <p><strong>结算类型：</strong>{{ registration.settlementTypeName }}</p>
      <p><strong>支付方式：</strong>{{ registration.paymentMethodName }}</p>
      <p><strong>病历本：</strong>{{ registration.medicalRecordBook }}</p>
      <p><strong>应付金额：</strong>¥{{ registration.payableAmount }}</p>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.registration-card {
  margin: 20px 0;
  padding: 20px;
}

.registration-info p {
  margin: 5px 0;
}
</style>

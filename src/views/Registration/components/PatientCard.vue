<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { PatientInfo } from '@/api/modules/Registration/Register'

const props = defineProps<{
  patientFound: boolean
  patientInfo: Partial<PatientInfo>
}>()

const emit = defineEmits(['open-register', 'add-patient']) // Events for registering and adding patient
</script>

<template>
  <el-card class="patient-card">
    <template v-if="props.patientFound">
      <div class="patient-info">
        <p><strong>患者编号：</strong>{{ props.patientInfo?.patientNo }}</p>
        <p><strong>姓名：</strong>{{ props.patientInfo?.name }}</p>
        <p><strong>性别：</strong>{{ props.patientInfo?.gender }}</p>
        <p><strong>生日：</strong>{{ props.patientInfo?.birthday }}</p>
        <p><strong>身份证号：</strong>{{ props.patientInfo?.idCard }}</p>
        <p><strong>地址：</strong>{{ props.patientInfo?.address }}</p>
      </div>
      <el-button
        type="primary"
        @click="$emit('open-register', props.patientInfo?.patientId)"
      >
        点击挂号
      </el-button>
    </template>
    <template v-else>
      <p>未找到患者信息</p>
      <el-button type="primary" @click="$emit('add-patient')">
        新增患者
      </el-button>
    </template>
  </el-card>
</template>

<style scoped lang="scss">
.patient-card {
  margin: 20px;
  padding: 20px;
}

.patient-info p {
  margin: 5px 0;
}
</style>

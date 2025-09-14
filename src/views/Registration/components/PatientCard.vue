<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  patientFound: Boolean, // Flag to indicate if patient info is found
  patientInfo: Object // Patient information object
})

const emit = defineEmits(['register', 'add-patient']) // Events for registering and adding patient
</script>

<template>
  <el-card class="patient-card">
    <template v-if="patientFound">
      <div class="patient-info">
        <p><strong>患者编号：</strong>{{ patientInfo?.patientNo }}</p>
        <p><strong>姓名：</strong>{{ patientInfo?.name }}</p>
        <p><strong>性别：</strong>{{ patientInfo?.gender }}</p>
        <p><strong>生日：</strong>{{ patientInfo?.birthday }}</p>
        <p><strong>身份证号：</strong>{{ patientInfo?.idCard }}</p>
        <p><strong>地址：</strong>{{ patientInfo?.address }}</p>
      </div>
      <el-button
        type="primary"
        @click="$emit('register', patientInfo?.patientId)"
      >
        挂号
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

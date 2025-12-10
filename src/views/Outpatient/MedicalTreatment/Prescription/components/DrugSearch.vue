<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import DrugSelector from './DrugSelector.vue'
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'

const contextStore = useClinicContextStore()
const selectorRef = ref<InstanceType<typeof DrugSelector>>()

const handleOpen = () => selectorRef.value?.open()
</script>

<template>
  <!-- 只有在允许开药的状态下显示 (REVISITED) -->
  <div class="drug-search-container" v-if="contextStore.canPrescribe">
    <el-button
      type="primary"
      size="large"
      :icon="Plus"
      class="add-btn"
      @click="handleOpen"
    >
      添加药品
    </el-button>

    <DrugSelector ref="selectorRef" />
  </div>
</template>

<style scoped>
.add-btn {
  width: 100%;
  border-style: dashed;
  font-size: 16px;
}
</style>

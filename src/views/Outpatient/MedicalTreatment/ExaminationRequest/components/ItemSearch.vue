<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import MedicalItemSelector from './MedicalItemSelector.vue'
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext' // 引入 Store

// 引用弹窗组件
const selectorRef = ref<InstanceType<typeof MedicalItemSelector>>()

const contextStore = useClinicContextStore()

const handleOpenSelector = () => {
  selectorRef.value?.open()
}
</script>

<template>
  <div class="item-search-container" v-if="contextStore.canRequestItems">
    <!-- 这是一个大号的添加按钮，非常显眼 -->
    <el-button
      type="primary"
      size="large"
      :icon="Plus"
      class="add-btn"
      @click="handleOpenSelector"
    >
      添加医疗项目
    </el-button>

    <!-- 弹窗组件挂载在这里 -->
    <MedicalItemSelector ref="selectorRef" />
  </div>
</template>

<style lang="scss" scoped>
.item-search-container {
  display: flex;
  align-items: center;
}

.add-btn {
  width: 100%;
  border-style: dashed; // 使用虚线边框，通常表示“添加”区域
  font-size: 16px;
}
</style>

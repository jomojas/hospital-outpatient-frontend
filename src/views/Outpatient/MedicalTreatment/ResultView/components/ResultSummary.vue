<script setup lang="ts">
import { computed } from 'vue'
import { useResultStore } from '@/store/Outpatient/MedicalTreatment/ResultStore'

const store = useResultStore()
const stats = computed(() => store.statistics)
</script>

<template>
  <div class="result-summary">
    <div class="stat-item total">
      <div class="value">{{ stats.total }}</div>
      <div class="label">总项目</div>
    </div>

    <div class="divider"></div>

    <div class="stat-item finished">
      <div class="value">{{ stats.finished }}</div>
      <div class="label">已出结果</div>
    </div>

    <div class="stat-item checking">
      <div class="value">{{ stats.checking }}</div>
      <div class="label">检查/检验中</div>
    </div>

    <div class="stat-item unpaid">
      <div class="value">{{ stats.unpaid }}</div>
      <div class="label">待缴费</div>
    </div>

    <div class="stat-item cancelled">
      <div class="value">{{ stats.cancelled }}</div>
      <div class="label">已退/作废</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.result-summary {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.divider {
  width: 1px;
  height: 30px;
  background: #e4e7ed;
  margin: 0 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;

  .value {
    font-size: 20px;
    font-weight: bold;
    line-height: 1.2;
  }
  .label {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  &.total .value {
    color: #303133;
  }
  &.finished .value {
    color: #67c23a;
  }
  &.checking .value {
    color: #409eff;
  }
  &.unpaid .value {
    color: #e6a23c;
  }
  &.cancelled .value {
    color: #909399;
  }
}
</style>

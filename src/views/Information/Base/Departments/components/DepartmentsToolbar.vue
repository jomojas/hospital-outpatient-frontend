<script setup lang="ts">
import { Plus, Refresh } from '@element-plus/icons-vue'

defineProps<{ loading?: boolean }>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'refresh'): void
}>()
</script>

<template>
  <div class="toolbar">
    <div class="title">科室管理</div>
    <div class="actions">
      <el-button type="primary" :icon="Plus" @click="emit('create')">
        新增科室
      </el-button>
      <el-button :icon="Refresh" :loading="loading" @click="emit('refresh')">
        刷新
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $padding-base;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: $text-color;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: $padding-base;
  }
}
</style>

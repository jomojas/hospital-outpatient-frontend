<script setup lang="ts">
import { Plus, Refresh, Search } from '@element-plus/icons-vue'

const props = defineProps<{
  keyword?: string
  status?: 0 | 1
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:keyword', v: string): void
  (e: 'update:status', v: 0 | 1 | undefined): void
  (e: 'search'): void
  (e: 'refresh'): void
  (e: 'create'): void
}>()

const onStatusChange = (v: 0 | 1 | undefined) => {
  emit('update:status', v)
  emit('search')
}
</script>

<template>
  <div class="toolbar">
    <div class="title">医疗项目</div>
    <div class="actions">
      <el-input
        :model-value="props.keyword"
        placeholder="项目名称/编码"
        clearable
        class="keyword"
        @update:model-value="(v: string) => emit('update:keyword', v)"
        @keyup.enter="emit('search')"
        @clear="emit('search')"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        :model-value="props.status"
        placeholder="状态"
        clearable
        class="status"
        @update:model-value="(v: number | undefined) => onStatusChange(v as 0 | 1 | undefined)"
      >
        <el-option label="启用" :value="1" />
        <el-option label="停用" :value="0" />
      </el-select>

      <el-button :icon="Refresh" :loading="loading" @click="emit('refresh')"
        >刷新</el-button
      >
      <el-button type="primary" :icon="Plus" @click="emit('create')"
        >新增项目</el-button
      >
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
    flex-wrap: wrap;
  }

  .keyword {
    width: 260px;
  }

  .status {
    width: 160px;
  }
}
</style>

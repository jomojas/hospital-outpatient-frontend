<script setup lang="ts">
import { Plus, Refresh, Search } from '@element-plus/icons-vue'

import type { DrugCategoryResponse } from '@/types/Information/DrugCatalog'

const props = defineProps<{
  keyword?: string
  categoryId?: number
  categories: DrugCategoryResponse[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:keyword', v: string): void
  (e: 'update:categoryId', v: number | undefined): void
  (e: 'search'): void
  (e: 'refresh'): void
  (e: 'create'): void
}>()

const onCategoryChange = (v: number | undefined) => {
  emit('update:categoryId', v)
  emit('search')
}
</script>

<template>
  <div class="toolbar">
    <div class="title">药品目录</div>
    <div class="actions">
      <el-input
        :model-value="props.keyword"
        placeholder="药品名称/编码"
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
        :model-value="props.categoryId"
        placeholder="药品分类"
        clearable
        class="category"
        @update:model-value="onCategoryChange"
      >
        <el-option
          v-for="c in props.categories"
          :key="c.categoryId"
          :label="c.categoryName"
          :value="c.categoryId"
        />
      </el-select>

      <el-button :icon="Refresh" :loading="loading" @click="emit('refresh')"
        >刷新</el-button
      >
      <el-button type="primary" :icon="Plus" @click="emit('create')"
        >新增药品</el-button
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

  .category {
    width: 200px;
  }
}
</style>

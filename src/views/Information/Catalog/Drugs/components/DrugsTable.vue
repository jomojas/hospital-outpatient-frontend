<script setup lang="ts">
import { Edit, Switch } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import type { DrugDetailResponse } from '@/types/Information/DrugCatalog'

defineProps<{
  data: DrugDetailResponse[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', row: DrugDetailResponse): void
  (e: 'toggleStatus', row: DrugDetailResponse): void
  (e: 'deletePlaceholder', row: DrugDetailResponse): void
}>()

const onToggle = async (row: DrugDetailResponse) => {
  await ElMessageBox.confirm(
    `确定切换药品【${row.drugName}】状态吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  emit('toggleStatus', row)
}
</script>

<template>
  <el-table :data="data" v-loading="loading" border>
    <el-table-column prop="drugCode" label="编码" min-width="120" />
    <el-table-column prop="drugName" label="药品名称" min-width="180" />
    <el-table-column prop="categoryName" label="分类" min-width="140" />
    <el-table-column prop="specification" label="规格" min-width="140" />
    <el-table-column prop="unit" label="单位" width="100" />
    <el-table-column prop="retailPrice" label="零售价" width="120" />
    <el-table-column
      prop="manufacturer"
      label="生产厂家"
      min-width="160"
      show-overflow-tooltip
    />
    <el-table-column label="操作" width="220" align="center">
      <template #default="{ row }">
        <el-button link type="primary" :icon="Edit" @click="emit('edit', row)"
          >编辑</el-button
        >
        <el-button link type="primary" :icon="Switch" @click="onToggle(row)"
          >上下架</el-button
        >
        <el-button link type="danger" @click="emit('deletePlaceholder', row)"
          >删除</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { Edit, Switch } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import type { MedicalItemResponse } from '@/types/Information/MedicalItem'

defineProps<{
  data: MedicalItemResponse[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', row: MedicalItemResponse): void
  (e: 'toggleStatus', row: MedicalItemResponse): void
}>()

const onToggle = async (row: MedicalItemResponse) => {
  await ElMessageBox.confirm(
    `确定切换项目【${row.itemName}】状态吗？`,
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
    <el-table-column prop="itemCode" label="编码" min-width="120" />
    <el-table-column prop="itemName" label="项目名称" min-width="180" />
    <el-table-column prop="itemTypeLabel" label="类型" min-width="140" />
    <el-table-column prop="departmentName" label="执行科室" min-width="140" />
    <el-table-column prop="price" label="价格" width="120" />
    <el-table-column label="状态" width="110" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="plain">
          {{ row.status === 1 ? '启用' : '停用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" align="center">
      <template #default="{ row }">
        <el-button link type="primary" :icon="Edit" @click="emit('edit', row)"
          >编辑</el-button
        >
        <el-button link type="primary" :icon="Switch" @click="onToggle(row)"
          >切换状态</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'

import type { DepartmentResponse } from '@/types/Information/Department'

defineProps<{
  data: DepartmentResponse[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', row: DepartmentResponse): void
  (e: 'delete', row: DepartmentResponse): void
}>()

const onDelete = async (row: DepartmentResponse) => {
  await ElMessageBox.confirm(
    `确定删除科室【${row.departmentName}】吗？`,
    '确认删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  emit('delete', row)
}
</script>

<template>
  <el-table :data="data" v-loading="loading" border>
    <el-table-column prop="departmentId" label="ID" width="80" />
    <el-table-column prop="departmentName" label="科室名称" min-width="160" />
    <el-table-column prop="typeName" label="科室类型" min-width="120" />
    <el-table-column label="状态" width="120" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="plain">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="180" align="center">
      <template #default="{ row }">
        <el-button link type="primary" @click="emit('edit', row)"
          >编辑</el-button
        >
        <el-button link type="danger" @click="onDelete(row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'

import type { StaffDetailResponse } from '@/types/Information/Employee'

defineProps<{
  data: StaffDetailResponse[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', row: StaffDetailResponse): void
  (e: 'resetPwd', row: StaffDetailResponse): void
  (e: 'delete', row: StaffDetailResponse): void
  (e: 'restore', row: StaffDetailResponse): void
}>()

const onDelete = async (row: StaffDetailResponse) => {
  await ElMessageBox.confirm(`确定删除员工【${row.name}】吗？`, '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
  emit('delete', row)
}

const onRestore = async (row: StaffDetailResponse) => {
  await ElMessageBox.confirm(`确定恢复员工【${row.name}】吗？`, '确认恢复', {
    confirmButtonText: '恢复',
    cancelButtonText: '取消',
    type: 'warning'
  })
  emit('restore', row)
}
</script>

<template>
  <el-table :data="data" v-loading="loading" border>
    <el-table-column prop="staffId" label="ID" width="80" />
    <el-table-column prop="name" label="姓名" min-width="120" />
    <el-table-column prop="phone" label="手机号" min-width="140" />
    <el-table-column prop="departmentName" label="科室" min-width="140" />
    <el-table-column prop="roleName" label="角色" min-width="140" />
    <el-table-column label="专家" width="90" align="center">
      <template #default="{ row }">
        <el-tag v-if="row.isExpert" type="success" effect="plain">是</el-tag>
        <span v-else>-</span>
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" min-width="160" />
    <el-table-column label="操作" width="300" align="center">
      <template #default="{ row }">
        <el-button link type="primary" @click="emit('edit', row)"
          >编辑</el-button
        >
        <el-button link type="primary" @click="emit('resetPwd', row)"
          >重置密码</el-button
        >
        <el-button link type="warning" @click="onRestore(row)">恢复</el-button>
        <el-button link type="danger" @click="onDelete(row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

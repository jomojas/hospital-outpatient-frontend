<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue'

import type { RegistrationLevelResponse } from '@/types/Information/RegistrationLevel'

defineProps<{
  data: RegistrationLevelResponse[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'editPrice', row: RegistrationLevelResponse): void
  (e: 'setStatus', payload: { code: string; status: 0 | 1 }): void
}>()

const onEnable = (row: RegistrationLevelResponse) => {
  emit('setStatus', { code: row.code, status: 1 })
}

const onDisable = (row: RegistrationLevelResponse) => {
  emit('setStatus', { code: row.code, status: 0 })
}
</script>

<template>
  <el-table :data="data" v-loading="loading" border>
    <el-table-column prop="code" label="编码" width="140" />
    <el-table-column prop="name" label="名称" min-width="160" />
    <el-table-column prop="price" label="价格" min-width="120" />
    <el-table-column label="操作" width="240" align="center">
      <template #default="{ row }">
        <el-button
          link
          type="primary"
          :icon="Edit"
          @click="emit('editPrice', row)"
        >
          修改价格
        </el-button>
        <el-button link type="success" @click="onEnable(row)">启用</el-button>
        <el-button link type="warning" @click="onDisable(row)">停用</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

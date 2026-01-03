<script setup lang="ts">
import { Search, Refresh, Edit, CopyDocument } from '@element-plus/icons-vue'
import type { DepartmentResponse } from '@/types/Information/Department'

const props = defineProps<{
  departmentId?: number
  dateRange: [string, string] | null
  departments: DepartmentResponse[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:departmentId', v: number | undefined): void
  (e: 'update:dateRange', v: [string, string] | null): void
  (e: 'query'): void
  (e: 'refresh'): void
  (e: 'open-set-quota'): void
  (e: 'open-batch'): void
  (e: 'open-copy'): void
}>()

const onDepartmentChange = (v: number | undefined) =>
  emit('update:departmentId', v)
const onDateRangeChange = (v: [string, string] | null) =>
  emit('update:dateRange', v)
</script>

<template>
  <div class="toolbar">
    <div class="title">医生排班设置</div>
    <div class="actions">
      <el-select
        v-model="props.departmentId"
        placeholder="选择科室"
        class="dept"
        filterable
        clearable
        @change="onDepartmentChange"
      >
        <el-option
          v-for="d in props.departments"
          :key="d.departmentId"
          :label="d.departmentName"
          :value="d.departmentId"
        />
      </el-select>

      <el-date-picker
        v-model="props.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        @update:model-value="onDateRangeChange"
      />

      <el-button
        type="primary"
        :icon="Search"
        :loading="props.loading"
        @click="emit('query')"
        >查询</el-button
      >
      <el-button
        :icon="Refresh"
        :loading="props.loading"
        @click="emit('refresh')"
        >刷新</el-button
      >

      <el-button :icon="Edit" @click="emit('open-set-quota')"
        >设置号源</el-button
      >
      <el-button :icon="Edit" @click="emit('open-batch')">批量设置</el-button>
      <el-button :icon="CopyDocument" @click="emit('open-copy')"
        >复制排班</el-button
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
  }

  .dept {
    width: 200px;
  }
}
</style>

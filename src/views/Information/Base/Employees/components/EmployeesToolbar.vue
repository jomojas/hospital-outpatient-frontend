<script setup lang="ts">
import { Plus, Refresh, Search } from '@element-plus/icons-vue'

import type { DepartmentResponse } from '@/types/Information/Department'
import type { StaffRoleResponse } from '@/types/Information/Employee'

const props = defineProps<{
  departmentId?: number
  roleId?: number
  keyword?: string
  departments: DepartmentResponse[]
  roles: StaffRoleResponse[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:departmentId', v: number | undefined): void
  (e: 'update:roleId', v: number | undefined): void
  (e: 'update:keyword', v: string): void
  (e: 'search'): void
  (e: 'create'): void
  (e: 'refresh'): void
}>()

const onDepartmentChange = (v: number | undefined) => {
  emit('update:departmentId', v)
  emit('search')
}

const onRoleChange = (v: number | undefined) => {
  emit('update:roleId', v)
  emit('search')
}
</script>

<template>
  <div class="toolbar">
    <div class="title">员工管理</div>
    <div class="actions">
      <el-select
        :model-value="props.departmentId"
        placeholder="科室"
        clearable
        class="select"
        @update:model-value="onDepartmentChange"
      >
        <el-option
          v-for="d in props.departments"
          :key="d.departmentId"
          :label="d.departmentName"
          :value="d.departmentId"
        />
      </el-select>

      <el-select
        :model-value="props.roleId"
        placeholder="角色"
        clearable
        class="select"
        @update:model-value="onRoleChange"
      >
        <el-option
          v-for="r in props.roles"
          :key="r.roleId"
          :label="r.roleName"
          :value="r.roleId"
        />
      </el-select>

      <el-input
        :model-value="props.keyword"
        placeholder="姓名/手机号/身份证号"
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

      <el-button type="primary" :icon="Plus" @click="emit('create')">
        新增员工
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
    flex-wrap: wrap;
  }

  .keyword {
    width: 320px;
  }

  .select {
    width: 200px;
  }
}
</style>

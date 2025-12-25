<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useInformationBaseInfoStore } from '@/store/Information/BaseInfoStore'
import type {
  CreateDepartmentRequest,
  DepartmentResponse,
  UpdateDepartmentRequest
} from '@/types/Information/Department'

import DepartmentsToolbar from './components/DepartmentsToolbar.vue'
import DepartmentsTable from './components/DepartmentsTable.vue'
import DepartmentFormDialog from './components/DepartmentFormDialog.vue'

const store = useInformationBaseInfoStore()

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingRow = ref<DepartmentResponse | null>(null)
const actionLoading = ref(false)
const initialRoleIds = ref<number[]>([])

onMounted(async () => {
  await Promise.all([
    store.fetchDepartmentTypes(),
    store.fetchDepartments(),
    store.fetchStaffRoles()
  ])
})

function openCreate() {
  dialogMode.value = 'create'
  editingRow.value = null
  initialRoleIds.value = []
  dialogVisible.value = true
}

async function openEdit(row: DepartmentResponse) {
  dialogMode.value = 'edit'
  editingRow.value = row
  initialRoleIds.value = []
  dialogVisible.value = true

  try {
    await store.fetchDepartmentRoles(row.departmentId)
    initialRoleIds.value = store.departmentRoles.map((r) => r.roleId)
  } catch {
    // ignore
  }
}

async function onSubmit(
  payload: CreateDepartmentRequest | UpdateDepartmentRequest
) {
  actionLoading.value = true
  try {
    if (dialogMode.value === 'create') {
      await store.handleCreateDepartment(payload as CreateDepartmentRequest)
    } else if (editingRow.value) {
      await store.handleUpdateDepartment(
        editingRow.value.departmentId,
        payload as UpdateDepartmentRequest
      )
    }
    dialogVisible.value = false
    await store.fetchDepartments()
  } finally {
    actionLoading.value = false
  }
}

async function onDelete(row: DepartmentResponse) {
  actionLoading.value = true
  try {
    await store.handleDeleteDepartment(row.departmentId)
    await store.fetchDepartments()
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="information-page">
    <DepartmentsToolbar
      :loading="store.departmentsLoading || actionLoading"
      @create="openCreate"
      @refresh="store.fetchDepartments()"
    />

    <el-card>
      <DepartmentsTable
        :data="store.departments"
        :loading="store.departmentsLoading"
        @edit="openEdit"
        @delete="onDelete"
      />
    </el-card>

    <DepartmentFormDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :row="editingRow"
      :types="store.departmentTypes"
      :roles="store.staffRoles"
      :initial-role-ids="initialRoleIds"
      :loading="actionLoading"
      @submit="onSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.information-page {
  padding: $padding-lg;
}
</style>

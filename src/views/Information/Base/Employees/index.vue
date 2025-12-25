<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useInformationBaseInfoStore } from '@/store/Information/BaseInfoStore'
import type {
  CreateEmployeeRequest,
  ResetPasswordRequest,
  StaffDetailResponse,
  UpdateEmployeeDTO
} from '@/types/Information/Employee'

import EmployeesToolbar from './components/EmployeesToolbar.vue'
import EmployeesTable from './components/EmployeesTable.vue'
import CreateEmployeeDialog from './components/CreateEmployeeDialog.vue'
import EditEmployeeDialog from './components/EditEmployeeDialog.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'

const store = useInformationBaseInfoStore()

const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const resetPwdDialogVisible = ref(false)

const editingRow = ref<StaffDetailResponse | null>(null)
const resetPwdRow = ref<StaffDetailResponse | null>(null)

const actionLoading = ref(false)

onMounted(async () => {
  await Promise.all([
    store.fetchAllDepartments(),
    store.fetchStaffRoles(),
    store.fetchEmployeeList()
  ])
})

const onSearch = async () => {
  store.employeeParams.page = 1
  await store.fetchEmployeeList()
}

const openCreate = () => {
  createDialogVisible.value = true
}

const openEdit = (row: StaffDetailResponse) => {
  editingRow.value = row
  editDialogVisible.value = true
}

const openResetPwd = (row: StaffDetailResponse) => {
  resetPwdRow.value = row
  resetPwdDialogVisible.value = true
}

const submitCreate = async (payload: CreateEmployeeRequest) => {
  actionLoading.value = true
  try {
    await store.handleCreateEmployee(payload)
    createDialogVisible.value = false
    await store.fetchEmployeeList()
  } finally {
    actionLoading.value = false
  }
}

const submitEdit = async (payload: UpdateEmployeeDTO) => {
  if (!editingRow.value) return
  actionLoading.value = true
  try {
    await store.handleUpdateEmployee(editingRow.value.staffId, payload)
    editDialogVisible.value = false
    await store.fetchEmployeeList()
  } finally {
    actionLoading.value = false
  }
}

const submitResetPwd = async (payload: ResetPasswordRequest) => {
  if (!resetPwdRow.value) return
  actionLoading.value = true
  try {
    await store.handleResetEmployeePassword(resetPwdRow.value.staffId, payload)
    resetPwdDialogVisible.value = false
  } finally {
    actionLoading.value = false
  }
}

const onDelete = async (row: StaffDetailResponse) => {
  actionLoading.value = true
  try {
    await store.handleDeleteEmployee(row.staffId)
    await store.fetchEmployeeList()
  } finally {
    actionLoading.value = false
  }
}

const onRestore = async (row: StaffDetailResponse) => {
  actionLoading.value = true
  try {
    await store.handleRestoreEmployee(row.staffId)
    await store.fetchEmployeeList()
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="information-page">
    <EmployeesToolbar
      :department-id="store.employeeParams.departmentId"
      :role-id="store.employeeParams.roleId"
      :keyword="store.employeeParams.keyword"
      :departments="store.allDepartments"
      :roles="store.staffRoles"
      :loading="store.employeeLoading || actionLoading"
      @update:department-id="(v) => (store.employeeParams.departmentId = v)"
      @update:role-id="(v) => (store.employeeParams.roleId = v)"
      @update:keyword="(v) => (store.employeeParams.keyword = v)"
      @search="onSearch"
      @create="openCreate"
      @refresh="store.fetchEmployeeList()"
    />

    <el-card>
      <EmployeesTable
        :data="store.employeeList"
        :loading="store.employeeLoading"
        @edit="openEdit"
        @reset-pwd="openResetPwd"
        @delete="onDelete"
        @restore="onRestore"
      />

      <div class="pagination">
        <el-pagination
          v-model:current-page="store.employeeParams.page"
          v-model:page-size="store.employeeParams.pageSize"
          :total="store.employeeMeta.total"
          layout="total, prev, pager, next"
          @current-change="store.fetchEmployeeList"
        />
      </div>
    </el-card>

    <CreateEmployeeDialog
      v-model="createDialogVisible"
      :departments="store.allDepartments"
      :roles="store.staffRoles"
      :loading="actionLoading"
      :suggest-account-name="store.fetchEmployeeAccountName"
      @submit="submitCreate"
    />

    <EditEmployeeDialog
      v-model="editDialogVisible"
      :row="editingRow"
      :departments="store.allDepartments"
      :roles="store.staffRoles"
      :loading="actionLoading"
      @submit="submitEdit"
    />

    <ResetPasswordDialog
      v-model="resetPwdDialogVisible"
      :row="resetPwdRow"
      :loading="actionLoading"
      @submit="submitResetPwd"
    />
  </div>
</template>

<style scoped lang="scss">
.information-page {
  padding: $padding-lg;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: $padding-base;
}
</style>

import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import {
  createDepartment,
  createEmployee,
  createRegistrationLevel,
  deleteDepartment,
  deleteEmployee,
  getEmployeeAccountName,
  getEmployeeDetail,
  listAllDepartments,
  listDepartmentRoles,
  listDepartmentTypes,
  listDepartments,
  listEmployees,
  listRegistrationLevels,
  listStaffRoles,
  resetEmployeePassword,
  restoreDepartment,
  restoreEmployee,
  updateDepartment,
  updateEmployee,
  updateRegistrationLevelStatus,
  updateRegistrationPrices
} from '@/api/modules/Information/BaseInfo'

import type {
  CreateDepartmentRequest,
  DepartmentResponse,
  DepartmentRoleResponse,
  DepartmentTypeResponse,
  UpdateDepartmentRequest
} from '@/types/Information/Department'
import type {
  CreateEmployeeRequest,
  EmployeeListQueryParams,
  ResetPasswordRequest,
  StaffDetailResponse,
  StaffRoleResponse,
  UpdateEmployeeDTO
} from '@/types/Information/Employee'
import type {
  CreateRegistrationLevelRequest,
  RegistrationLevelResponse,
  SetRegistrationPriceRequest,
  UpdateRegistrationLevelStatusParams
} from '@/types/Information/RegistrationLevel'
import type { PaginationMeta } from '@/types/Information/common'

const emptyMeta: PaginationMeta = {
  page: 1,
  size: 10,
  total: 0,
  totalPages: 0
}

export const useInformationBaseInfoStore = defineStore(
  'informationBaseInfoStore',
  () => {
    // =============== 科室管理 ===============
    const departmentTypesLoading = ref(false)
    const departmentTypes = ref<DepartmentTypeResponse[]>([])

    const departmentsLoading = ref(false)
    const departments = ref<DepartmentResponse[]>([])

    const allDepartmentsLoading = ref(false)
    const allDepartments = ref<DepartmentResponse[]>([])

    const departmentRolesLoading = ref(false)
    const departmentRoles = ref<DepartmentRoleResponse[]>([])

    async function fetchDepartmentTypes() {
      departmentTypesLoading.value = true
      try {
        departmentTypes.value = await listDepartmentTypes()
      } finally {
        departmentTypesLoading.value = false
      }
    }

    async function fetchDepartments(params?: { type?: string }) {
      departmentsLoading.value = true
      try {
        departments.value = await listDepartments(params)
      } finally {
        departmentsLoading.value = false
      }
    }

    async function fetchAllDepartments(params?: { type?: string }) {
      allDepartmentsLoading.value = true
      try {
        allDepartments.value = await listAllDepartments(params)
      } finally {
        allDepartmentsLoading.value = false
      }
    }

    async function fetchDepartmentRoles(departmentId: number) {
      departmentRolesLoading.value = true
      try {
        departmentRoles.value = await listDepartmentRoles(departmentId)
      } finally {
        departmentRolesLoading.value = false
      }
    }

    async function handleCreateDepartment(data: CreateDepartmentRequest) {
      await createDepartment(data)
      ElMessage.success('科室创建成功')
    }

    async function handleUpdateDepartment(
      departmentId: number,
      data: UpdateDepartmentRequest
    ) {
      await updateDepartment(departmentId, data)
      ElMessage.success('科室更新成功')
    }

    async function handleDeleteDepartment(departmentId: number) {
      await deleteDepartment(departmentId)
      ElMessage.success('科室删除成功')
    }

    async function handleRestoreDepartment(departmentId: number) {
      await restoreDepartment(departmentId)
      ElMessage.success('科室已恢复')
    }

    // =============== 员工管理 ===============
    const staffRolesLoading = ref(false)
    const staffRoles = ref<StaffRoleResponse[]>([])

    const employeeLoading = ref(false)
    const employeeList = ref<StaffDetailResponse[]>([])
    const employeeMeta = ref<PaginationMeta>({ ...emptyMeta })

    const employeeParams = reactive<EmployeeListQueryParams>({
      page: 1,
      pageSize: 10,
      keyword: '',
      order: 'desc',
      sortBy: 'createTime',
      departmentId: undefined,
      roleId: undefined
    })

    async function fetchStaffRoles() {
      staffRolesLoading.value = true
      try {
        staffRoles.value = await listStaffRoles()
      } finally {
        staffRolesLoading.value = false
      }
    }

    async function fetchEmployeeList() {
      employeeLoading.value = true
      try {
        const res = await listEmployees(employeeParams)
        employeeList.value = res.data
        employeeMeta.value = res.meta
      } finally {
        employeeLoading.value = false
      }
    }

    async function fetchEmployeeDetail(staffId: number) {
      return await getEmployeeDetail(staffId)
    }

    async function fetchEmployeeAccountName(roleId: number) {
      return await getEmployeeAccountName(roleId)
    }

    async function handleCreateEmployee(data: CreateEmployeeRequest) {
      await createEmployee(data)
      ElMessage.success('员工创建成功')
    }

    async function handleUpdateEmployee(
      staffId: number,
      data: UpdateEmployeeDTO
    ) {
      await updateEmployee(staffId, data)
      ElMessage.success('员工更新成功')
    }

    async function handleDeleteEmployee(staffId: number) {
      await deleteEmployee(staffId)
      ElMessage.success('员工删除成功')
    }

    async function handleRestoreEmployee(staffId: number) {
      await restoreEmployee(staffId)
      ElMessage.success('员工已恢复')
    }

    async function handleResetEmployeePassword(
      staffId: number,
      data: ResetPasswordRequest
    ) {
      await resetEmployeePassword(staffId, data)
      ElMessage.success('密码已重置')
    }

    function resetEmployeeParams() {
      employeeParams.page = 1
      employeeParams.keyword = ''
      employeeParams.departmentId = undefined
      employeeParams.roleId = undefined
    }

    // =============== 挂号级别管理 ===============

    const registrationLevelsLoading = ref(false)
    const registrationLevels = ref<RegistrationLevelResponse[]>([])

    async function fetchRegistrationLevels() {
      registrationLevelsLoading.value = true
      try {
        registrationLevels.value = await listRegistrationLevels()
      } finally {
        registrationLevelsLoading.value = false
      }
    }

    async function handleUpdateRegistrationPrices(
      data: SetRegistrationPriceRequest
    ) {
      await updateRegistrationPrices(data)
      ElMessage.success('挂号价格已更新')
    }

    async function handleCreateRegistrationLevel(
      data: CreateRegistrationLevelRequest
    ) {
      await createRegistrationLevel(data)
      ElMessage.success('挂号级别已新增')
    }

    async function handleUpdateRegistrationLevelStatus(
      params: UpdateRegistrationLevelStatusParams
    ) {
      await updateRegistrationLevelStatus(params)
      ElMessage.success('号别状态已更新')
    }

    return {
      // 科室
      departmentTypesLoading,
      departmentTypes,
      departmentsLoading,
      departments,
      allDepartmentsLoading,
      allDepartments,
      departmentRolesLoading,
      departmentRoles,
      fetchDepartmentTypes,
      fetchDepartments,
      fetchAllDepartments,
      fetchDepartmentRoles,
      handleCreateDepartment,
      handleUpdateDepartment,
      handleDeleteDepartment,
      handleRestoreDepartment,

      // 员工
      staffRolesLoading,
      staffRoles,
      employeeLoading,
      employeeList,
      employeeMeta,
      employeeParams,
      fetchStaffRoles,
      fetchEmployeeList,
      fetchEmployeeDetail,
      fetchEmployeeAccountName,
      handleCreateEmployee,
      handleUpdateEmployee,
      handleDeleteEmployee,
      handleRestoreEmployee,
      handleResetEmployeePassword,
      resetEmployeeParams,

      // 挂号级别
      registrationLevelsLoading,
      registrationLevels,
      fetchRegistrationLevels,
      handleUpdateRegistrationPrices,
      handleCreateRegistrationLevel,
      handleUpdateRegistrationLevelStatus
    }
  }
)

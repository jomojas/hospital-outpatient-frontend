import { ref } from 'vue'
import type { Department, Doctor } from '@/api/modules/Registration/Register'
import {
  listDepartments,
  listDoctorsByDepartment
} from '@/api/modules/Registration/Register'

// 科室和医生的组合式复用逻辑
export function useDepartmentAndDoctors() {
  const departments = ref<Department[]>([])
  const doctors = ref<Doctor[]>([])
  const loadingDepartments = ref(false)
  const loadingDoctors = ref(false)

  // 获取科室列表
  const fetchDepartments = async (type: string) => {
    loadingDepartments.value = true
    try {
      const res = await listDepartments(type)
      departments.value = res || []
      return departments.value // 返回数据
    } finally {
      loadingDepartments.value = false
    }
  }

  // 获取医生列表
  const fetchDoctors = async (departmentId: number) => {
    loadingDoctors.value = true
    try {
      const res = await listDoctorsByDepartment(departmentId)
      doctors.value = res || []
      return doctors.value // 返回数据
    } finally {
      loadingDoctors.value = false
    }
  }

  return {
    departments,
    doctors,
    loadingDepartments,
    loadingDoctors,
    fetchDepartments,
    fetchDoctors
  }
}

import { apiRequest } from '@/api/request'
import type {
  PatientInfo,
  PatientRequest,
  RegistrationPayload,
  RegistrationResult,
  PaymentMethod,
  SettlementCategory,
  NoonSession,
  NumberType,
  Department,
  Doctor
} from '@/types/Registration/Register'

// 根据姓名和身份证号搜索患者信息
export function searchPatient(params: { name: string; idCard: string }) {
  return apiRequest<PatientInfo[]>({
    url: '/patients/search',
    method: 'GET',
    params
  })
}

// 新增患者接口
export function createPatient(data: PatientRequest) {
  return apiRequest<{ patientId: number }>({
    url: '/patients',
    method: 'POST',
    data
  })
}

// 生成唯一的患者编号
export function generatePatientNo() {
  return apiRequest<{ patientNo: string }>({
    url: '/registrations/generate-patient-no',
    method: 'GET'
  })
}

// 创建挂号接口
export function createRegistration(data: RegistrationPayload) {
  return apiRequest<RegistrationResult>({
    url: '/registrations',
    method: 'POST',
    data
  })
}

// 获取指定类型的科室列表
export function listDepartments(type: string) {
  return apiRequest<Department[]>({
    url: '/departments',
    method: 'GET',
    params: { type }
  })
}

// 获取指定科室医生列表接口
export function listDoctorsByDepartment(departmentId: number) {
  return apiRequest<Doctor[]>({
    url: '/doctors',
    method: 'GET',
    params: { departmentId }
  })
}

export function listSettlementCategories() {
  return apiRequest<SettlementCategory[]>({
    url: '/dictionaries/settlement-categories',
    method: 'GET'
  })
}

export function listPaymentMethods() {
  return apiRequest<PaymentMethod[]>({
    url: '/dictionaries/payment-methods',
    method: 'GET'
  })
}

export function listNumberTypes() {
  return apiRequest<NumberType[]>({
    url: '/dictionaries/number-types',
    method: 'GET'
  })
}

export function listNoonSessions() {
  return apiRequest<NoonSession[]>({
    url: '/dictionaries/noon-sessions',
    method: 'GET'
  })
}

import { apiRequest } from '@/api/request'

// 患者信息类型
export interface PatientInfo {
  patientId: number
  patientNo: string
  name: string
  gender: string
  birthday: string
  idCard: string
  address: string
}

// 挂号请求体类型
export interface RegistrationPayload {
  patientId: number
  departmentId: number
  doctorId: number
  visitDate: string
  period: string
  numberType: string
  initQuota: number
  usedQuota: number
  settlementTypeId: number
  paymentMethodId: number
  payableAmount: number
  medicalRecordBook: number
}

// 挂号结果类型
export interface RegistrationResult {
  registrationId: number
  visitId: number
  transactionId: number
}

// 科室类型
export interface Department {
  departmentId: number
  departmentName: string
  type: string
  typeName: string
}

// 医生信息类型
export interface Doctor {
  staffId: number
  name: string
  phone: string
  idCard: string
  departmentId: number
  description: string
  roleId: number
  createTime: string
  isExpert: boolean
  initQuota: number
  usedQuota: number
}

// 新增患者请求体类型
export interface PatientRequest {
  patientId?: number
  patientNo: string
  name: string
  gender: string
  birthday: string
  idCard: string
  address?: string
}

// 根据姓名和身份证号搜索患者信息
export function searchPatient(params: { name: string; idCard: string }) {
  return apiRequest<PatientInfo[]>({
    url: '/patients/search',
    method: 'GET',
    params
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

// 生成唯一的患者编号
export function generatePatientNo() {
  return apiRequest<{ patientNo: string }>({
    url: '/registrations/generate-patient-no',
    method: 'GET'
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

// 新增患者接口
export function createPatient(data: PatientRequest) {
  return apiRequest<number>({
    url: '/patients',
    method: 'POST',
    data
  })
}

// 结算类型
export interface SettlementCategory {
  settlementTypeId: number
  name: string
  description: string
}

export function listSettlementCategories() {
  return apiRequest<SettlementCategory[]>({
    url: '/dictionaries/settlement-categories',
    method: 'GET'
  })
}

// 支付方式
export interface PaymentMethod {
  paymentMethodId: number
  name: string
  description: string
}

export function listPaymentMethods() {
  return apiRequest<PaymentMethod[]>({
    url: '/dictionaries/payment-methods',
    method: 'GET'
  })
}

// 号别
export interface NumberType {
  numberType: string
  displayName: string
  fee: number
}

export function listNumberTypes() {
  return apiRequest<NumberType[]>({
    url: '/dictionaries/number-types',
    method: 'GET'
  })
}

// 时段
export interface NoonSession {
  code: string
  label: string
}

export function listNoonSessions() {
  return apiRequest<NoonSession[]>({
    url: '/dictionaries/noon-sessions',
    method: 'GET'
  })
}

// 查询患者信息类型
export interface SearchPayload {
  name: string
  idNumber: string
}

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

// 新增患者请求体类型
export interface PatientRequest {
  patientNo: string
  name: string
  gender: string
  birthday: string
  idCard: string
  address?: string
}

// 表单数据类型（允许 undefined）
export interface RegistrationFormData {
  patientId: number
  doctorPath: number[]
  departmentId: number
  doctorId: number
  visitDate: string
  period: string
  numberType: string
  settlementTypeId?: number
  paymentMethodId?: number
  medicalRecordBook: number
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

// 类型守卫函数
export function isValidRegistrationForm(
  form: RegistrationFormData
): form is Required<RegistrationFormData> {
  return (
    form.patientId > 0 &&
    form.departmentId > 0 &&
    form.doctorId > 0 &&
    form.visitDate !== '' &&
    form.period !== '' &&
    form.numberType !== '' &&
    form.settlementTypeId !== undefined &&
    form.paymentMethodId !== undefined
  )
}

// 挂号结果类型
export interface RegistrationResult {
  registrationId: number
  visitId: number
  transactionId: number
  departmentName: string
  doctorName: string
  visitDate: string
  period: string
  numberType: string
  settlementTypeName: string
  paymentMethodName: string
  medicalRecordBook: number
  payableAmount: number
}

// 结算类型
export interface SettlementCategory {
  settlementTypeId: number
  name: string
  description: string
}

// 支付方式
export interface PaymentMethod {
  paymentMethodId: number
  name: string
  description: string
}

// 号别
export interface NumberType {
  numberType: string
  displayName: string
  fee: number
}

// 时段
export interface NoonSession {
  code: string
  label: string
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

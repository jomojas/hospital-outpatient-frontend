import { apiRequest } from '@/api/request'
import type {
  PatientQueryParams,
  PatientListResponse,
  PatientDetailInfo,
  PatientStatusCountResponse
} from '@/types/Outpatient/PatientView'

/**
 * 获取当前登录医生的挂号患者列表
 * @param params 查询参数
 * @returns 患者列表
 */
export function getDoctorRegisteredPatients(
  params: Partial<PatientQueryParams> = {}
) {
  return apiRequest<PatientListResponse>({
    url: '/cases/registrations/patients',
    method: 'GET',
    params: {
      // 过滤掉 undefined 值
      ...Object.fromEntries(
        Object.entries(params).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ''
        )
      )
    }
  })
}

/**
 * 获取患者状态统计数据
 * @returns 各状态患者数量统计
 */
export function getPatientStatusCount() {
  return apiRequest<PatientStatusCountResponse>({
    url: '/cases/registrations/patients/status-count',
    method: 'GET'
  })
}

// /**
//  * 根据病历号获取患者详细信息
//  * @param medicalNo 病历号
//  * @returns 患者详细信息
//  */
export function getPatientDetailByMedicalNo(medicalNo: string) {
  return apiRequest<PatientDetailInfo>({
    url: `/cases/registrations/patients/${medicalNo}/detail`,
    method: 'GET'
  })
}

// ✅ 导出常用的接口函数（主要接口）
export {
  getDoctorRegisteredPatients as getPatients,
  getPatientDetailByMedicalNo as getPatientDetail,
  getPatientStatusCount as getStatusCount
}

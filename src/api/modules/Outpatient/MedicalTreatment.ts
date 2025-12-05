import { apiRequest } from '@/api/request'
import type {
  // 第1页：病案首页
  CreateMedicalCaseRequest,
  CreateMedicalCaseResponse,
  MedicalCaseDetail,

  // 第2页：医疗项目申请
  MedicalItemResponse, // ✅ 单个医疗项目分页响应
  AllMedicalItemsResponse, // ✅ 新增：批量获取的组合响应
  ApplyMedicalItemsRequest,

  // 第3页：检查结果查看
  ExaminationResult,

  // 第4页：门诊确诊
  UpdateMedicalCaseRequest,

  // 第5页：开设处方
  DrugQueryParams,
  // DrugInfo,
  DrugListResponse,
  CreatePrescriptionRequest,

  // 第6页：费用查询
  FeeInquiryResponse,
  ClinicWorkspaceContext
} from '@/types/Outpatient/MedicalTreatment'

// ✅ =================== 第1页：病案首页相关接口 ===================

/**
 * 创建病案
 * @param request 创建病案请求参数
 * @returns 创建的病案ID
 */
export function createMedicalCase(request: CreateMedicalCaseRequest) {
  return apiRequest<CreateMedicalCaseResponse>({
    url: '/cases',
    method: 'POST',
    data: request
  })
}

/**
 * 根据病案ID获取病案详情
 * @param caseId 病案ID
 * @returns 病案详情信息
 */
export function getMedicalCaseDetail(caseId: number) {
  return apiRequest<MedicalCaseDetail>({
    url: `/cases/${caseId}`,
    method: 'GET'
  })
}

// ✅ =================== 第2页：医疗项目相关接口 ===================

/**
 * 获取检查项目列表（包含分页信息）
 * @param page 页码，从1开始
 * @param pageSize 每页数量
 * @param keyword 关键字搜索（项目名称/编码）
 * @returns 检查项目分页响应
 */
export function getExamItems(page = 1, pageSize = 10, keyword?: string) {
  return apiRequest<MedicalItemResponse>({
    url: '/catalog/exam-items',
    method: 'GET',
    params: {
      page,
      pageSize,
      ...(keyword && { keyword })
    }
  })
}

/**
 * 获取检验项目列表（包含分页信息）
 * @param page 页码，从1开始
 * @param pageSize 每页数量
 * @param keyword 关键字搜索（项目名称/编码）
 * @returns 检验项目分页响应
 */
export function getLabItems(page = 1, pageSize = 10, keyword?: string) {
  return apiRequest<MedicalItemResponse>({
    url: '/catalog/lab-items',
    method: 'GET',
    params: {
      page,
      pageSize,
      ...(keyword && { keyword })
    }
  })
}

/**
 * 获取处置项目列表（包含分页信息）
 * @param page 页码，从1开始
 * @param pageSize 每页数量
 * @param keyword 关键字搜索（项目名称/编码）
 * @returns 处置项目分页响应
 */
export function getDisposalItems(page = 1, pageSize = 10, keyword?: string) {
  return apiRequest<MedicalItemResponse>({
    url: '/catalog/disposal-items',
    method: 'GET',
    params: {
      page,
      pageSize,
      ...(keyword && { keyword })
    }
  })
}

/**
 * ✅ 批量获取所有医疗项目（包含分页信息）
 * @param page 页码
 * @param pageSize 每页数量
 * @param keyword 关键字
 * @returns 包含检查、检验、处置项目的对象，每个都有分页信息
 */
export async function getAllMedicalItems(
  page = 1,
  pageSize = 10,
  keyword?: string
): Promise<AllMedicalItemsResponse> {
  // 创建默认响应
  const createDefaultResponse = (): MedicalItemResponse => ({
    data: [],
    meta: {
      page,
      size: pageSize,
      total: 0,
      totalPages: 0
    }
  })

  try {
    const [examResponse, labResponse, disposalResponse] = await Promise.all([
      getExamItems(page, pageSize, keyword),
      getLabItems(page, pageSize, keyword),
      getDisposalItems(page, pageSize, keyword)
    ])

    // ✅ 根据你的 apiRequest 逻辑，直接使用返回的数据
    // apiRequest 已经处理了 meta 存在时返回 {data, meta}，不存在时返回 data
    return {
      examItems: examResponse || createDefaultResponse(),
      labItems: labResponse || createDefaultResponse(),
      disposalItems: disposalResponse || createDefaultResponse()
    }
  } catch (error) {
    console.error('批量获取医疗项目失败:', error)

    // 错误时返回空数据
    const defaultResponse = createDefaultResponse()
    return {
      examItems: defaultResponse,
      labItems: defaultResponse,
      disposalItems: defaultResponse
    }
  }
}

/**
 * 为指定病案申请医疗项目
 * @param caseId 病案ID
 * @param request 申请请求参数
 * @returns 申请结果
 */
export function applyMedicalItems(
  caseId: number,
  request: ApplyMedicalItemsRequest
) {
  return apiRequest<void>({
    url: `/cases/${caseId}/applies`,
    method: 'POST',
    data: request
  })
}

// ✅ =================== 第3页：检查结果查看接口 ===================

/**
 * 获取病案医疗项目结果
 * @param caseId 病案ID
 * @returns 医疗项目结果列表
 */
export function getCaseResults(caseId: number) {
  return apiRequest<ExaminationResult[]>({
    url: `/cases/${caseId}/results`,
    method: 'GET'
  })
}

// ✅ =================== 第4页：门诊确诊接口 ===================

/**
 * 更新病案信息
 * @param caseId 病案ID
 * @param request 更新请求参数
 * @returns 更新结果
 */
export function updateMedicalCase(
  caseId: number,
  request: UpdateMedicalCaseRequest
) {
  return apiRequest<void>({
    url: `/cases/${caseId}`,
    method: 'PUT',
    data: request
  })
}

/**
 * 更新病案信息
 * @param caseId 病案ID
 * @param request 更新请求参数
 * @returns 更新结果
 */
export function confirmMedicalCase(
  caseId: number,
  request: UpdateMedicalCaseRequest
) {
  return apiRequest<void>({
    url: `/cases/${caseId}/diagnosis`,
    method: 'PUT',
    data: request
  })
}

// ✅ =================== 第5页：开设处方相关接口 ===================

/**
 * 获取药品信息列表（包含分页信息）
 * @param params 查询参数
 * @returns 药品分页响应
 */
export function getDrugs(params: DrugQueryParams = {}) {
  const { page = 1, size = 10, keyword, categoryId } = params

  return apiRequest<DrugListResponse>({
    url: '/catalog/drugs',
    method: 'GET',
    params: {
      page,
      pageSize: size,
      ...(keyword && { keyword }),
      ...(categoryId && { categoryId })
    }
  })
}

/**
 * 为病案开具处方
 * @param caseId 病案ID
 * @param request 处方请求参数
 * @returns 处方创建结果
 */
export function createPrescriptions(
  caseId: number,
  request: CreatePrescriptionRequest
) {
  return apiRequest<void>({
    url: `/cases/${caseId}/prescriptions`,
    method: 'POST',
    data: request
  })
}

// ✅ =================== 第6页：费用查询接口 ===================

/**
 * 获取病案费用明细
 * @param caseId 病案ID
 * @returns 费用明细信息
 */
export function getCaseFees(caseId: number) {
  return apiRequest<FeeInquiryResponse>({
    url: `/cases/${caseId}/fees`,
    method: 'GET'
  })
}

/**
 * [工作台初始化] 获取诊疗上下文信息
 * @param registrationId 挂号ID (即路由中的 visitId)
 * @description 该接口用于 DoctorWorkspaceLayout 加载时，一次性获取患者Banner信息、当前状态和病案ID
 */
export function getClinicContext(registrationId: number) {
  return apiRequest<ClinicWorkspaceContext>({
    url: `/cases/registrations/${registrationId}/context`,
    method: 'GET'
  })
}

// ✅ =================== 工具函数 ===================

/**
 * 检查病案是否存在
 * @param caseId 病案ID
 * @returns 病案是否存在
 */
export async function checkCaseExists(caseId: number): Promise<boolean> {
  try {
    await getMedicalCaseDetail(caseId)
    return true
  } catch (error) {
    console.warn(`病案 ${caseId} 不存在或无法访问`)
    return false
  }
}

/**
 * 搜索药品（带分页信息）
 * @param keyword 搜索关键字
 * @param categoryId 类别ID
 * @param page 页码
 * @param pageSize 每页大小
 * @returns 药品搜索分页结果
 */
export function searchDrugs(
  keyword?: string,
  categoryId?: number,
  page = 1,
  pageSize = 20
) {
  return getDrugs({
    keyword,
    categoryId,
    page,
    size: pageSize
  })
}

/**
 * 搜索医疗项目（带分页信息）
 * @param itemType 项目类型：'EXAM' | 'LAB' | 'DISPOSAL'
 * @param keyword 搜索关键字
 * @param page 页码
 * @param pageSize 每页大小
 * @returns 对应类型的医疗项目分页列表
 */
export function searchMedicalItems(
  itemType: 'EXAM' | 'LAB' | 'DISPOSAL',
  keyword?: string,
  page = 1,
  pageSize = 20
) {
  switch (itemType) {
    case 'EXAM':
      return getExamItems(page, pageSize, keyword)
    case 'LAB':
      return getLabItems(page, pageSize, keyword)
    case 'DISPOSAL':
      return getDisposalItems(page, pageSize, keyword)
    default:
      throw new Error(`不支持的医疗项目类型: ${itemType}`)
  }
}

// ✅ =================== 导出常用接口（别名） ===================

export {
  // 病案管理
  createMedicalCase as createCase,
  getMedicalCaseDetail as getCaseDetail,
  updateMedicalCase as updateCase,
  confirmMedicalCase as confirmCase,

  // 医疗项目
  applyMedicalItems as submitApplies,
  getCaseResults as getResults,

  // 处方管理
  createPrescriptions as submitPrescriptions,

  // 费用查询
  getCaseFees as getFees
}

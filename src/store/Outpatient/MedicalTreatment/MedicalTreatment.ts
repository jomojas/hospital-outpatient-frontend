import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type {
  // 第1页：病案首页相关类型
  CreateMedicalCaseRequest,
  MedicalCaseDetail,

  // 第2页：医疗项目申请相关类型
  MedicalItem,
  MedicalItemsStore,
  ApplyItem,
  SelectedApplyItem,
  ApplyMedicalItemsRequest,

  // 第3页：检查结果查看相关类型
  ExaminationResult,

  // 第4页：门诊确诊相关类型
  UpdateMedicalCaseRequest,

  // 第5页：开设处方相关类型
  DrugQueryParams,
  DrugInfo,
  PrescriptionItem,
  SelectedPrescriptionItem,
  CreatePrescriptionRequest,

  // 第6页：费用查询相关类型
  FeeInquiryResponse,

  // 通用类型
  PaginationMeta,
  PatientCaseInfo,
  ApplyStatus
} from '@/types/Outpatient/MedicalTreatment'

import {
  // 第1页：病案首页接口
  createMedicalCase,
  getMedicalCaseDetail,

  // 第2页：医疗项目接口
  getAllMedicalItems,
  applyMedicalItems,

  // 第3页：检查结果接口
  getCaseResults,

  // 第4页：门诊确诊接口
  updateMedicalCase,

  // 第5页：开设处方接口
  getDrugs,
  createPrescriptions,

  // 第6页：费用查询接口
  getCaseFees,

  // 工具函数
  checkCaseExists
} from '@/api/modules/Outpatient/MedicalTreatment'

export const useMedicalTreatmentStore = defineStore('medicalTreatment', () => {
  // ✅ =================== 全局状态：患者病案信息 ===================

  /** 当前患者病案信息 */
  const currentPatientCase = ref<PatientCaseInfo>({
    medicalNo: '',
    patientName: '',
    registrationId: 0,
    action: '',
    caseId: undefined
  })

  /** 当前病案详情 */
  const caseDetail = ref<MedicalCaseDetail | null>(null)

  /** 全局加载状态 */
  const loading = ref(false)

  // ✅ =================== 第1页：病案首页状态 ===================

  /** 病案创建表单数据 */
  const caseForm = ref<CreateMedicalCaseRequest>({
    patientNo: '',
    registrationId: 0,
    chiefComplaint: '',
    presentHistory: '',
    physicalExam: '',
    diagnosis: '',
    treatmentPlan: ''
  })

  /** 病案创建加载状态 */
  const createCaseLoading = ref(false)

  // ✅ =================== 第2页：医疗项目申请状态 ===================

  /** 医疗项目数据存储 */
  const medicalItemsStore = ref<MedicalItemsStore>({
    examItems: [],
    labItems: [],
    disposalItems: [],
    examMeta: undefined,
    labMeta: undefined,
    disposalMeta: undefined
  })

  /** 选中的申请项目列表 */
  const selectedApplyItems = ref<SelectedApplyItem[]>([])

  /** 医疗项目搜索关键字 */
  const medicalItemsKeyword = ref('')

  /** 医疗项目加载状态 */
  const medicalItemsLoading = ref(false)

  /** 申请提交加载状态 */
  const applyItemsLoading = ref(false)

  // ✅ =================== 第3页：检查结果查看状态 ===================

  /** 检查结果列表 */
  const examinationResults = ref<ExaminationResult[]>([])

  /** 检查结果加载状态 */
  const resultsLoading = ref(false)

  /** 结果筛选状态 */
  const resultFilter = ref<ApplyStatus | ''>('')

  // ✅ =================== 第4页：门诊确诊状态 ===================

  /** 病案更新表单数据 */
  const updateCaseForm = ref<UpdateMedicalCaseRequest>({
    patientNo: '',
    registrationId: 0,
    chiefComplaint: '',
    presentHistory: '',
    physicalExam: '',
    diagnosis: '',
    treatmentPlan: ''
  })

  /** 病案更新加载状态 */
  const updateCaseLoading = ref(false)

  // ✅ =================== 第5页：开设处方状态 ===================

  /** 药品列表数据 */
  const drugs = ref<DrugInfo[]>([])

  /** 药品分页信息 */
  const drugsPagination = ref<PaginationMeta>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  })

  /** 选中的处方项目列表 */
  const selectedPrescriptionItems = ref<SelectedPrescriptionItem[]>([])

  /** 药品搜索参数 */
  const drugSearchParams = ref<DrugQueryParams>({
    keyword: '',
    categoryId: undefined,
    page: 1,
    size: 20
  })

  /** 药品数据加载状态 */
  const drugsLoading = ref(false)

  /** 处方提交加载状态 */
  const prescriptionLoading = ref(false)

  // ✅ =================== 第6页：费用查询状态 ===================

  /** 费用查询结果 */
  const feeInquiry = ref<FeeInquiryResponse | null>(null)

  /** 费用查询加载状态 */
  const feeLoading = ref(false)

  // ✅ =================== 计算属性 ===================

  /** 是否有病案ID */
  const hasCaseId = computed(() => !!currentPatientCase.value.caseId)

  /** 是否有挂号ID */
  const hasRegistrationId = computed(
    () => !!currentPatientCase.value.registrationId
  )

  /** 申请项目总数 */
  const selectedApplyItemsCount = computed(
    () => selectedApplyItems.value.length
  )

  /** 处方项目总数 */
  const selectedPrescriptionItemsCount = computed(
    () => selectedPrescriptionItems.value.length
  )

  /** 筛选后的检查结果 */
  const filteredResults = computed(() => {
    if (!resultFilter.value) return examinationResults.value
    return examinationResults.value.filter(
      (result) => result.status === resultFilter.value
    )
  })

  /** 总费用计算 */
  const totalFee = computed(() => {
    if (!feeInquiry.value) return '0.00'
    return feeInquiry.value.total
  })

  // ✅ =================== 第1页：病案首页操作 ===================

  /**
   * 初始化患者病案信息
   * @param patientInfo 患者信息
   */
  function initPatientCase(patientInfo: Partial<PatientCaseInfo>) {
    currentPatientCase.value = {
      ...currentPatientCase.value,
      ...patientInfo
    }

    // ✅ 如果传入的信息包含 caseId，同时初始化表单
    if (patientInfo.caseId) {
      caseForm.value.patientNo = patientInfo.medicalNo || ''
      caseForm.value.registrationId = patientInfo.registrationId || 0
    }
  }

  /**
   * 创建病案
   * @returns 创建的病案ID
   */
  async function handleCreateCase(): Promise<number | null> {
    if (!caseForm.value.patientNo || !caseForm.value.registrationId) {
      ElMessage.error('患者编号和挂号ID不能为空')
      return null
    }

    createCaseLoading.value = true
    try {
      const response = await createMedicalCase(caseForm.value)
      const caseId = response.recordId

      if (caseId) {
        // 更新当前病案信息
        currentPatientCase.value.caseId = caseId
        ElMessage.success('病案创建成功')
        return caseId
      } else {
        ElMessage.error('创建病案失败：未获取到病案ID')
        return null
      }
    } catch (error) {
      console.error('创建病案失败:', error)
      ElMessage.error('创建病案失败，请重试')
      return null
    } finally {
      createCaseLoading.value = false
    }
  }

  /**
   * 获取病案详情
   * @param caseId 病案ID
   */
  async function fetchCaseDetail(caseId: number) {
    loading.value = true
    try {
      const response = await getMedicalCaseDetail(caseId)
      caseDetail.value = response || null

      if (caseDetail.value) {
        // 同步更新表单数据
        updateCaseForm.value = {
          patientNo: caseDetail.value.patientNo,
          registrationId: caseDetail.value.registrationId,
          chiefComplaint: caseDetail.value.chiefComplaint,
          presentHistory: caseDetail.value.presentHistory,
          physicalExam: caseDetail.value.physicalExam,
          diagnosis: caseDetail.value.diagnosis || '',
          treatmentPlan: caseDetail.value.treatmentPlan || ''
        }
      }
    } catch (error) {
      console.error('获取病案详情失败:', error)
      ElMessage.error('获取病案详情失败')
    } finally {
      loading.value = false
    }
  }

  // ✅ =================== 第2页：医疗项目申请操作 ===================

  /**
   * 获取所有医疗项目
   * @param page 页码
   * @param pageSize 每页数量
   * @param keyword 搜索关键字
   */
  async function fetchAllMedicalItems(
    page = 1,
    pageSize = 50,
    keyword?: string
  ) {
    medicalItemsLoading.value = true
    try {
      const response = await getAllMedicalItems(page, pageSize, keyword)

      // 更新存储的医疗项目数据
      medicalItemsStore.value = {
        examItems: response.examItems?.data || [],
        labItems: response.labItems?.data || [],
        disposalItems: response.disposalItems?.data || [],
        examMeta: response.examItems?.meta,
        labMeta: response.labItems?.meta,
        disposalMeta: response.disposalItems?.meta
      }
    } catch (error) {
      console.error('获取医疗项目失败:', error)
      ElMessage.error('获取医疗项目失败')
    } finally {
      medicalItemsLoading.value = false
    }
  }

  /**
   * 搜索医疗项目
   * @param keyword 搜索关键字
   */
  async function searchMedicalItemsByKeyword(keyword: string) {
    medicalItemsKeyword.value = keyword
    await fetchAllMedicalItems(1, 50, keyword)
  }

  /**
   * 添加申请项目
   * @param item 医疗项目
   * @param applyInfo 申请信息
   */
  function addApplyItem(item: MedicalItem, applyInfo: Partial<ApplyItem>) {
    const tempId = `apply_${Date.now()}_${Math.random()}`
    const applyItem: SelectedApplyItem = {
      tempId,
      itemId: item.itemId,
      applyType: item.itemType,
      applyPurpose: applyInfo.applyPurpose || '',
      applySite: applyInfo.applySite || '',
      unit: applyInfo.unit || 1,
      remark: applyInfo.remark || '',
      itemInfo: item
    }

    selectedApplyItems.value.push(applyItem)
    ElMessage.success(`已添加 ${item.itemName}`)
  }

  /**
   * 移除申请项目
   * @param tempId 临时ID
   */
  function removeApplyItem(tempId: string) {
    const index = selectedApplyItems.value.findIndex(
      (item) => item.tempId === tempId
    )
    if (index > -1) {
      const removedItem = selectedApplyItems.value.splice(index, 1)[0]
      ElMessage.success(`已移除 ${removedItem.itemInfo?.itemName}`)
    }
  }

  /**
   * 提交医疗项目申请
   */
  async function submitMedicalItemsApply() {
    if (!hasRegistrationId.value) {
      ElMessage.error('缺少挂号ID，无法提交申请')
      return false
    }

    if (selectedApplyItems.value.length === 0) {
      ElMessage.error('请至少选择一个医疗项目')
      return false
    }

    if (!hasCaseId.value) {
      ElMessage.error('请先创建病案')
      return false
    }

    applyItemsLoading.value = true
    try {
      const request: ApplyMedicalItemsRequest = {
        registrationId: currentPatientCase.value.registrationId!,
        items: selectedApplyItems.value.map((item) => ({
          itemId: item.itemId,
          applyType: item.applyType,
          applyPurpose: item.applyPurpose,
          applySite: item.applySite,
          unit: item.unit,
          remark: item.remark
        }))
      }

      await applyMedicalItems(currentPatientCase.value.caseId!, request)
      ElMessage.success('医疗项目申请提交成功')

      // 清空选中的申请项目
      selectedApplyItems.value = []
      return true
    } catch (error) {
      console.error('提交医疗项目申请失败:', error)
      ElMessage.error('提交申请失败，请重试')
      return false
    } finally {
      applyItemsLoading.value = false
    }
  }

  // ✅ =================== 第3页：检查结果查看操作 ===================

  /**
   * 获取病案检查结果
   * @param caseId 病案ID
   */
  async function fetchExaminationResults(caseId: number) {
    resultsLoading.value = true
    try {
      const response = await getCaseResults(caseId)
      examinationResults.value = response || []
    } catch (error) {
      console.error('获取检查结果失败:', error)
      ElMessage.error('获取检查结果失败')
    } finally {
      resultsLoading.value = false
    }
  }

  /**
   * 设置结果筛选条件
   * @param status 申请状态
   */
  function setResultFilter(status: ApplyStatus | '') {
    resultFilter.value = status
  }

  // ✅ =================== 第4页：门诊确诊操作 ===================

  /**
   * 更新病案信息
   */
  async function handleUpdateCase() {
    if (!hasCaseId.value) {
      ElMessage.error('缺少病案ID，无法更新')
      return false
    }

    if (
      !updateCaseForm.value.diagnosis ||
      !updateCaseForm.value.treatmentPlan
    ) {
      ElMessage.error('诊断和治疗方案不能为空')
      return false
    }

    updateCaseLoading.value = true
    try {
      await updateMedicalCase(
        currentPatientCase.value.caseId!,
        updateCaseForm.value
      )
      ElMessage.success('病案更新成功')

      // 更新本地病案详情
      if (caseDetail.value) {
        caseDetail.value = {
          ...caseDetail.value,
          ...updateCaseForm.value
        }
      }
      return true
    } catch (error) {
      console.error('更新病案失败:', error)
      ElMessage.error('更新病案失败，请重试')
      return false
    } finally {
      updateCaseLoading.value = false
    }
  }

  // ✅ =================== 第5页：开设处方操作 ===================

  /**
   * 获取药品列表
   * @param params 查询参数
   */
  async function fetchDrugs(params?: DrugQueryParams) {
    const searchParams = { ...drugSearchParams.value, ...params }
    drugsLoading.value = true

    try {
      const response = await getDrugs(searchParams)
      const responseData = response

      if (responseData) {
        drugs.value = responseData.data || []
        drugsPagination.value = responseData.meta || {
          page: 1,
          size: 20,
          total: 0,
          totalPages: 0
        }
      }
    } catch (error) {
      console.error('获取药品列表失败:', error)
      ElMessage.error('获取药品列表失败')
    } finally {
      drugsLoading.value = false
    }
  }

  /**
   * 搜索药品
   * @param keyword 搜索关键字
   * @param categoryId 类别ID
   */
  async function searchDrugsByKeyword(keyword?: string, categoryId?: number) {
    drugSearchParams.value = {
      ...drugSearchParams.value,
      keyword,
      categoryId,
      page: 1
    }
    await fetchDrugs()
  }

  /**
   * 翻页获取药品
   * @param page 页码
   */
  async function fetchDrugsPage(page: number) {
    drugSearchParams.value.page = page
    await fetchDrugs()
  }

  /**
   * 添加处方项目
   * @param drug 药品信息
   * @param prescriptionInfo 处方信息
   */
  function addPrescriptionItem(
    drug: DrugInfo,
    prescriptionInfo: Partial<PrescriptionItem>
  ) {
    const tempId = `prescription_${Date.now()}_${Math.random()}`
    const prescriptionItem: SelectedPrescriptionItem = {
      tempId,
      drugId: drug.drugId,
      dosage: prescriptionInfo.dosage || '',
      quantity: prescriptionInfo.quantity || 1,
      remark: prescriptionInfo.remark || '',
      drugInfo: drug
    }

    selectedPrescriptionItems.value.push(prescriptionItem)
    ElMessage.success(`已添加 ${drug.drugName}`)
  }

  /**
   * 移除处方项目
   * @param tempId 临时ID
   */
  function removePrescriptionItem(tempId: string) {
    const index = selectedPrescriptionItems.value.findIndex(
      (item) => item.tempId === tempId
    )
    if (index > -1) {
      const removedItem = selectedPrescriptionItems.value.splice(index, 1)[0]
      ElMessage.success(`已移除 ${removedItem.drugInfo?.drugName}`)
    }
  }

  /**
   * 提交处方
   */
  async function submitPrescription() {
    if (!hasRegistrationId.value) {
      ElMessage.error('缺少挂号ID，无法开具处方')
      return false
    }

    if (selectedPrescriptionItems.value.length === 0) {
      ElMessage.error('请至少选择一个药品')
      return false
    }

    if (!hasCaseId.value) {
      ElMessage.error('请先创建病案')
      return false
    }

    prescriptionLoading.value = true
    try {
      const request: CreatePrescriptionRequest = {
        registrationId: currentPatientCase.value.registrationId!,
        prescriptions: selectedPrescriptionItems.value.map((item) => ({
          drugId: item.drugId,
          dosage: item.dosage,
          quantity: item.quantity,
          remark: item.remark
        }))
      }

      await createPrescriptions(currentPatientCase.value.caseId!, request)
      ElMessage.success('处方开具成功')

      // 清空选中的处方项目
      selectedPrescriptionItems.value = []
      return true
    } catch (error) {
      console.error('开具处方失败:', error)
      ElMessage.error('开具处方失败，请重试')
      return false
    } finally {
      prescriptionLoading.value = false
    }
  }

  // ✅ =================== 第6页：费用查询操作 ===================

  /**
   * 获取病案费用明细
   * @param caseId 病案ID
   */
  async function fetchCaseFees(caseId: number) {
    feeLoading.value = true
    try {
      const response = await getCaseFees(caseId)
      feeInquiry.value = response || null
    } catch (error) {
      console.error('获取费用明细失败:', error)
      ElMessage.error('获取费用明细失败')
    } finally {
      feeLoading.value = false
    }
  }

  // ✅ =================== 通用工具操作 ===================

  /**
   * 重置所有状态
   */
  function resetAllState() {
    // 重置患者病案信息
    currentPatientCase.value = {
      medicalNo: '',
      patientName: '',
      registrationId: 0,
      action: '',
      caseId: undefined
    }
    caseDetail.value = null

    // 重置各页面状态
    caseForm.value = {
      patientNo: '',
      registrationId: 0,
      chiefComplaint: '',
      presentHistory: '',
      physicalExam: '',
      diagnosis: '',
      treatmentPlan: ''
    }

    selectedApplyItems.value = []
    selectedPrescriptionItems.value = []
    examinationResults.value = []
    feeInquiry.value = null

    // 重置搜索条件
    medicalItemsKeyword.value = ''
    drugSearchParams.value = {
      keyword: '',
      categoryId: undefined,
      page: 1,
      size: 20
    }
    resultFilter.value = ''
  }

  /**
   * 验证病案是否存在
   * @param caseId 病案ID
   */
  async function validateCaseExists(caseId: number) {
    return await checkCaseExists(caseId)
  }

  // ✅ =================== 返回 Store API ===================

  return {
    // 全局状态
    currentPatientCase,
    caseDetail,
    loading,

    // 第1页：病案首页
    caseForm,
    createCaseLoading,
    initPatientCase,
    handleCreateCase,
    fetchCaseDetail,

    // 第2页：医疗项目申请
    medicalItemsStore,
    selectedApplyItems,
    medicalItemsKeyword,
    medicalItemsLoading,
    applyItemsLoading,
    fetchAllMedicalItems,
    searchMedicalItemsByKeyword,
    addApplyItem,
    removeApplyItem,
    submitMedicalItemsApply,

    // 第3页：检查结果查看
    examinationResults,
    resultsLoading,
    resultFilter,
    filteredResults,
    fetchExaminationResults,
    setResultFilter,

    // 第4页：门诊确诊
    updateCaseForm,
    updateCaseLoading,
    handleUpdateCase,

    // 第5页：开设处方
    drugs,
    drugsPagination,
    selectedPrescriptionItems,
    drugSearchParams,
    drugsLoading,
    prescriptionLoading,
    fetchDrugs,
    searchDrugsByKeyword,
    fetchDrugsPage,
    addPrescriptionItem,
    removePrescriptionItem,
    submitPrescription,

    // 第6页：费用查询
    feeInquiry,
    feeLoading,
    fetchCaseFees,

    // 计算属性
    hasCaseId,
    hasRegistrationId,
    selectedApplyItemsCount,
    selectedPrescriptionItemsCount,
    totalFee,

    // 通用工具
    resetAllState,
    validateCaseExists
  }
})

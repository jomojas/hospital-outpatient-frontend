import { defineStore } from 'pinia'
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 1. 引入 API 和 类型
import {
  createMedicalCase,
  getMedicalCaseDetail,
  confirmCase
} from '@/api/modules/Outpatient/MedicalTreatment'

import type {
  CreateMedicalCaseRequest,
  MedicalCaseDetail
} from '@/types/Outpatient/MedicalTreatment'

import { BackendPatientStatus } from '@/types/Outpatient/PatientView'

// 2. 引入上下文 Store
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'

export const useMedicalRecordStore = defineStore('medicalRecord', () => {
  const contextStore = useClinicContextStore()

  // ==========================================
  // 1. State: 数据状态
  // ==========================================

  const isLoading = ref(false)
  const isSubmitting = ref(false)

  // 完整的病案详情 (API数据)
  const caseDetail = ref<MedicalCaseDetail | null>(null)

  // 核心：当前正在服务的挂号ID，用于控制自动保存的开关和 Key 生成
  const currentRegId = ref<number | null>(null)

  // 表单 A: 初诊信息 (Page 1)
  const initialForm = reactive({
    chiefComplaint: '',
    presentHistory: '',
    physicalExam: ''
  })

  // 表单 B: 诊断信息 (Page 4)
  const diagnosisForm = reactive({
    diagnosis: '',
    treatmentPlan: ''
  })

  // ==========================================
  // 2. 持久化逻辑 (SessionStorage + 防抖)
  // ==========================================

  const getStorageKey = (regId: number) => `medical_draft_${regId}`
  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  // ✅ 核心监听器：只在 currentRegId 有值时生效
  watch(
    [initialForm, diagnosisForm],
    () => {
      // 1. 没 ID 不保存
      if (!currentRegId.value) return

      // 2. 防抖逻辑：如果有待执行的保存任务，取消它
      if (saveTimeout) clearTimeout(saveTimeout)

      // 3. 延迟 1 秒后写入 SessionStorage
      saveTimeout = setTimeout(() => {
        // 再次检查 ID (防止延迟期间用户已退出)
        if (currentRegId.value) {
          const dataToSave = {
            initialForm,
            diagnosisForm,
            timestamp: Date.now()
          }
          try {
            sessionStorage.setItem(
              getStorageKey(currentRegId.value),
              JSON.stringify(dataToSave)
            )
            // console.debug('草稿已自动保存')
          } catch (e) {
            console.warn('草稿保存失败(可能是空间不足)', e)
          }
        }
      }, 1000)
    },
    { deep: true }
  )

  /**
   * 初始化自动保存
   * 场景：进入页面时调用
   */
  function initAutoSave(regId: number) {
    currentRegId.value = regId // 激活 watch

    // 尝试恢复草稿
    const key = getStorageKey(regId)
    const draftStr = sessionStorage.getItem(key)

    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr)

        // 策略：仅当本地表单为空时才恢复，避免覆盖 API 加载的数据
        if (!initialForm.chiefComplaint && draft.initialForm) {
          Object.assign(initialForm, draft.initialForm)
        }
        if (!diagnosisForm.diagnosis && draft.diagnosisForm) {
          Object.assign(diagnosisForm, draft.diagnosisForm)
        }
      } catch (e) {
        console.error('草稿解析失败', e)
      }
    }
  }

  /**
   * 清除草稿
   * 场景：提交成功、结束诊疗
   */
  function clearDraft() {
    if (currentRegId.value) {
      sessionStorage.removeItem(getStorageKey(currentRegId.value))
    }
    if (saveTimeout) clearTimeout(saveTimeout)
  }

  // ==========================================
  // 3. Actions: 业务操作
  // ==========================================

  /**
   * 加载病案数据
   * 场景：复诊或已建档
   */
  async function loadCaseData(caseId: number) {
    if (!caseId) return

    isLoading.value = true
    try {
      const data = await getMedicalCaseDetail(caseId)
      caseDetail.value = data

      // API 数据写入表单 (这会触发 watch，将 API 数据同步更新到 Storage，这是合理的)
      initialForm.chiefComplaint = data.chiefComplaint
      initialForm.presentHistory = data.presentHistory
      initialForm.physicalExam = data.physicalExam

      diagnosisForm.diagnosis = data.diagnosis || ''
      diagnosisForm.treatmentPlan = data.treatmentPlan || ''
    } catch (error) {
      console.error('获取病案详情失败', error)
      ElMessage.error('获取病案详情失败')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 提交初诊 (创建病案)
   */
  async function submitInitialCase() {
    if (!initialForm.chiefComplaint || !initialForm.presentHistory) {
      ElMessage.warning('请完善主诉和现病史')
      return false
    }

    // 从 Context Store 根节点获取 ID
    const regId = contextStore.registrationId
    const medicalNo = contextStore.patientInfo.medicalNo

    if (!regId) {
      ElMessage.error('挂号信息丢失，请刷新页面')
      return false
    }

    isSubmitting.value = true
    try {
      const requestData: CreateMedicalCaseRequest = {
        registrationId: regId,
        patientNo: medicalNo,
        chiefComplaint: initialForm.chiefComplaint,
        presentHistory: initialForm.presentHistory,
        physicalExam: initialForm.physicalExam,
        diagnosis: diagnosisForm.diagnosis,
        treatmentPlan: diagnosisForm.treatmentPlan
      }

      const res = await createMedicalCase(requestData)

      if (res.recordId) {
        ElMessage.success('病案创建成功，已解锁检查申请')

        // 1. 更新上下文
        contextStore.setCaseId(res.recordId)

        // 2. ✅ 提交成功，清除 Storage 草稿 (因为数据已落库)
        clearDraft()

        // 3. 重新加载最新数据
        await loadCaseData(res.recordId)
        return true
      }
      return false
    } catch (error) {
      console.error('创建病案失败', error)
      ElMessage.error('创建病案失败，请重试')
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 提交确诊 (门诊确诊页面用)
   */
  async function submitDiagnosis() {
    if (!diagnosisForm.diagnosis || !diagnosisForm.treatmentPlan) {
      ElMessage.warning('请填写诊断结果和治疗方案')
      return false
    }

    const caseId = contextStore.caseId
    const regId = contextStore.registrationId
    const medicalNo = contextStore.patientInfo.medicalNo

    if (!caseId || !regId) {
      ElMessage.error('关键信息丢失')
      return false
    }

    isSubmitting.value = true
    try {
      // 构造全量更新请求
      await confirmCase(caseId, {
        registrationId: regId,
        patientNo: medicalNo,
        // 带上首页数据，防止覆盖
        chiefComplaint: initialForm.chiefComplaint,
        presentHistory: initialForm.presentHistory,
        physicalExam: initialForm.physicalExam,
        // 核心更新数据
        diagnosis: diagnosisForm.diagnosis,
        treatmentPlan: diagnosisForm.treatmentPlan
      })

      ElMessage.success('确诊成功，已解锁处方开立')
      contextStore.updateStatus(BackendPatientStatus.REVISITED)

      // ✅ 提交成功，清除草稿
      clearDraft()

      return true
    } catch (error) {
      console.error('确诊提交失败', error)
      ElMessage.error('提交失败，请重试')
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 重置状态 (离开页面时调用)
   */
  function resetForms() {
    caseDetail.value = null
    initialForm.chiefComplaint = ''
    initialForm.presentHistory = ''
    initialForm.physicalExam = ''
    diagnosisForm.diagnosis = ''
    diagnosisForm.treatmentPlan = ''

    // ✅ 关键：置空 ID，停止 watch 逻辑，防止污染下一个患者
    currentRegId.value = null
    if (saveTimeout) clearTimeout(saveTimeout)
  }

  return {
    isLoading,
    isSubmitting,
    caseDetail,
    initialForm,
    diagnosisForm,
    loadCaseData,
    submitInitialCase,
    submitDiagnosis,
    resetForms,
    initAutoSave,
    clearDraft
  }
})

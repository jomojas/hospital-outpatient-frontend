import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getClinicContext } from '@/api/modules/Outpatient/MedicalTreatment'
import { BackendPatientStatus } from '@/types/Outpatient/PatientView'

// ==========================================
// 前端状态定义 (仅 UI 使用)
// ==========================================
const UI_STATUS = {
  PENDING: { label: '待接诊', type: 'warning' },
  PROCESSING: { label: '检查/治疗中', type: 'primary' },
  REVISIT: { label: '待复诊', type: 'danger' },
  FINISHED: { label: '诊疗结束', type: 'success' },
  UNKNOWN: { label: '未知状态', type: 'info' }
}

export const useClinicContextStore = defineStore('clinicContext', () => {
  // ==========================================
  // 1. State: 数据状态
  // ==========================================
  const loading = ref(false)
  const registrationId = ref<number | null>(null)
  const caseId = ref<number | null>(null)
  const visitStatus = ref<string>('')

  const patientInfo = ref({
    name: '',
    gender: '',
    age: '',
    medicalNo: ''
  })

  // ==========================================
  // 2. Getters: 计算属性
  // ==========================================

  /**
   * 获取状态的显示信息 (用于 UI 展示)
   * 将后端繁杂的状态归纳为医生关注的 4 类状态
   */
  const visitStatusInfo = computed(() => {
    const s = visitStatus.value
    const B = BackendPatientStatus

    if (s === B.WAITING_FOR_CONSULTATION) return UI_STATUS.PENDING

    if (([B.WAITING_FOR_PROJECT_PAYMENT, B.REVISITED] as string[]).includes(s))
      return UI_STATUS.REVISIT

    if (
      (
        [
          B.WAITING_FOR_PRESCRIPTION_PAYMENT,
          B.WAITING_FOR_MEDICINE,
          B.MEDICINE_TAKEN,
          B.MEDICINE_RETURNED,
          B.FINISHED
        ] as string[]
      ).includes(s)
    ) {
      return UI_STATUS.FINISHED
    }

    if (
      (
        [
          B.INITIAL_CONSULTATION_DONE,
          B.WAITING_FOR_PROJECT_PAYMENT,
          B.WAITING_FOR_CHECKUP,
          B.CHECKING
        ] as string[]
      ).includes(s)
    ) {
      return UI_STATUS.PROCESSING
    }

    return UI_STATUS.UNKNOWN
  })

  /**
   * 菜单访问权限控制
   */
  const menuPermissions = computed(() => {
    const hasCase = !!caseId.value
    const status = visitStatus.value
    const B = BackendPatientStatus

    const isWaiting = status === B.WAITING_FOR_CONSULTATION

    // 诊疗结束阶段
    const isFinishedPhase = (
      [
        B.REVISITED,
        B.WAITING_FOR_PRESCRIPTION_PAYMENT,
        B.WAITING_FOR_MEDICINE,
        B.MEDICINE_TAKEN,
        B.MEDICINE_RETURNED,
        B.FINISHED
      ] as string[]
    ).includes(status)

    return {
      caseHome: true,
      examRequest: hasCase,
      resultView: hasCase && !isWaiting,
      diagnosis: hasCase,
      prescription: hasCase && isFinishedPhase,
      feeInquiry: hasCase
    }
  })

  // ==========================================
  // 3. Actions: 业务操作
  // ==========================================

  async function initContext(regId: number) {
    if (!regId) return
    loading.value = true
    try {
      const data = await getClinicContext(regId)
      registrationId.value = data.registrationId
      caseId.value = data.caseId
      visitStatus.value = data.visitStatus
      patientInfo.value = {
        name: data.patientName,
        gender: data.patientGender,
        age: data.patientAge,
        medicalNo: data.medicalNo
      }
    } catch (error) {
      console.error('获取诊疗上下文失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function setCaseId(id: number) {
    caseId.value = id
    // 状态自动推进
    if (visitStatus.value === BackendPatientStatus.WAITING_FOR_CONSULTATION) {
      updateStatus(BackendPatientStatus.INITIAL_CONSULTATION_DONE)
    }
  }

  function updateStatus(newStatus: string) {
    visitStatus.value = newStatus
  }

  async function refreshContext() {
    if (registrationId.value) {
      await initContext(registrationId.value)
    }
  }

  /**
   * [Reset State] 清空 Pinia 内存
   * 对应生命周期中的 onUnmounted
   */
  function clear() {
    registrationId.value = null
    caseId.value = null
    visitStatus.value = ''
    patientInfo.value = { name: '', gender: '', age: '', medicalNo: '' }
    loading.value = false
  }

  return {
    loading,
    registrationId,
    caseId,
    visitStatus,
    patientInfo,
    menuPermissions,
    visitStatusInfo,
    initContext,
    setCaseId,
    updateStatus,
    refreshContext,
    clear
  }
})

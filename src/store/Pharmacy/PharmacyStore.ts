import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// API
import {
  getDispensePendingList,
  dispenseDrugs,
  getPharmacyRecords
} from '@/api/modules/Pharmacy/PharmacyStation'

// Types
import {
  type DispensePendingQueryParams,
  type DispensePendingItem,
  type PatientDispenseGroup,
  type PharmacyRecordQueryParams,
  type PharmacyRecordItem,
  type DispenseRequest
} from '@/types/Pharmacy/PharmacyStation'

export const usePharmacyStore = defineStore('pharmacyStore', () => {
  // ==========================================
  // 1. State: 待发药 (Dispense Pending)
  // ==========================================
  const pendingLoading = ref(false)
  const pendingTotal = ref(0)

  // 原始扁平列表 (保留一份，以备不时之需)
  const rawPendingList = ref<DispensePendingItem[]>([])

  // ✅ 核心：分组后的视图数据 (View Model)
  const groupedPendingList = ref<PatientDispenseGroup[]>([])

  const pendingParams = reactive<DispensePendingQueryParams>({
    page: 1,
    pageSize: 50, // 建议设大一点，防止同一个患者的药被分页切断
    keyword: '',
    sortBy: 'prescribe_time',
    order: 'desc'
  })

  // ==========================================
  // 2. State: 发药记录 (Records)
  // ==========================================
  const recordLoading = ref(false)
  const recordList = ref<PharmacyRecordItem[]>([])
  const recordTotal = ref(0)

  const recordParams = reactive<PharmacyRecordQueryParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    type: undefined // 'DISPENSE' | 'RETURN'
  })

  // ==========================================
  // 3. Helper: 数据转换 (Flat -> Grouped)
  // ==========================================
  function transformToGroups(
    items: DispensePendingItem[]
  ): PatientDispenseGroup[] {
    const groups: PatientDispenseGroup[] = []
    const map = new Map<number, PatientDispenseGroup>()

    items.forEach((item) => {
      const regId = item.registrationId

      if (!map.has(regId)) {
        // 创建新组
        const newGroup: PatientDispenseGroup = {
          registrationId: regId,
          patientName: item.patientName,
          patientNo: item.patientNo,
          gender: item.gender,
          prescribeTime: item.prescribeTime, // 取第一条的时间作为分组时间
          items: []
        }
        map.set(regId, newGroup)
        groups.push(newGroup)
      }

      // 将药品加入对应组
      map.get(regId)!.items.push(item)
    })

    return groups
  }

  // ==========================================
  // 4. Actions: 待发药业务
  // ==========================================

  /** 获取待发药列表并分组 */
  async function fetchPendingList() {
    pendingLoading.value = true
    try {
      const res = await getDispensePendingList(pendingParams)
      rawPendingList.value = res.data
      pendingTotal.value = res.meta.total

      // ✅ 执行转换
      groupedPendingList.value = transformToGroups(res.data)
    } catch (error) {
      console.error(error)
      groupedPendingList.value = []
    } finally {
      pendingLoading.value = false
    }
  }

  /** 执行发药 (按患者/组发药) */
  async function handleDispense(group: PatientDispenseGroup) {
    try {
      await ElMessageBox.confirm(
        `确认向患者【${group.patientName}】发放共 ${group.items.length} 项药品吗？`,
        '发药确认',
        {
          confirmButtonText: '确认发药',
          cancelButtonText: '取消',
          type: 'success'
        }
      )

      // 构造请求参数
      const request: DispenseRequest = {
        prescriptions: group.items.map((item) => ({
          prescriptionId: item.prescriptionId,
          patientNo: item.patientNo
        }))
      }

      await dispenseDrugs(request)

      ElMessage.success(`患者 ${group.patientName} 发药成功`)

      // 刷新列表
      await fetchPendingList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
        ElMessage.error('发药失败')
      }
    }
  }

  // ==========================================
  // 5. Actions: 记录查询业务
  // ==========================================

  async function fetchRecordList() {
    recordLoading.value = true
    try {
      const res = await getPharmacyRecords(recordParams)
      recordList.value = res.data
      recordTotal.value = res.meta.total
    } catch (error) {
      console.error(error)
    } finally {
      recordLoading.value = false
    }
  }

  // Helpers
  function resetPendingParams() {
    pendingParams.page = 1
    pendingParams.keyword = ''
  }

  return {
    // State
    pendingLoading,
    groupedPendingList,
    pendingTotal,
    pendingParams,
    recordLoading,
    recordList,
    recordTotal,
    recordParams,
    // Actions
    fetchPendingList,
    handleDispense,
    fetchRecordList,
    resetPendingParams
  }
})

import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import {
  createDrug,
  createMedicalItem,
  listDrugCategories,
  listDrugCatalog,
  listDrugUnits,
  listItemTypes,
  listMedicalItems,
  toggleDrugStatus,
  toggleMedicalItemStatus,
  updateDrug,
  updateMedicalItem
} from '@/api/modules/Information/Catalog'

import type {
  CreateDrugRequest,
  DrugCatalogQueryParams,
  DrugCategoryResponse,
  DrugDetailResponse,
  DrugUnitCode,
  UpdateDrugRequest
} from '@/types/Information/DrugCatalog'
import type {
  CreateMedicalItemRequest,
  MedicalItemQueryParams,
  MedicalItemResponse,
  UpdateMedicalItemRequest
} from '@/types/Information/MedicalItem'
import type { PaginationMeta } from '@/types/Information/common'

const emptyMeta: PaginationMeta = {
  page: 1,
  size: 10,
  total: 0,
  totalPages: 0
}

export const useInformationCatalogStore = defineStore(
  'informationCatalogStore',
  () => {
    // =============== 字典（下拉选项） ===============
    const dictionariesLoading = ref(false)

    const drugCategories = ref<DrugCategoryResponse[]>([])
    const drugUnits = ref<DrugUnitCode[]>([])
    const itemTypes = ref<Array<{ type: string; typeName: string }>>([])

    async function fetchDictionaries() {
      dictionariesLoading.value = true
      try {
        const [categories, units, types] = await Promise.all([
          listDrugCategories(),
          listDrugUnits(),
          listItemTypes()
        ])
        drugCategories.value = categories
        drugUnits.value = units
        itemTypes.value = types
      } finally {
        dictionariesLoading.value = false
      }
    }

    // =============== 药品目录（列表/分页） ===============

    const drugCatalogLoading = ref(false)
    const drugCatalog = ref<DrugDetailResponse[]>([])
    const drugCatalogMeta = ref<PaginationMeta>({ ...emptyMeta })

    const drugCatalogParams = reactive<DrugCatalogQueryParams>({
      page: 1,
      pageSize: 10,
      keyword: '',
      categoryId: undefined
    })

    async function fetchDrugCatalog() {
      drugCatalogLoading.value = true
      try {
        const res = await listDrugCatalog(drugCatalogParams)
        drugCatalog.value = res.data
        drugCatalogMeta.value = res.meta
      } finally {
        drugCatalogLoading.value = false
      }
    }

    async function handleCreateDrug(data: CreateDrugRequest) {
      await createDrug(data)
      ElMessage.success('药品已新增')
    }

    async function handleUpdateDrug(
      drugId: string | number,
      data: UpdateDrugRequest
    ) {
      await updateDrug(drugId, data)
      ElMessage.success('药品已更新')
    }

    async function handleToggleDrugStatus(drugId: string | number) {
      await toggleDrugStatus(drugId)
      ElMessage.success('药品状态已更新')
    }

    function resetDrugCatalogParams() {
      drugCatalogParams.page = 1
      drugCatalogParams.keyword = ''
      drugCatalogParams.categoryId = undefined
    }

    // =============== 医疗项目（列表/分页） ===============

    const medicalItemsLoading = ref(false)
    const medicalItems = ref<MedicalItemResponse[]>([])
    const medicalItemsMeta = ref<PaginationMeta>({ ...emptyMeta })

    const medicalItemsParams = reactive<MedicalItemQueryParams>({
      page: 1,
      pageSize: 10,
      keyword: '',
      status: undefined,
      departmentId: undefined
    })

    async function fetchMedicalItems() {
      medicalItemsLoading.value = true
      try {
        const res = await listMedicalItems(medicalItemsParams)
        medicalItems.value = res.data
        medicalItemsMeta.value = res.meta
      } finally {
        medicalItemsLoading.value = false
      }
    }

    async function handleCreateMedicalItem(data: CreateMedicalItemRequest) {
      await createMedicalItem(data)
      ElMessage.success('医疗项目已新增')
    }

    async function handleUpdateMedicalItem(
      itemId: number,
      data: UpdateMedicalItemRequest
    ) {
      await updateMedicalItem(itemId, data)
      ElMessage.success('医疗项目已更新')
    }

    async function handleToggleMedicalItemStatus(itemId: number) {
      await toggleMedicalItemStatus(itemId)
      ElMessage.success('医疗项目状态已更新')
    }

    function resetMedicalItemsParams() {
      medicalItemsParams.page = 1
      medicalItemsParams.keyword = ''
      medicalItemsParams.status = undefined
      medicalItemsParams.departmentId = undefined
    }

    return {
      // dictionaries
      dictionariesLoading,
      drugCategories,
      drugUnits,
      itemTypes,
      fetchDictionaries,

      // drug catalog
      drugCatalogLoading,
      drugCatalog,
      drugCatalogMeta,
      drugCatalogParams,
      fetchDrugCatalog,
      handleCreateDrug,
      handleUpdateDrug,
      handleToggleDrugStatus,
      resetDrugCatalogParams,

      // medical items
      medicalItemsLoading,
      medicalItems,
      medicalItemsMeta,
      medicalItemsParams,
      fetchMedicalItems,
      handleCreateMedicalItem,
      handleUpdateMedicalItem,
      handleToggleMedicalItemStatus,
      resetMedicalItemsParams
    }
  }
)

<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElTable } from 'element-plus'
import { usePrescriptionStore } from '@/store/Outpatient/MedicalTreatment/PrescriptionStore'
import { getDrugs } from '@/api/modules/Outpatient/MedicalTreatment'
import type { DrugInfo } from '@/types/Outpatient/MedicalTreatment'

const store = usePrescriptionStore()
const visible = ref(false)
const loading = ref(false)
const keyword = ref('')
const tableData = ref<DrugInfo[]>([])
const total = ref(0)

const pagination = reactive({ page: 1, pageSize: 10 })
const multipleSelection = ref<DrugInfo[]>([])
const tableRef = ref<InstanceType<typeof ElTable>>()

// 购物车已有的ID集合 (用于置灰已选)
const cartItemIds = computed(() => new Set(store.cartList.map((i) => i.drugId)))

// 核心逻辑：判断行是否可选
const checkSelectable = (row: DrugInfo) => {
  // 1. 已经在购物车里 -> 不可选
  if (cartItemIds.value.has(row.drugId)) return false
  // 2. 库存为0 -> 不可选 (强校验)
  if (Number(row.stockQuantity) <= 0) return false
  return true
}

const open = () => {
  visible.value = true
  keyword.value = ''
  pagination.page = 1
  multipleSelection.value = []
  nextTick(() => {
    tableRef.value?.clearSelection()
    fetchData()
  })
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getDrugs({
      page: pagination.page,
      size: pagination.pageSize,
      keyword: keyword.value
    })
    tableData.value = res.data
    total.value = res.meta.total
  } catch (e) {
    console.error(e)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 防抖搜索
let timer: ReturnType<typeof setTimeout>
const handleSearch = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    pagination.page = 1
    fetchData()
  }, 300)
}

const handlePageChange = (newPage: number) => {
  pagination.page = newPage
  fetchData()
}

const handleConfirm = () => {
  store.batchAddToCart(multipleSelection.value)
  visible.value = false
}

defineExpose({ open })
</script>

<template>
  <el-dialog
    v-model="visible"
    title="添加药品"
    width="900px"
    destroy-on-close
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="selector-container">
      <div class="search-bar">
        <el-input
          v-model="keyword"
          placeholder="输入药品名称、编码搜索"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        height="400px"
        :style="{ width: '100%' }"
        row-key="drugId"
        @selection-change="(val) => (multipleSelection = val)"
      >
        <el-table-column
          type="selection"
          width="55"
          reserve-selection
          :selectable="checkSelectable"
        />
        <el-table-column prop="drugCode" label="编码" width="100" />
        <el-table-column
          prop="drugName"
          label="药品名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="specification"
          label="规格"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="stockQuantity" label="库存" width="100">
          <template #default="{ row }">
            <span
              :class="
                Number(row.stockQuantity) > 0 ? 'text-success' : 'text-danger'
              "
            >
              {{ row.stockQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="retailPrice" label="单价" width="100">
          <template #default="{ row }">￥{{ row.retailPrice }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <span class="selection-info"
          >已选择 {{ multipleSelection.length }} 项</span
        >
        <div>
          <el-button @click="visible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
            :disabled="multipleSelection.length === 0"
          >
            确认添加
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.selector-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
.text-success {
  color: #67c23a;
}
.pagination-bar {
  display: flex;
  justify-content: flex-end;
}
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

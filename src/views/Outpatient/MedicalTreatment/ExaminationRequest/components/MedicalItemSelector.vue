<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue'
import { ElTable } from 'element-plus'
import { useOrderStore } from '@/store/Outpatient/MedicalTreatment/OrderStore'
import {
  getExamItems,
  getLabItems,
  getDisposalItems
} from '@/api/modules/Outpatient/MedicalTreatment'
import {
  ApplyType,
  type MedicalItem
} from '@/types/Outpatient/MedicalTreatment'

const store = useOrderStore()

// 弹窗可见性
const visible = ref(false)

// 状态控制
const loading = ref(false)
const activeTab = ref<string>(ApplyType.EXAM) // 默认为检查
const keyword = ref('')
const tableData = ref<MedicalItem[]>([])
const total = ref(0)

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 8
})

// 选中的行（用于跨页多选）
const multipleSelection = ref<MedicalItem[]>([])
const tableRef = ref<InstanceType<typeof ElTable>>()

// 1. 获取购物车里所有项目的 ID 集合 (为了性能，用 Set)
const cartItemIds = computed(() => {
  return new Set(store.cartList.map((item) => item.itemId))
})

// 2. 定义 selectable 函数
// row: 当前行的可以直接获取的数据
// index: 索引
const checkSelectable = (row: MedicalItem) => {
  // 如果购物车里已经有了这个 ID，则不可选 (返回 false)
  return !cartItemIds.value.has(row.itemId)
}

// 打开弹窗的方法 (暴露给父组件)
const open = () => {
  visible.value = true
  // 重置状态
  keyword.value = ''
  pagination.page = 1
  activeTab.value = ApplyType.EXAM
  multipleSelection.value = [] // 每次打开清空上次的选择，或者你想保留也可以

  // 必须在弹窗渲染后清理表格选中状态
  nextTick(() => {
    tableRef.value?.clearSelection()
    fetchData()
  })
}

// 获取数据逻辑
const fetchData = async () => {
  loading.value = true
  try {
    let res
    console.log('Fetching data for tab:', activeTab.value)
    // 根据 Tab 调用不同接口
    if (activeTab.value === ApplyType.EXAM) {
      res = await getExamItems(
        pagination.page,
        pagination.pageSize,
        keyword.value
      )
    } else if (activeTab.value === ApplyType.LAB) {
      res = await getLabItems(
        pagination.page,
        pagination.pageSize,
        keyword.value
      )
    } else {
      res = await getDisposalItems(
        pagination.page,
        pagination.pageSize,
        keyword.value
      )
    }

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

// 监听 Tab 切换 -> 重置页码并查询
const handleTabChange = () => {
  pagination.page = 1
  // 切换Tab时，清空搜索框可能体验更好，或者保留搜索框看不同分类下的同名项目
  // 这里选择保留 keyword
  console.log('Active Tab Changed:', activeTab.value)
  fetchData()
}

// 监听搜索 -> 防抖 (简单版，element input 默认不支持 debounce props，这里直接调用)
let timer: ReturnType<typeof setTimeout>
const handleSearch = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    pagination.page = 1
    fetchData()
  }, 300) // 300ms 防抖
}

// 翻页
const handlePageChange = (newPage: number) => {
  pagination.page = newPage
  fetchData()
}

// 表格选中变化
const handleSelectionChange = (val: MedicalItem[]) => {
  multipleSelection.value = val
}

// 确认添加
const handleConfirm = () => {
  store.batchAddToCart(multipleSelection.value)
  visible.value = false
}

// 暴露方法
defineExpose({ open })
</script>

<template>
  <el-dialog
    v-model="visible"
    title="添加医疗项目"
    width="800px"
    destroy-on-close
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="selector-container">
      <!-- 1. 顶部 Tab 分类 -->
      <el-tabs
        v-model="activeTab"
        @tab-change="handleTabChange"
        class="custom-tabs"
      >
        <el-tab-pane label="检查项目" :name="ApplyType.EXAM" />
        <el-tab-pane label="检验项目" :name="ApplyType.LAB" />
        <el-tab-pane label="处置治疗" :name="ApplyType.DISPOSAL" />
      </el-tabs>

      <!-- 2. 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="keyword"
          placeholder="输入项目名称或编码搜索 (支持模糊匹配)"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>

      <!-- 3. 表格展示 -->
      <!-- row-key 和 reserve-selection 是跨页多选的关键 -->
      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        height="350px"
        :style="{
          width: '100%'
        }"
        row-key="itemId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
          reserve-selection
          :selectable="checkSelectable"
        />
        <el-table-column prop="itemCode" label="编码" width="100" />
        <el-table-column
          prop="itemName"
          label="项目名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="{ row }">
            <span class="price-text">￥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="说明"
          show-overflow-tooltip
        />
      </el-table>

      <!-- 4. 分页 -->
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
        <div class="selection-info">
          已选择 <span class="count">{{ multipleSelection.length }}</span> 项
        </div>
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

.search-bar {
  width: 100%;
}

.price-text {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .selection-info {
    color: #606266;
    font-size: 14px;

    .count {
      color: var(--el-color-primary);
      font-weight: bold;
      font-size: 16px;
      margin: 0 4px;
    }
  }
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}
</style>

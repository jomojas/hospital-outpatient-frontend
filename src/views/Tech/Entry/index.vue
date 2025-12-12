<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Refresh, VideoPlay, EditPen } from '@element-plus/icons-vue'
import { useTechStore, type TechModuleType } from '@/store/Tech/TechStore'
import { TechApplyStatus, TechStatusMap } from '@/types/Tech/TechStation'
import ResultDialog from './components/ResultDialog.vue'

const route = useRoute()
const store = useTechStore()
const resultDialogRef = ref<InstanceType<typeof ResultDialog>>()

const initPage = () => {
  const moduleType = route.meta.moduleType as TechModuleType
  if (moduleType) {
    store.setModule(moduleType)
    store.fetchEntryList()
  }
}

onMounted(() => initPage())
watch(
  () => route.path,
  () => initPage()
)

const handleSearch = () => {
  store.entryParams.page = 1
  store.fetchEntryList()
}

const handleRefresh = () => store.fetchEntryList()

const handlePageChange = (val: number) => {
  store.entryParams.page = val
  store.fetchEntryList()
}

const onExecute = (row: any) => {
  store.handleExecute(row.applyId)
}

const onInputResult = (row: any) => {
  resultDialogRef.value?.open(row)
}
</script>

<template>
  <div class="tech-entry-page">
    <el-card shadow="never">
      <div class="filter-bar">
        <div class="search-input">
          <el-input
            v-model="store.entryParams.keyword"
            placeholder="搜索患者姓名、病历号或项目名"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
        <div class="actions">
          <el-button
            :icon="Refresh"
            circle
            @click="handleRefresh"
            title="刷新列表"
          />
        </div>
      </div>

      <el-table
        :data="store.entryList"
        v-loading="store.entryLoading"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="patientName" label="患者姓名" width="120">
          <template #default="{ row }"
            ><span class="font-bold">{{ row.patientName }}</span></template
          >
        </el-table-column>
        <el-table-column prop="patientNo" label="病历号" width="120" />
        <el-table-column prop="gender" label="性别" width="70" />
        <el-table-column prop="itemName" label="项目名称" min-width="180">
          <template #default="{ row }"
            ><span class="text-primary">{{ row.itemName }}</span></template
          >
        </el-table-column>
        <el-table-column prop="applySite" label="部位" width="120">
          <template #default="{ row }">{{ row.applySite || '-' }}</template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="170">
          <template #default="{ row }">{{
            row.applyTime?.replace('T', ' ')
          }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="TechStatusMap[row.status]?.type" size="small">
              {{ TechStatusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <!-- 执行按钮：持久化锁定判断 -->
            <el-button
              v-if="
                row.status === TechApplyStatus.UNFINISHED &&
                !store.executingIds.has(row.applyId)
              "
              type="primary"
              size="small"
              :icon="VideoPlay"
              @click="onExecute(row)"
            >
              执行
            </el-button>
            <el-button v-else type="info" plain size="small" disabled>
              {{ store.executingIds.has(row.applyId) ? '请求中...' : '执行中' }}
            </el-button>

            <el-button
              type="success"
              size="small"
              :icon="EditPen"
              @click="onInputResult(row)"
            >
              录入
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="store.entryParams.page"
          v-model:page-size="store.entryParams.pageSize"
          :total="store.entryTotal"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    <ResultDialog ref="resultDialogRef" />
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-input {
  width: 400px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.font-bold {
  font-weight: bold;
}
.text-primary {
  color: var(--el-color-primary);
  font-weight: 500;
}
</style>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useTechStore, type TechModuleType } from '@/store/Tech/TechStore'
import { TechOperateTypeMap } from '@/types/Tech/TechStation'

const route = useRoute()
const store = useTechStore()

const initPage = () => {
  const moduleType = route.meta.moduleType as TechModuleType
  if (moduleType) {
    store.setModule(moduleType)
    store.fetchRecordList()
  }
}

onMounted(() => initPage())
watch(
  () => route.path,
  () => initPage()
)

const handleSearch = () => {
  store.recordParams.page = 1
  store.fetchRecordList()
}

const handleRefresh = () => store.fetchRecordList()

const handlePageChange = (val: number) => {
  store.recordParams.page = val
  store.fetchRecordList()
}

const formatTime = (isoString: string | undefined) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    .replace(/\//g, '-')
}
</script>

<template>
  <div class="tech-record-page">
    <el-card shadow="never">
      <div class="filter-bar">
        <div class="left">
          <el-input
            v-model="store.recordParams.keyword"
            placeholder="搜索患者、项目名称"
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #append
              ><el-button :icon="Search" @click="handleSearch"
            /></template>
          </el-input>

          <el-select
            v-model="store.recordParams.operateType"
            placeholder="操作类型"
            clearable
            style="width: 150px; margin-left: 10px"
            @change="handleSearch"
          >
            <el-option label="开始执行" value="EXECUTE" />
            <el-option label="录入结果" value="INPUT_RESULT" />
          </el-select>
        </div>
        <el-button :icon="Refresh" circle @click="handleRefresh" />
      </div>

      <el-table
        :data="store.recordList"
        v-loading="store.recordLoading"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="operateTime" label="操作时间" width="180">
          <template #default="{ row }">{{
            formatTime(row.operateTime)
          }}</template>
        </el-table-column>
        <el-table-column prop="patientName" label="患者" width="120" />
        <el-table-column prop="itemName" label="项目名称" min-width="150" />

        <el-table-column
          prop="operateType"
          label="操作类型"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.operateType === 'EXECUTE' ? '' : 'success'"
              effect="plain"
            >
              {{ TechOperateTypeMap[row.operateType] || row.operateType }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="operatorName" label="操作员" width="120">
          <template #default="{ row }">{{
            row.operatorName || row.operatorId
          }}</template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          min-width="200"
          show-overflow-tooltip
        />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="store.recordParams.page"
          v-model:page-size="store.recordParams.pageSize"
          :total="store.recordTotal"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

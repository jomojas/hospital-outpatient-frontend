<script setup lang="ts">
import { onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { usePharmacyStore } from '@/store/Pharmacy/PharmacyStore'
import { PharmacyOperateTypeMap } from '@/types/Pharmacy/PharmacyStation'
import {
  DrugUnitLabels,
  type DrugUnit
} from '@/types/Outpatient/MedicalTreatment' // 复用之前的单位映射

const store = usePharmacyStore()

// ✅ 新增：专门用于获取单位文本的辅助函数
const getUnitLabel = (unit: string) => {
  // 使用 'as DrugUnit' 断言，告诉 TS 这个字符串是合法的枚举 Key
  return DrugUnitLabels[unit as DrugUnit] || unit
}

onMounted(() => {
  store.fetchRecordList()
})

const handleSearch = () => {
  store.recordParams.page = 1
  store.fetchRecordList()
}

const handleRefresh = () => store.fetchRecordList()

const handlePageChange = (val: number) => {
  store.recordParams.page = val
  store.fetchRecordList()
}

// 时间格式化
const formatTime = (timeStr: string) =>
  timeStr?.replace('T', ' ').substring(0, 16)
</script>

<template>
  <div class="pharmacy-record-page">
    <el-card shadow="never">
      <!-- 顶部筛选 -->
      <div class="filter-bar">
        <div class="left">
          <el-input
            v-model="store.recordParams.keyword"
            placeholder="搜索患者 / 药品名称"
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
            v-model="store.recordParams.type"
            placeholder="操作类型"
            clearable
            style="width: 120px; margin-left: 10px"
            @change="handleSearch"
          >
            <el-option label="发药" value="DISPENSE" />
            <el-option label="退药" value="RETURN" />
          </el-select>
        </div>
        <el-button :icon="Refresh" circle @click="handleRefresh" />
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="store.recordList"
        v-loading="store.recordLoading"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="operateTime" label="操作时间" width="160">
          <template #default="{ row }">{{
            formatTime(row.operateTime)
          }}</template>
        </el-table-column>

        <el-table-column prop="patientName" label="患者" width="120" />

        <el-table-column prop="drugName" label="药品名称" min-width="150" />

        <el-table-column prop="specification" label="规格" width="120" />

        <el-table-column label="数量" width="100">
          <template #default="{ row }">
            {{ row.quantity }} {{ getUnitLabel(row.unit) }}
          </template>
        </el-table-column>

        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">￥{{ row.amount }}</template>
        </el-table-column>

        <el-table-column
          prop="operateType"
          label="类型"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.operateType === 'DISPENSE' ? 'success' : 'warning'"
              effect="plain"
            >
              {{ PharmacyOperateTypeMap[row.operateType] || row.operateType }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="operatorName" label="操作员" width="100" />
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
.pharmacy-record-page {
  padding: 20px;
}
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

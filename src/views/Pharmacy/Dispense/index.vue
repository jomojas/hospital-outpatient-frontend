<script setup lang="ts">
import { onMounted } from 'vue'
import { Search, Refresh, Box, Timer } from '@element-plus/icons-vue'
import { usePharmacyStore } from '@/store/Pharmacy/PharmacyStore'
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
  store.fetchPendingList()
})

const handleSearch = () => {
  store.pendingParams.page = 1
  store.fetchPendingList()
}

const handleRefresh = () => store.fetchPendingList()

const handlePageChange = (val: number) => {
  store.pendingParams.page = val
  store.fetchPendingList()
}

// 格式化时间
const formatTime = (timeStr: string) =>
  timeStr?.replace('T', ' ').substring(0, 16)
</script>

<template>
  <div class="pharmacy-dispense-page">
    <!-- 1. 顶部操作栏 -->
    <div class="toolbar">
      <div class="search-box">
        <el-input
          v-model="store.pendingParams.keyword"
          placeholder="扫描或输入: 患者姓名 / 病历号 / 药品名称"
          clearable
          size="large"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      <el-button
        :icon="Refresh"
        circle
        @click="handleRefresh"
        title="刷新队列"
      />
    </div>

    <!-- 2. 发药队列 (卡片列表) -->
    <div class="card-list" v-loading="store.pendingLoading">
      <!-- 空状态 -->
      <el-empty
        v-if="store.groupedPendingList.length === 0"
        description="当前无待发药处方"
      />

      <!-- 卡片循环 -->
      <div
        v-for="group in store.groupedPendingList"
        :key="group.registrationId"
        class="patient-card"
      >
        <!-- 卡片头部：患者信息 -->
        <div class="card-header">
          <div class="patient-info">
            <span class="name">{{ group.patientName }}</span>
            <el-tag
              size="small"
              :type="group.gender === '男' ? '' : 'danger'"
              effect="plain"
            >
              {{ group.gender }}
            </el-tag>
            <span class="no">ID: {{ group.patientNo }}</span>
          </div>
          <div class="meta-info">
            <el-icon><Timer /></el-icon>
            <span class="time">{{ formatTime(group.prescribeTime) }}</span>
          </div>
        </div>

        <!-- 卡片内容：药品表格 -->
        <div class="card-body">
          <el-table :data="group.items" style="width: 100%" size="small" border>
            <el-table-column
              prop="drugName"
              label="药品名称"
              min-width="150"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span class="drug-name">{{ row.drugName }}</span>
              </template>
            </el-table-column>

            <el-table-column
              prop="specification"
              label="规格"
              width="120"
              show-overflow-tooltip
            />

            <el-table-column label="数量" width="100" align="center">
              <template #default="{ row }">
                <span class="quantity">{{ row.quantity }}</span>
                <span class="unit">{{ getUnitLabel(row.unit) }}</span>
              </template>
            </el-table-column>

            <el-table-column
              prop="dosage"
              label="用法"
              min-width="120"
              show-overflow-tooltip
            />
          </el-table>
        </div>

        <!-- 卡片底部：操作 -->
        <div class="card-footer">
          <div class="summary">
            共 <span class="highlight">{{ group.items.length }}</span> 种药品
          </div>
          <el-button
            type="primary"
            :icon="Box"
            @click="store.handleDispense(group)"
          >
            确认发药
          </el-button>
        </div>
      </div>
    </div>

    <!-- 3. 分页 -->
    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="store.pendingParams.page"
        v-model:page-size="store.pendingParams.pageSize"
        :total="store.pendingTotal"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pharmacy-dispense-page {
  padding: 20px;
  background-color: #f0f2f5; // 浅灰背景，突出卡片
  min-height: calc(100vh - 84px);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .search-box {
    width: 500px;
  }
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.patient-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .card-header {
    padding: 12px 20px;
    background-color: #fafafa;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .patient-info {
      display: flex;
      align-items: center;
      gap: 10px;
      .name {
        font-size: 18px;
        font-weight: bold;
        color: #303133;
      }
      .no {
        color: #909399;
        font-size: 13px;
        font-family: monospace;
      }
    }

    .meta-info {
      color: #909399;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }

  .card-body {
    padding: 15px 20px;

    .drug-name {
      font-weight: 500;
      color: #303133;
    }
    .quantity {
      font-weight: bold;
      color: var(--el-color-primary);
      font-size: 15px;
      margin-right: 4px;
    }
    .unit {
      font-size: 12px;
      color: #606266;
    }
  }

  .card-footer {
    padding: 12px 20px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;

    .summary {
      color: #606266;
      font-size: 14px;
      .highlight {
        color: #f56c6c;
        font-weight: bold;
        font-size: 16px;
        margin: 0 4px;
      }
    }
  }
}

.pagination-bar {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

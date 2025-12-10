<script setup lang="ts">
import { onMounted, watch, onUnmounted } from 'vue'
import { Money, Wallet, Refresh } from '@element-plus/icons-vue'
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'
import { useFeeStore } from '@/store/Outpatient/MedicalTreatment/FeeStore'
import FeeTable from './components/FeeTable.vue'

const contextStore = useClinicContextStore()
const feeStore = useFeeStore()

const loadData = () => {
  if (contextStore.caseId) {
    feeStore.fetchFees(contextStore.caseId)
  }
}

onMounted(() => {
  if (contextStore.caseId) loadData()
})

watch(
  () => contextStore.caseId,
  (val) => {
    if (val) loadData()
  }
)

onUnmounted(() => {
  feeStore.reset()
})
</script>

<template>
  <div class="fee-inquiry-page" v-loading="feeStore.loading">
    <!-- 顶部统计卡片 -->
    <div class="summary-cards">
      <el-card shadow="never" class="card total">
        <div class="card-content">
          <div class="icon-box">
            <el-icon><Money /></el-icon>
          </div>
          <div class="info">
            <div class="label">累计总费用</div>
            <div class="value">￥{{ feeStore.feeData.totalAmount }}</div>
          </div>
        </div>
      </el-card>

      <el-card
        shadow="never"
        class="card unpaid"
        :class="{ 'has-debt': feeStore.hasUnpaid }"
      >
        <div class="card-content">
          <div class="icon-box">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="info">
            <div class="label">待缴费金额</div>
            <div class="value">￥{{ feeStore.feeData.unpaidAmount }}</div>
          </div>
        </div>
      </el-card>

      <!-- 挂号费单独展示 -->
      <el-card shadow="never" class="card reg">
        <div class="info-simple">
          <div class="label">挂号费</div>
          <div class="value">￥{{ feeStore.feeData.registrationFee }}</div>
          <el-tag size="small" type="success" effect="plain" class="mt-1"
            >已缴费</el-tag
          >
        </div>
      </el-card>
    </div>

    <!-- 费用明细列表 -->
    <div class="detail-section">
      <div class="section-header">
        <span class="title">费用明细</span>
        <el-button :icon="Refresh" circle size="small" @click="loadData" />
      </div>

      <el-tabs type="border-card">
        <el-tab-pane label="检查/治疗费用">
          <FeeTable :data="feeStore.feeData.medicalItemFees" type="item" />
        </el-tab-pane>
        <el-tab-pane label="处方药品费用">
          <FeeTable :data="feeStore.feeData.prescriptionFees" type="drug" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fee-inquiry-page {
  padding-bottom: 20px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  .card {
    border: none;
    background: #fcfcfc;
    border: 1px solid #ebeef5;

    .card-content {
      display: flex;
      align-items: center;
    }

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-right: 15px;
    }

    .info {
      flex: 1;
      .label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 4px;
      }
      .value {
        font-size: 24px;
        font-weight: bold;
        font-family: Arial, sans-serif;
      }
    }

    /* 样式变体 */
    &.total {
      .icon-box {
        background: #ecf5ff;
        color: #409eff;
      }
      .value {
        color: #303133;
      }
    }

    &.unpaid {
      .icon-box {
        background: #fdf6ec;
        color: #e6a23c;
      }
      .value {
        color: #606266;
      }

      &.has-debt {
        border-color: #fde2e2;
        background: #fef0f0;
        .value {
          color: #f56c6c;
        }
      }

      .remind-btn {
        margin-left: auto;
      }
    }

    &.reg {
      .info-simple {
        text-align: center;
        .label {
          font-size: 13px;
          color: #909399;
        }
        .value {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin: 5px 0;
        }
        .mt-1 {
          margin-top: 4px;
        }
      }
    }
  }
}

.detail-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    .title {
      font-size: 16px;
      font-weight: bold;
      border-left: 4px solid #409eff;
      padding-left: 10px;
    }
  }
}
</style>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMedicalRecordStore } from '@/store/Outpatient/MedicalTreatment/MedicalRecord'
import { useResultStore } from '@/store/Outpatient/MedicalTreatment/ResultStore'
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'
import { Postcard, DataAnalysis, Timer } from '@element-plus/icons-vue' // 引入图标

const recordStore = useMedicalRecordStore()
const resultStore = useResultStore()
const contextStore = useClinicContextStore()

onMounted(() => {
  if (contextStore.caseId) {
    resultStore.fetchResults(contextStore.caseId)
  }
})
</script>

<template>
  <div class="case-reference">
    <el-collapse :model-value="['1', '2']" class="custom-collapse">
      <!-- 1. 病历摘要 -->
      <el-collapse-item name="1">
        <template #title>
          <div class="panel-title">
            <el-icon class="icon"><Postcard /></el-icon>
            <span>病历摘要</span>
          </div>
        </template>

        <div class="record-content">
          <div class="info-block">
            <div class="label">主诉</div>
            <div class="text">
              {{ recordStore.initialForm.chiefComplaint || '暂无记录' }}
            </div>
          </div>

          <div class="info-block">
            <div class="label">现病史</div>
            <div class="text">
              {{ recordStore.initialForm.presentHistory || '暂无记录' }}
            </div>
          </div>

          <div class="info-block">
            <div class="label">体格检查</div>
            <div class="text">
              {{ recordStore.initialForm.physicalExam || '暂无记录' }}
            </div>
          </div>
        </div>
      </el-collapse-item>

      <!-- 2. 检查检验结果 -->
      <el-collapse-item name="2">
        <template #title>
          <div class="panel-title">
            <el-icon class="icon"><DataAnalysis /></el-icon>
            <span>辅助检查结果 ({{ resultStore.finishedList.length }})</span>
          </div>
        </template>

        <div class="result-list">
          <el-empty
            v-if="resultStore.finishedList.length === 0"
            description="暂无结果"
            :image-size="60"
            class="mini-empty"
          />

          <div
            v-for="item in resultStore.finishedList"
            :key="item.itemId"
            class="result-card"
          >
            <div class="card-header">
              <span class="item-name">{{ item.itemName }}</span>
              <div class="item-time">
                <el-icon><Timer /></el-icon>
                {{
                  item.performTime ? item.performTime.substring(5, 16) : '近日'
                }}
              </div>
            </div>

            <div class="card-divider"></div>

            <div class="card-body">
              {{ item.result || '结果尚未录入' }}
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped lang="scss">
.case-reference {
  height: 100%;
  overflow-y: auto;
  padding-right: 12px; // 给滚动条留点位置
  background-color: #fff;
  border-right: 1px solid #ebeef5;
}

// 自定义折叠面板样式，去掉边框让界面更干净
.custom-collapse {
  :deep(.el-collapse-item__header) {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #ebeef5;
    height: 48px;
  }
  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
  }
  :deep(.el-collapse-item__content) {
    padding-bottom: 20px;
  }
}

.panel-title {
  display: flex;
  align-items: center;
  .icon {
    margin-right: 8px;
    color: var(--el-color-primary);
    font-size: 16px;
  }
}

// 1. 病历摘要样式优化
.record-content {
  padding: 10px 4px;
}

.info-block {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    font-size: 12px;
    color: #909399; // 浅灰色的标签
    margin-bottom: 6px;
    font-weight: 500;
    display: flex;
    align-items: center;

    // 小圆点装饰
    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      background-color: #dcdfe6;
      border-radius: 50%;
      margin-right: 6px;
    }
  }

  .text {
    font-size: 14px;
    color: #303133; // 深黑色的内容
    line-height: 1.6;
    text-align: justify;
    padding-left: 10px; // 内容缩进
    border-left: 2px solid #f2f2f2; // 左侧淡线指引
  }
}

// 2. 检查结果样式优化
.result-list {
  padding: 10px 4px;
  background-color: #fbfbfb; // 给结果区一个极淡的背景区分
  border-radius: 4px;
}

.result-card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); // 轻微阴影
  margin-bottom: 12px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-left: 4px solid #67c23a; // 左侧绿色边框表示"已完成"
  transition: transform 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:last-child {
    margin-bottom: 0;
  }

  .card-header {
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-name {
      font-weight: bold;
      color: #303133;
      font-size: 14px;
    }

    .item-time {
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .card-divider {
    height: 1px;
    background-color: #f0f2f5;
    margin: 0 12px;
  }

  .card-body {
    padding: 10px 12px;
    font-size: 13px;
    color: #555;
    line-height: 1.5;
    white-space: pre-wrap;
  }
}

.mini-empty {
  padding: 20px 0;
}
</style>

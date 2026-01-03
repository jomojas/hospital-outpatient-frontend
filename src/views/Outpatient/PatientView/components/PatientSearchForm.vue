<script setup lang="ts">
import { reactive } from 'vue'
import {
  Search,
  Refresh,
  RefreshRight,
  User,
  Clock,
  Loading,
  CircleCheck
} from '@element-plus/icons-vue'
import { usePatientViewStore } from '@/store/Outpatient/PatientView/PatientView'
import { FRONTEND_STATUS_OPTIONS } from '@/types/Outpatient/PatientView'
import type {
  PatientSearchFormData,
  FrontendPatientStatusType
} from '@/types/Outpatient/PatientView'

// Store
const patientViewStore = usePatientViewStore()

// 搜索表单
const searchForm = reactive<PatientSearchFormData>({
  keyword: '',
  frontendStatus: undefined
})

// 搜索处理
async function handleSearch() {
  console.log('🔍 执行患者搜索，表单数据:', searchForm)

  // 如果选择了状态筛选，使用专门的状态筛选方法
  if (searchForm.frontendStatus) {
    await patientViewStore.searchByFrontendStatus(searchForm.frontendStatus)
  } else {
    // 普通搜索
    await patientViewStore.search({
      keyword: searchForm.keyword || undefined
    })
  }
}

// 状态变化处理
async function handleStatusChange() {
  console.log('📊 状态筛选变化:', searchForm.frontendStatus)

  if (searchForm.frontendStatus) {
    // 清空关键词，只按状态筛选
    searchForm.keyword = ''
    await patientViewStore.searchByFrontendStatus(searchForm.frontendStatus)
  } else {
    // 清除状态筛选
    await patientViewStore.search({
      keyword: searchForm.keyword || undefined
    })
  }
}

// 重置处理
async function handleReset() {
  console.log('🔄 重置患者搜索')

  // 重置表单
  searchForm.keyword = ''
  searchForm.frontendStatus = undefined

  // 重置Store
  await patientViewStore.reset()
}

// 刷新处理
async function handleRefresh() {
  console.log('🔄 刷新患者数据')
  await patientViewStore.refresh()
}

// 点击统计卡片筛选对应状态
async function handleStatCardClick(status?: FrontendPatientStatusType) {
  if (status) {
    searchForm.frontendStatus = status
    searchForm.keyword = ''
    await patientViewStore.searchByFrontendStatus(status)
  } else {
    // 点击总数卡片，清除筛选
    searchForm.frontendStatus = undefined
    await patientViewStore.search({
      keyword: searchForm.keyword || undefined
    })
  }
}
</script>

<template>
  <div class="patient-search-form">
    <!-- ✅ 更新为5个统计卡片 -->
    <div class="statistics-container">
      <!-- 总患者数 -->
      <el-card
        class="stat-card total"
        @click="handleStatCardClick()"
        :class="{ active: !searchForm.frontendStatus }"
      >
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">
              {{ patientViewStore.statistics.totalPatients }}
            </div>
            <div class="stat-label">总患者数</div>
          </div>
        </div>
      </el-card>

      <!-- 待初诊 -->
      <el-card
        class="stat-card waiting-initial"
        @click="handleStatCardClick('WAITING_INITIAL')"
        :class="{ active: searchForm.frontendStatus === 'WAITING_INITIAL' }"
      >
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">
              {{ patientViewStore.statistics.waitingInitialCount }}
            </div>
            <div class="stat-label">待初诊</div>
          </div>
        </div>
      </el-card>

      <!-- 初诊后 -->
      <el-card
        class="stat-card after-initial"
        @click="handleStatCardClick('AFTER_INITIAL')"
        :class="{ active: searchForm.frontendStatus === 'AFTER_INITIAL' }"
      >
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Loading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">
              {{ patientViewStore.statistics.afterInitialCount }}
            </div>
            <div class="stat-label">初诊后</div>
          </div>
        </div>
      </el-card>

      <!-- 待复诊 -->
      <el-card
        class="stat-card waiting-revisit"
        @click="handleStatCardClick('WAITING_REVISIT')"
        :class="{ active: searchForm.frontendStatus === 'WAITING_REVISIT' }"
      >
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Refresh /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">
              {{ patientViewStore.statistics.waitingRevisitCount }}
            </div>
            <div class="stat-label">待复诊</div>
          </div>
        </div>
      </el-card>

      <!-- 复诊结束 -->
      <el-card
        class="stat-card revisit-completed"
        @click="handleStatCardClick('REVISIT_COMPLETED')"
        :class="{ active: searchForm.frontendStatus === 'REVISIT_COMPLETED' }"
      >
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">
              {{ patientViewStore.statistics.revisitCompletedCount }}
            </div>
            <div class="stat-label">复诊结束</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <el-icon><Search /></el-icon>
          <span>患者搜索</span>
          <!-- ✅ 添加统计数据加载状态指示 -->
          <el-tag
            v-if="patientViewStore.statusCountLoading"
            type="info"
            size="small"
          >
            <el-icon class="is-loading"><Loading /></el-icon>
            加载统计中...
          </el-tag>
          <el-tag
            v-else-if="patientViewStore.statusCountData"
            type="success"
            size="small"
          >
            全局统计
          </el-tag>
          <el-tag v-else type="warning" size="small"> 本页统计 </el-tag>
        </div>
      </template>

      <el-form
        :model="searchForm"
        label-width="100px"
        :inline="true"
        @submit.prevent="handleSearch"
        class="search-form"
      >
        <el-row :gutter="20">
          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="患者姓名或病历号"
                clearable
                style="width: 250px"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item label="状态筛选">
              <el-select
                v-model="searchForm.frontendStatus"
                placeholder="选择患者状态"
                clearable
                style="width: 200px"
                @change="handleStatusChange"
              >
                <el-option
                  v-for="option in FRONTEND_STATUS_OPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xl="8" :lg="8" :md="12" :sm="24">
            <el-form-item>
              <div class="action-buttons">
                <el-button
                  type="primary"
                  @click="handleSearch"
                  :loading="patientViewStore.loading"
                >
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="handleReset">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
                <el-button @click="handleRefresh">
                  <el-icon><RefreshRight /></el-icon>
                  刷新
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/semantic' as *;

.patient-search-form {
  margin-bottom: $margin-lg;

  // ✅ 重新设计统计卡片样式
  .statistics-container {
    display: flex;
    gap: $margin-base;
    margin-bottom: $margin-lg;
    flex-wrap: wrap;

    .stat-card {
      flex: 1;
      min-width: 180px;
      border-radius: $border-radius-base;
      border: 1px solid $border-color-light;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      background: $background-color;
      overflow: hidden;

      // ✅ 默认悬停效果（轻微）
      &:hover {
        box-shadow: $shadow-soft;
        transform: translateY(-2px);
        border-color: $border-color;

        .stat-content .stat-icon {
          transform: scale(1.05);
        }
      }

      // ✅ 重新设计激活状态
      &.active {
        background: $background-color;
        border: 1px solid $primary-color;
        box-shadow: $shadow-soft;

        // ✅ 激活状态下的悬停效果（更优雅）
        &:hover {
          background: rgba($primary-color, 0.06);
          border-color: $primary-hover;
          box-shadow: $shadow-strong;
          transform: translateY(-3px);
        }

        // ✅ 激活状态指示器（左边框）
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: $primary-color;
          border-radius: 0 2px 2px 0;
        }

        .stat-content .stat-icon {
          transform: scale(1.08);
          box-shadow: $shadow-soft;
        }

        .stat-info {
          .stat-number {
            color: $primary-color;
            font-weight: 700;
          }

          .stat-label {
            color: $primary-hover;
            font-weight: 500;
          }
        }
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: $margin-base;
        padding: $padding-base;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;

          // ✅ 添加内阴影效果
          box-shadow: $shadow-soft;

          .el-icon {
            font-size: 24px;
            color: white;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
          }
        }

        .stat-info {
          flex: 1;

          .stat-number {
            font-size: $font-title;
            font-weight: 600;
            color: $text-color;
            font-family: $font-family-title;
            line-height: 1.2;
            transition: all 0.3s ease;
          }

          .stat-label {
            font-size: $font-caption;
            color: $text-color-secondary;
            margin-top: 4px;
            font-family: $font-family-body;
            transition: all 0.3s ease;
          }
        }
      }

      // ✅ 统一卡片配色为纯色
      &.total .stat-icon {
        background: $primary-color;
      }

      &.waiting-initial .stat-icon {
        background: #f97316;
      }

      &.after-initial .stat-icon {
        background: #595959;
      }

      &.waiting-revisit .stat-icon {
        background: #1890ff;
      }

      &.revisit-completed .stat-icon {
        background: #52c41a;
      }
    }
  }

  .search-card {
    border-radius: $border-radius-base;
    border: 1px solid $border-color-light;
    box-shadow: $shadow-soft;
    transition: box-shadow 0.3s ease, transform 0.2s ease;

    &:hover {
      box-shadow: $shadow-strong;
      transform: translateY(-1px);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: $margin-sm;
      font-weight: 600;
      color: $text-color;
      font-family: $font-family-title;
      font-size: $font-subtitle;

      .el-tag {
        margin-left: auto;
        font-size: 11px;
        border: none;

        &.el-tag--success {
          background: rgba(82, 196, 26, 0.12);
          color: #389e0d;
        }

        &.el-tag--warning {
          background: rgba(212, 136, 6, 0.12);
          color: #d48806;
        }

        &.el-tag--info {
          background: rgba(24, 144, 255, 0.12);
          color: #1890ff;
        }
      }
    }
  }

  .search-form {
    font-family: $font-family-body;

    .el-row {
      margin-bottom: $margin-base;
    }

    :deep(.el-form-item) {
      margin-bottom: $margin-base;
      margin-right: 0;

      .el-form-item__label {
        font-weight: 500;
        color: $text-color;
        font-family: $font-family-body;
        font-size: $font-body;
      }

      .el-form-item__content {
        .el-input,
        .el-select {
          .el-input__inner {
            border-radius: $border-radius-base;
            border-color: $border-color;
            height: 40px;
            transition: all 0.3s ease;

            &:hover {
              border-color: $primary-hover;
              box-shadow: 0 0 0 2px rgba($primary-color, 0.08);
            }

            &:focus {
              border-color: $primary-color;
              box-shadow: 0 0 0 2px rgba($primary-color, 0.12);
            }
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: $margin-sm;
    }
  }
}

// ✅ 优化按钮样式
:deep(.el-button) {
  border-radius: $border-radius-base;
  height: 40px;
  font-family: $font-family-body;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-soft;
  }
}

:deep(.el-button--primary) {
  background: $primary-color;
  border-color: $primary-color;
  box-shadow: $shadow-soft;

  &:hover {
    background: $primary-hover;
    border-color: $primary-hover;
    box-shadow: $shadow-strong;
  }
}

// ✅ 响应式设计 - 适配5个卡片
@media (max-width: 1200px) {
  .patient-search-form {
    .statistics-container {
      .stat-card {
        min-width: 160px;

        .stat-content {
          padding: $padding-sm;
          gap: $margin-sm;

          .stat-icon {
            width: 42px;
            height: 42px;

            .el-icon {
              font-size: 20px;
            }
          }

          .stat-info .stat-number {
            font-size: $font-subtitle;
          }
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .patient-search-form {
    .statistics-container {
      .stat-card {
        min-width: 140px;

        .stat-content {
          gap: $margin-sm;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .patient-search-form {
    .statistics-container {
      flex-direction: column;
      gap: $margin-sm;

      .stat-card {
        min-width: auto;

        .stat-content {
          .stat-icon {
            width: 40px;
            height: 40px;

            .el-icon {
              font-size: 18px;
            }
          }

          .stat-info .stat-number {
            font-size: $font-body;
          }
        }
      }
    }

    .search-form {
      .action-buttons {
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }
  }
}

// ✅ 极小屏幕适配 - 修正间距变量
@media (max-width: 480px) {
  .patient-search-form {
    .statistics-container {
      .stat-card {
        .stat-content {
          gap: $margin-sm; // ✅ 修正：使用 $margin-sm 替代 $margin-xs
          padding: $padding-sm;

          .stat-icon {
            width: 36px;
            height: 36px;

            .el-icon {
              font-size: 16px;
            }
          }

          .stat-info {
            .stat-number {
              font-size: $font-body;
            }

            .stat-label {
              font-size: 11px;
            }
          }
        }
      }
    }
  }
}
</style>

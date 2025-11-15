<script setup lang="ts">
import {
  List,
  Refresh,
  User,
  Calendar,
  Document
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { usePatientViewStore } from '@/store/Outpatient/PatientView/PatientView'
import {
  FrontendPatientStatus,
  calculateAge,
  formatAddress,
  maskIdCard,
  getStatusDisplayInfo
} from '@/types/Outpatient/PatientView'
import type { EnhancedDoctorPatient } from '@/store/Outpatient/PatientView/PatientView'

// Store
const patientViewStore = usePatientViewStore()

// 路由实例
const router = useRouter()

// 格式化日期
function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 判断是否可以开始诊疗
function canStartConsultation(patient: EnhancedDoctorPatient): boolean {
  return (
    patient.frontendStatus === FrontendPatientStatus.WAITING_INITIAL ||
    patient.frontendStatus === FrontendPatientStatus.WAITING_REVISIT
  )
}

// 行点击处理
function handleRowClick(row: EnhancedDoctorPatient) {
  console.log('👆 点击患者行:', row.name, row.medicalNo)
  handleViewDetail(row)
}

// 查看详情
function handleViewDetail(patient: EnhancedDoctorPatient) {
  console.log('👁️ 查看患者详情:', patient.name, patient.medicalNo)
  patientViewStore.openPatientDetail(patient.medicalNo)
}

// 开始诊疗
function handleStartConsultation(patient: EnhancedDoctorPatient) {
  console.log('🩺 开始诊疗:', patient.name, patient.medicalNo)

  const actionText =
    patient.frontendStatus === FrontendPatientStatus.WAITING_INITIAL
      ? '初诊'
      : '复诊'

  try {
    // ✅ 跳转到病案首页，并传递患者信息
    router.push({
      name: 'CaseHomepage',
      query: {
        medicalNo: patient.medicalNo,
        patientName: patient.name,
        action: actionText
      }
    })

    ElMessage.success(`开始为患者 ${patient.name} 进行${actionText}`)

    console.log('✅ 跳转到病案首页成功')
  } catch (error) {
    console.error('❌ 跳转到病案首页失败:', error)
    ElMessage.error('跳转失败，请重试')
  }
}

// 重试获取详情
async function retryFetchDetail() {
  if (patientViewStore.patientDetail?.medicalNo) {
    await patientViewStore.fetchPatientDetail(
      patientViewStore.patientDetail.medicalNo
    )
  }
}

// 刷新数据
async function handleRefresh() {
  await patientViewStore.refresh()
}

// 分页大小变化
async function handleSizeChange(pageSize: number) {
  await patientViewStore.changePage(1, pageSize)
}

// 当前页变化
async function handleCurrentChange(page: number) {
  await patientViewStore.changePage(page)
}
</script>

<template>
  <div class="patient-table">
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <el-icon><List /></el-icon>
            <span>患者列表</span>
            <el-tag v-if="patientViewStore.hasData" type="info" size="small">
              {{ patientViewStore.statistics.totalPatients }} 人
            </el-tag>
          </div>
          <div class="header-right">
            <el-button
              type="default"
              :loading="patientViewStore.loading"
              @click="handleRefresh"
            >
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table
        v-loading="patientViewStore.loading"
        :data="patientViewStore.patients"
        empty-text="暂无患者数据"
        stripe
        border
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <!-- 病历号 -->
        <el-table-column label="病历号" width="120" align="center">
          <template #default="{ row }">
            <span class="medical-no">{{ row.medicalNo }}</span>
          </template>
        </el-table-column>

        <!-- 患者姓名 -->
        <el-table-column label="患者姓名" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="patient-name">
              <el-icon><User /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 挂号日期 -->
        <el-table-column label="挂号日期" width="130" align="center">
          <template #default="{ row }">
            <div class="date-info">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(row.registrationDate) }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.statusDisplay.type"
              size="default"
              :style="{ color: row.statusDisplay.color }"
            >
              {{ row.statusDisplay.label }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 主诉 -->
        <el-table-column label="主诉" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="complaint-text">
              <template v-if="row.complaint">
                <el-icon><Document /></el-icon>
                <span>{{ row.complaint }}</span>
              </template>
              <template v-else>
                <span class="no-complaint">暂无主诉</span>
              </template>
            </div>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click.stop="handleViewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="canStartConsultation(row)"
              type="success"
              size="small"
              @click.stop="handleStartConsultation(row)"
            >
              开始诊疗
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="patientViewStore.paginationMeta.page"
          v-model:page-size="patientViewStore.paginationMeta.size"
          :total="patientViewStore.paginationMeta.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- ✅ 患者详情弹窗 -->
    <el-dialog
      v-model="patientViewStore.showDetailDialog"
      title="患者详细信息"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      @close="patientViewStore.closePatientDetail"
    >
      <!-- 弹窗内容 -->
      <div
        v-loading="patientViewStore.detailLoading"
        class="patient-detail-content"
      >
        <!-- 错误状态 -->
        <div v-if="patientViewStore.detailError" class="detail-error">
          <el-result
            icon="error"
            title="获取患者信息失败"
            :sub-title="patientViewStore.detailError"
          >
            <template #extra>
              <el-button type="primary" @click="retryFetchDetail">
                重新获取
              </el-button>
            </template>
          </el-result>
        </div>

        <!-- 患者详情 -->
        <div v-else-if="patientViewStore.patientDetail" class="detail-info">
          <!-- 基本信息 -->
          <div class="info-section">
            <h3 class="section-title">
              <el-icon><User /></el-icon>
              基本信息
            </h3>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="info-item">
                  <span class="label">患者姓名：</span>
                  <span class="value">{{
                    patientViewStore.patientDetail.name
                  }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <span class="label">病历号：</span>
                  <span class="value medical-no">{{
                    patientViewStore.patientDetail.medicalNo
                  }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <span class="label">性别：</span>
                  <span class="value">{{
                    patientViewStore.patientDetail.gender || '未知'
                  }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="info-item">
                  <span class="label">年龄：</span>
                  <span class="value"
                    >{{
                      patientViewStore.patientDetail.age ||
                      calculateAge(patientViewStore.patientDetail.birthday) ||
                      '未知'
                    }}
                    岁</span
                  >
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <span class="label">生日：</span>
                  <span class="value">{{
                    formatDate(patientViewStore.patientDetail.birthday || '') ||
                    '暂无'
                  }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="info-item">
                  <span class="label">患者ID：</span>
                  <span class="value">{{
                    patientViewStore.patientDetail.patientId || '暂无'
                  }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <span class="label">身份证号：</span>
                  <span class="value id-card">{{
                    maskIdCard(patientViewStore.patientDetail.idCard)
                  }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="label">地址：</span>
                  <span class="value">{{
                    formatAddress(patientViewStore.patientDetail.address)
                  }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 挂号信息 -->
          <div class="info-section">
            <h3 class="section-title">
              <el-icon><Calendar /></el-icon>
              挂号信息
            </h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <span class="label">挂号状态：</span>
                  <el-tag
                    :type="
                      getStatusDisplayInfo(
                        patientViewStore.patientDetail.status
                      ).type
                    "
                    size="small"
                  >
                    {{
                      getStatusDisplayInfo(
                        patientViewStore.patientDetail.status
                      ).label
                    }}
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="label">挂号日期：</span>
                  <span class="value">{{
                    formatDate(
                      patientViewStore.patientDetail.registrationDate || ''
                    )
                  }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 诊疗信息 -->
          <div
            v-if="patientViewStore.patientDetail.complaint"
            class="info-section"
          >
            <h3 class="section-title">
              <el-icon><Document /></el-icon>
              诊疗信息
            </h3>
            <div class="info-item">
              <span class="label">主诉：</span>
              <span class="value complaint">{{
                patientViewStore.patientDetail.complaint
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 弹窗底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="patientViewStore.closePatientDetail">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
@use '@/styles/tokens' as *;

.patient-table {
  .table-card {
    border-radius: $border-radius-base;
    border: 1px solid $border-color-light;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: $margin-sm;
      font-weight: 600;
      color: $text-color;
      font-family: $font-family-title;
    }

    .header-right {
      display: flex;
      gap: $margin-sm;
    }
  }

  .medical-no {
    font-family: $font-family-code;
    color: $primary-color;
    font-weight: 600;
    font-size: $font-caption;
  }

  .patient-name {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: $text-color;

    .el-icon {
      color: $primary-color;
    }
  }

  .date-info {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $text-color-secondary;
    font-size: $font-caption;

    .el-icon {
      color: $text-color-secondary;
    }
  }

  .complaint-text {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    color: $text-color;
    font-size: $font-body;

    .el-icon {
      color: $text-color-secondary;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .no-complaint {
      color: $text-color-disabled;
      font-style: italic;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: $margin-lg;
  }
}

// ✅ 患者详情弹窗样式
.patient-detail-content {
  min-height: 400px;
  font-family: $font-family-body;

  .detail-error {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .detail-info {
    .info-section {
      margin-bottom: $margin-lg;
      padding: $padding-base;
      background: $background-color-secondary;
      border-radius: $border-radius-base;
      border: 1px solid $border-color-light;

      .section-title {
        display: flex;
        align-items: center;
        gap: $margin-sm;
        margin: 0 0 $margin-base 0;
        font-size: $font-subtitle;
        font-weight: 600;
        color: $text-color;
        font-family: $font-family-title;

        .el-icon {
          color: $primary-color;
          font-size: 18px;
        }
      }

      .info-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: $margin-sm;
        line-height: 1.6;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-weight: 600;
          color: $text-color-secondary;
          width: 100px;
          flex-shrink: 0;
          font-size: $font-body;
        }

        .value {
          color: $text-color;
          font-size: $font-body;
          flex: 1;

          &.medical-no {
            font-family: $font-family-code;
            color: $primary-color;
            font-weight: 600;
          }

          &.id-card {
            font-family: $font-family-code;
            color: $text-color-secondary;
          }

          &.complaint {
            line-height: 1.8;
            padding: $padding-sm;
            background: $background-color;
            border-radius: $border-radius-base;
            border: 1px solid $border-color-light;
          }
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: $margin-sm;
}

// 表格样式优化
:deep(.el-table) {
  border-radius: $border-radius-base;
  font-family: $font-family-body;

  .el-table__header {
    th {
      background-color: $background-color-secondary;
      color: $text-color;
      font-weight: 600;
      font-family: $font-family-title;
      border-bottom: 1px solid $border-color;
    }
  }

  .el-table__body {
    td {
      color: $text-color;
      border-bottom: 1px solid $border-color-light;
    }
  }

  .el-table__row {
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: $background-color-hover;
    }
  }
}

:deep(.el-button) {
  border-radius: $border-radius-base;
  font-family: $font-family-body;
  font-size: $font-caption;
}

:deep(.el-tag) {
  border-radius: $border-radius-base;
  font-family: $font-family-body;
  font-weight: 500;
}

:deep(.el-dialog) {
  border-radius: $border-radius-base;

  .el-dialog__header {
    background: $background-color-secondary;
    border-bottom: 1px solid $border-color-light;

    .el-dialog__title {
      font-family: $font-family-title;
      font-weight: 600;
      color: $text-color;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .patient-table {
    .table-header {
      flex-direction: column;
      gap: $margin-sm;
      align-items: stretch;

      .header-left,
      .header-right {
        justify-content: center;
      }
    }

    .pagination-wrapper {
      margin-top: $margin-base;
    }
  }

  :deep(.el-table) {
    font-size: $font-caption;
  }

  :deep(.el-button) {
    padding: 4px 8px;
    font-size: 12px;
  }

  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;
  }

  .patient-detail-content {
    .detail-info {
      .info-section {
        padding: $padding-sm;

        .section-title {
          font-size: $font-body;
        }

        .info-item {
          flex-direction: column;
          align-items: flex-start;

          .label {
            width: auto;
            margin-bottom: 2px;
          }
        }
      }
    }
  }
}
</style>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Document,
  DocumentAdd,
  View,
  CircleCheck,
  EditPen,
  Money,
  Lock,
  Refresh,
  SwitchButton
} from '@element-plus/icons-vue'

// 1. 引入后端状态枚举
import { BackendPatientStatus } from '@/types/Outpatient/PatientView'
// 2. 引入 API 方法
import { finishVisit } from '@/api/modules/Outpatient/MedicalTreatment'
// 3. 引入 Context Store
import { useClinicContextStore } from '@/store/Outpatient/MedicalTreatment/ClinicContext'
// 4. 引入业务 Store (用于清理数据)
import { useMedicalRecordStore } from '@/store/Outpatient/MedicalTreatment/MedicalRecord'
// import { usePrescriptionStore } from '@/store/Outpatient/PrescriptionStore' // 后续创建后取消注释
// import { useOrderStore } from '@/store/Outpatient/OrderStore' // 后续创建后取消注释

const route = useRoute()
const router = useRouter()

// Store 实例
const contextStore = useClinicContextStore()
const recordStore = useMedicalRecordStore()
// const prescriptionStore = usePrescriptionStore()
// const orderStore = useOrderStore()

const visitId = computed(() => Number(route.params.visitId))
const currentRouteName = computed(() => route.name)
const loading = ref(false)

// ==========================================
// 1. 生命周期管理 (Lifecycle)
// ==========================================

onMounted(async () => {
  if (!visitId.value || isNaN(visitId.value)) {
    ElMessage.warning('无效的接诊ID，返回患者列表')
    router.replace('/outpatient/patient-view')
    return
  }
  await loadContext()
})

/**
 * ✅ 核心：组件销毁时，重置所有 Store 的内存状态
 * 场景：刷新页面、点击返回列表、点击结束接诊跳转
 * 作用：防止下一个患者看到上一个患者的内存残留数据
 */
onUnmounted(() => {
  // 1. 清空上下文
  contextStore.clear()

  // 2. 重置业务 Store (停止 watch，清空 form 变量)
  recordStore.resetForms()
  // prescriptionStore.resetState()
  // orderStore.resetState()
})

// ==========================================
// 2. 业务逻辑
// ==========================================

const loadContext = async () => {
  try {
    loading.value = true
    await contextStore.initContext(visitId.value)
  } catch (e) {
    ElMessage.error('患者数据加载失败')
  } finally {
    loading.value = false
  }
}

// 绑定数据
const patientInfo = computed(() => contextStore.patientInfo)
const statusInfo = computed(() => contextStore.visitStatusInfo)

// 菜单配置
const menuList = computed(() => [
  {
    title: '病案首页',
    routeName: 'CaseHomepage',
    icon: Document,
    accessible: contextStore.menuPermissions.caseHome
  },
  {
    title: '检查申请',
    routeName: 'ExaminationRequest',
    icon: DocumentAdd,
    accessible: contextStore.menuPermissions.examRequest
  },
  {
    title: '结果查看',
    routeName: 'ResultView',
    icon: View,
    accessible: contextStore.menuPermissions.resultView
  },
  {
    title: '门诊确诊',
    routeName: 'DiagnosisConfirm',
    icon: CircleCheck,
    accessible: contextStore.menuPermissions.diagnosis
  },
  {
    title: '开设处方',
    routeName: 'Prescription',
    icon: EditPen,
    accessible: contextStore.menuPermissions.prescription
  },
  {
    title: '费用查询',
    routeName: 'FeeInquiry',
    icon: Money,
    accessible: contextStore.menuPermissions.feeInquiry
  }
])

// 导航
const handleNav = (menu: any) => {
  if (!menu.accessible) {
    ElMessage.warning('当前流程状态不可访问此页面')
    return
  }
  router.push({ name: menu.routeName, params: { visitId: visitId.value } })
}

/**
 * 返回列表 (中途离开)
 * 逻辑：只跳转，触发 onUnmounted 清内存，但保留 SessionStorage 草稿
 */
const goBack = () => {
  router.push('/outpatient/patient-view')
}

/**
 * 结束接诊 (彻底完成)
 * 逻辑：判断状态 -> (可选)调用API结束 -> 清除 Storage 草稿 -> 跳转
 */
const handleFinish = () => {
  ElMessageBox.confirm(
    '确认结束本次接诊吗？结束后患者状态将更新。',
    '结束接诊',
    {
      confirmButtonText: '确定结束',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    // ✅ 注意这里要加 async
    try {
      loading.value = true // 开启全屏 loading 防止误触

      // 1. ✅ 核心逻辑：如果是“已复诊”状态，说明无需开药，调用接口结束诊疗
      if (contextStore.visitStatus === BackendPatientStatus.REVISITED) {
        await finishVisit(visitId.value)
        ElMessage.success('诊疗已完成，状态已更新')
      } else {
        // 如果是其他状态（如待复诊），可能只是暂时退出，提示一下即可
        ElMessage.success('已退出接诊')
      }

      // 2. 彻底清除该患者的所有草稿缓存
      recordStore.clearDraft()
      // prescriptionStore.clearDraft()
      // orderStore.clearDraft()

      // 3. 跳转回列表
      router.push('/outpatient/patient-view')
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="workspace-layout" v-loading="loading">
    <!-- Header -->
    <header class="workspace-header">
      <div class="back-area" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回列表</span>
      </div>

      <el-divider direction="vertical" class="header-divider" />

      <div class="patient-banner" v-if="patientInfo.name">
        <span class="p-name">{{ patientInfo.name }}</span>
        <el-tag
          size="small"
          :type="patientInfo.gender === '男' ? '' : 'danger'"
          class="p-tag"
          >{{ patientInfo.gender }}</el-tag
        >
        <span class="p-meta">{{ patientInfo.age }}岁</span>
        <span class="p-divider">|</span>
        <span class="p-meta">病历号: {{ patientInfo.medicalNo }}</span>

        <!-- 状态徽章 (使用 Getter 计算出的 Info) -->
        <div class="status-badge">
          <span class="label">当前状态:</span>
          <el-tag :type="statusInfo.type" effect="plain" round size="small">
            {{ statusInfo.label }}
          </el-tag>
        </div>
      </div>

      <div class="patient-banner placeholder" v-else>
        <span v-if="!loading">加载患者信息中...</span>
      </div>

      <div class="actions-area">
        <el-tooltip content="刷新数据" placement="bottom">
          <el-button circle :icon="Refresh" @click="loadContext" />
        </el-tooltip>

        <el-button
          type="danger"
          plain
          :icon="SwitchButton"
          @click="handleFinish"
          class="finish-btn"
        >
          结束接诊
        </el-button>
      </div>
    </header>

    <!-- Body -->
    <div class="workspace-body">
      <aside class="workspace-sidebar">
        <div
          v-for="menu in menuList"
          :key="menu.routeName"
          class="menu-item"
          :class="{
            active: currentRouteName === menu.routeName,
            disabled: !menu.accessible
          }"
          @click="handleNav(menu)"
        >
          <div class="active-bar"></div>
          <el-icon class="menu-icon"><component :is="menu.icon" /></el-icon>
          <span class="menu-title">{{ menu.title }}</span>
          <el-icon v-if="!menu.accessible" class="lock-icon"><Lock /></el-icon>
        </div>
      </aside>

      <main class="workspace-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 变量定义
$header-height: 56px;
$sidebar-width: 200px;
$primary-color: var(--el-color-primary);
$bg-color: #f5f7fa;
$border-color: #e4e7ed;

.workspace-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.workspace-header {
  height: $header-height;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid $border-color;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
  background-color: #fff;

  .back-area {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #606266;
    font-size: 14px;
    transition: color 0.3s;
    &:hover {
      color: $primary-color;
    }
    .el-icon {
      margin-right: 4px;
      font-size: 16px;
    }
  }

  .header-divider {
    margin: 0 20px;
    height: 18px;
  }

  .patient-banner {
    flex: 1;
    display: flex;
    align-items: center;
    &.placeholder {
      color: #909399;
    }
    .p-name {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-right: 12px;
    }
    .p-tag {
      margin-right: 12px;
    }
    .p-meta {
      font-size: 14px;
      color: #606266;
    }
    .p-divider {
      margin: 0 10px;
      color: #dcdfe6;
    }
    .status-badge {
      margin-left: 24px;
      display: flex;
      align-items: center;
      .label {
        font-size: 12px;
        color: #909399;
        margin-right: 8px;
      }
    }
  }

  .actions-area {
    display: flex;
    align-items: center;
    gap: 12px;
    .finish-btn {
      margin-left: 8px;
    }
  }
}

.workspace-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.workspace-sidebar {
  width: $sidebar-width;
  background-color: #fbfbfb;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  padding-top: 12px;

  .menu-item {
    position: relative;
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 20px 0 24px;
    cursor: pointer;
    color: #606266;
    transition: all 0.3s;

    .active-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: $primary-color;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .menu-icon {
      font-size: 18px;
      margin-right: 12px;
    }
    .menu-title {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }
    .lock-icon {
      font-size: 14px;
      color: #c0c4cc;
    }

    &:hover:not(.disabled) {
      background-color: #f0f7ff;
      color: $primary-color;
    }
    &.active {
      background-color: #e6f1fc;
      color: $primary-color;
      .active-bar {
        opacity: 1;
      }
    }
    &.disabled {
      cursor: not-allowed;
      color: #c0c4cc;
      .menu-icon {
        color: #dcdfe6;
      }
    }
  }
}

.workspace-content {
  flex: 1;
  padding: 20px;
  background-color: $bg-color;
  overflow-y: auto;
  position: relative;
}

// Fade 动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>

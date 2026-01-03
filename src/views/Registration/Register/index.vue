<script setup lang="ts">
import { computed } from 'vue'
import PatientSearch from './components/PatientSearch.vue'
import PatientForm from './components/PatientForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import { useRegistrationStore } from '@/store/Registration/Register/RegistrationStore'
import type { SearchPayload } from '@/types/Registration/Register'

const registrationStore = useRegistrationStore()
const searchClicked = computed(() => registrationStore.searchClicked)
const patientFound = computed(() => registrationStore.patientFound)
const finishedResgiter = computed(() => registrationStore.finishedResgiter)

function onSearch(payload: SearchPayload) {
  registrationStore.searchPatientFun(payload.name, payload.idNumber)
}
</script>

<template>
  <div class="registration-container">
    <!-- 🎯 第一步：患者搜索 -->
    <div class="registration-step">
      <PatientSearch @search="onSearch" />
    </div>
    <!-- 🎯 第二步：患者信息表单 -->
    <div class="registration-step" v-show="searchClicked && !finishedResgiter">
      <PatientForm />
    </div>

    <!-- 🎯 第三步：挂号表单 -->
    <div class="registration-step" v-show="patientFound && !finishedResgiter">
      <RegisterForm />
    </div>
  </div>
</template>

<style scoped lang="scss">
// ✅ 整体容器布局
.registration-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: $padding-lg;
  background: linear-gradient(135deg, #f7fbff 0%, #f1f5ff 40%, #ffffff 100%);
  min-height: 100vh;
}

// ✅ 统一控制每个步骤组件的样式
.registration-step {
  margin-bottom: $margin-lg;

  // 🎯 设置卡片的统一样式
  :deep(.el-card) {
    max-width: 900px;
    margin: 0 auto;
    border-radius: $border-radius-base * 2;
    border: 1px solid $border-color-light;
    box-shadow: $shadow-soft;
    transition: all 0.3s ease;
    background-color: $background-color;

    &:hover {
      box-shadow: $shadow-strong;
      border-color: $primary-color;
    }
  }

  // 🎯 卡片内容区域
  :deep(.el-card__body) {
    padding: $padding-lg;
  }

  // 🎯 最后一个步骤移除底部间距
  &:last-child {
    margin-bottom: 0;
  }
}

// ✅ 针对不同步骤的特殊样式
.registration-step {
  // 🎯 第一步：患者搜索
  &:nth-child(1) {
    :deep(.el-card) {
      border-left: 4px solid $primary-color;
      background: linear-gradient(
        135deg,
        $background-color-hover 0%,
        $background-color 100%
      );

      .search-title {
        color: $primary-color;
        font-family: $font-family-title;
        font-size: $font-subtitle;
        font-weight: 600;
      }
    }
  }

  // 🎯 第二步：患者信息
  &:nth-child(2) {
    :deep(.el-card) {
      border-left: 4px solid $success-color;

      .form-title,
      .section-title {
        color: $success-color;
        font-family: $font-family-title;
        font-size: $font-subtitle;
        font-weight: 600;
      }
    }
  }

  // 🎯 第三步：挂号表单
  &:nth-child(3) {
    :deep(.el-card) {
      border-left: 4px solid $warning-color;

      .register-title,
      .form-section-title {
        color: $warning-color;
        font-family: $font-family-title;
        font-size: $font-subtitle;
        font-weight: 600;
      }
    }
  }
}

// ✅ 表单相关样式统一
.registration-step {
  :deep(.el-form) {
    // 表单项间距
    .el-form-item {
      margin-bottom: $margin-base;

      // 标签样式
      .el-form-item__label {
        color: $text-color;
        font-size: $font-body;
        font-weight: 500;
        font-family: $font-family-body;
      }

      // 输入框样式
      .el-input__wrapper {
        border-radius: $border-radius-base;
        border-color: $border-color-light;
        transition: all 0.3s ease;

        &:hover {
          border-color: $border-color;
        }

        &.is-focus {
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
        }
      }

      // 错误状态
      &.is-error {
        .el-input__wrapper {
          border-color: $error-color;
          box-shadow: 0 0 0 2px rgba($error-color, 0.1);
        }
      }
    }

    // 按钮样式
    .el-button {
      border-radius: $border-radius-base;
      font-size: $font-body;
      font-family: $font-family-body;
      padding: $padding-sm $padding-base;

      &--primary {
        background-color: $primary-color;
        border-color: $primary-color;

        &:hover {
          background-color: $primary-hover;
          border-color: $primary-hover;
        }

        &:active {
          background-color: $primary-active;
          border-color: $primary-active;
        }
      }

      &--default {
        color: $text-color;
        border-color: $border-color;

        &:hover {
          color: $primary-color;
          border-color: $primary-color;
          background-color: $background-color-hover;
        }
      }
    }
  }
}
</style>

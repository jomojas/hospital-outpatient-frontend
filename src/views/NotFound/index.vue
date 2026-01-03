<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 404 图形 -->
      <div class="not-found-graphic">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- 背景圆圈 -->
          <defs>
            <linearGradient
              id="notFoundGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style="stop-color: #409eff; stop-opacity: 0.1"
              />
              <stop
                offset="100%"
                style="stop-color: #67c23a; stop-opacity: 0.1"
              />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="95" fill="url(#notFoundGradient)" />

          <!-- 大的404文字 -->
          <text
            x="100"
            y="90"
            text-anchor="middle"
            font-size="70"
            font-weight="bold"
            fill="#409eff"
            opacity="0.8"
          >
            404
          </text>
          <text
            x="100"
            y="130"
            text-anchor="middle"
            font-size="24"
            fill="#606266"
          >
            页面未找到
          </text>
        </svg>
      </div>

      <!-- 错误信息 -->
      <div class="error-info">
        <h1>哎呀！页面未找到</h1>
        <p class="error-description">抱歉，您访问的页面不存在或已被删除</p>
        <p class="error-code">错误代码: 404 Not Found</p>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上一页
        </el-button>
      </div>

      <!-- 帮助建议 -->
      <div class="help-section">
        <h3>您可以尝试：</h3>
        <ul>
          <li>检查URL是否输入正确</li>
          <li>返回首页重新开始浏览</li>
          <li>联系系统管理员寻求帮助</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/semantic' as *;

.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: $padding-lg;
}

.not-found-content {
  background: white;
  border-radius: $border-radius-base * 2;
  box-shadow: $shadow-strong;
  padding: $padding-lg;
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: slideIn 0.5s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.not-found-graphic {
  margin-bottom: $margin-lg;

  svg {
    width: 200px;
    height: 200px;
    margin: 0 auto;
    display: block;
  }
}

.error-info {
  margin-bottom: $margin-lg;

  h1 {
    font-size: $font-title;
    font-weight: 700;
    color: $text-color;
    margin-bottom: $margin-sm;
    font-family: $font-family-title;
  }

  .error-description {
    font-size: $font-subtitle;
    color: $text-color-secondary;
    margin-bottom: $margin-base;
    line-height: 1.6;
  }

  .error-code {
    font-size: $font-body;
    color: $text-color-disabled;
    font-family: $font-family-code;
    margin: 0;
  }
}

.action-buttons {
  display: flex;
  gap: $margin-base;
  justify-content: center;
  margin-bottom: $margin-lg;
  flex-wrap: wrap;
}

:deep(.action-buttons .el-button) {
  border-radius: $border-radius-base;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-strong;
  }
}

:deep(.action-buttons .el-button--primary) {
  background: $primary-color;
  border-color: $primary-color;

  &:hover {
    background: $primary-hover;
    border-color: $primary-hover;
  }
}

.help-section {
  background: $background-color-secondary;
  border-left: 4px solid $primary-color;
  border-radius: $border-radius-base;
  padding: $padding-lg;
  text-align: left;

  h3 {
    font-size: $font-subtitle;
    color: $text-color;
    margin-bottom: $margin-base;
    font-weight: 600;
    font-family: $font-family-title;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: $font-body;
      color: $text-color-secondary;
      margin-bottom: $margin-sm;
      padding-left: $padding-base;
      position: relative;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }

      &::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: $primary-color;
        font-weight: bold;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-container {
    padding: $padding-base;
  }

  .not-found-content {
    padding: $padding-lg;
  }

  .not-found-graphic {
    svg {
      width: 150px;
      height: 150px;
    }
  }

  .error-info {
    h1 {
      font-size: $font-subtitle;
    }

    .error-description {
      font-size: $font-body;
    }
  }

  .action-buttons {
    flex-direction: column;
  }

  :deep(.action-buttons .el-button) {
    width: 100%;
  }

  .help-section {
    h3 {
      font-size: $font-body;
    }

    ul li {
      font-size: $font-caption;
    }
  }
}
</style>

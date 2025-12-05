<script setup lang="ts">
// 引入你现有的组件
import PageHeader from '@/components/PageHeader.vue'
</script>

<template>
  <el-container class="simple-layout">
    <!-- 头部区域，高度固定 60px (根据你的设计调整) -->
    <el-header class="layout-header" height="60px">
      <!-- ✅ 直接复用你现有的 PageHeader 组件 -->
      <PageHeader />
    </el-header>

    <!-- 内容区域，自动撑满剩余高度 -->
    <el-main class="layout-main">
      <!-- 路由出口 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<style scoped lang="scss">
.simple-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa; // 整个页面的背景色，建议浅灰，突出中间的卡片
}

.layout-header {
  padding: 0; // 清除 el-header 默认的 padding，因为 PageHeader 内部已经有 padding 了
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08); // 加一点阴影更有层次感
  z-index: 10;
  background-color: #fff;
}

.layout-main {
  padding: 20px; // 给内容区留一点边距
  overflow-y: auto; // 内容溢出滚动
}
</style>

<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import Sidebar from '@/components/SideBar.vue'
</script>

<template>
  <el-container class="main-layout">
    <!-- 顶部Header -->
    <el-header class="header-container">
      <PageHeader />
    </el-header>
    <!-- 下方为侧边栏+内容 -->
    <el-container class="body-container">
      <!-- 侧边栏 -->
      <el-aside class="sidebar-container">
        <Sidebar />
      </el-aside>
      <!-- 主内容 -->
      <el-main class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.header-container {
  height: 60px;
  padding: 0;
  z-index: 10;
}
.body-container {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: row;
}
.sidebar-container {
  width: 200px;
  min-width: 200px;
  background: $background-color;
  border-right: 1px solid #f0f0f0;
  height: 100%;
  overflow: auto;
}
.main-content {
  flex: 1 1 0;
  background: $background-color-secondary;
  overflow: auto;
  min-width: 0;
}
.content-wrapper {
  padding: $padding-lg;
  min-width: 900px; /* 可根据实际需求调整 */
}
</style>

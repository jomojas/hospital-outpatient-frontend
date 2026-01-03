<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/store/app'
import {
  setFaviconByDepartment,
  updatePageTitle,
  setLoginFavicon
} from '@/utils/favicon'

const appStore = useAppStore()

// ✅ 页面刷新时恢复对应的favicon
onMounted(() => {
  if (appStore.isLoggedIn() && appStore.loginData) {
    // 已登录，恢复登录角色对应的favicon
    setFaviconByDepartment(appStore.loginData.departmentType)
    updatePageTitle(
      appStore.loginData.departmentType,
      appStore.loginData.departmentName
    )
  } else {
    // 未登录，设置登录页favicon
    setLoginFavicon()
  }
})
</script>

<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>

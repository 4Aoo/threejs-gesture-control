<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ElMenu, ElMenuItem } from 'element-plus'
</script>

<template>
  <div class="app-root">
    <!-- ✅ 顶部固定导航 -->
    <header class="nav-header">
      <el-menu
        mode="horizontal"
        background-color="#ffffffee"
        text-color="#333"
        active-text-color="#409EFF"
        class="el-navbar"
        router>
        <el-menu-item index="/">
          <span class="nav-icon">🌍</span> 交互页面
        </el-menu-item>
        <el-menu-item index="/handTracker">
          <span class="nav-icon">🖐️</span> 手势预览
        </el-menu-item>
      </el-menu>
    </header>

    <!-- ✅ 页面内容渲染 -->
    <main class="page-view">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html, #app {
  width: 100%;
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f6fa;
}

.app-root {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 56px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(6px);
}

.el-navbar {
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: 500;
  padding: 0 24px;
  font-size: 16px;
}

.el-navbar .el-menu-item {
  padding: 0 20px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
  border-radius: 6px;
}

.el-navbar .el-menu-item:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

.nav-icon {
  margin-right: 6px;
  font-size: 18px;
}

.page-view {
  margin-top: 56px;
  width: 100%;
  height: calc(100vh - 56px);
  overflow: hidden;
  background-color: #fff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.05);
}
</style>

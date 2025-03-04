<template>
  <el-container class="layout-container">
    <el-header class="header">
      <Header :collapsed="collapsed" @update:collapsed="collapsed = $event" />
    </el-header>
    <el-container>
      <el-aside :width="collapsed ? '64px' : '200px'" class="aside">
        <Sidebar :collapsed="collapsed" />
      </el-aside>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const collapsed = ref(false)
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;

  .header {
    padding: 0;
    height: 60px;
    background-color: #2c3e50;
    border-bottom: 1px solid #34495e;
  }

  .aside {
    background-color: #34495e;
    transition: width 0.3s;
    overflow: hidden;
  }

  .main {
    background-color: #f5f8fa;
    padding: 20px;
  }
}
</style> 
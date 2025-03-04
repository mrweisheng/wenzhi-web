<template>
  <div class="main-header">
    <div class="left">
      <h1 class="logo">文知管理系统</h1>
    </div>
    <div class="right">
      <el-dropdown trigger="click">
        <div class="user-info">
          <el-avatar 
            :size="32" 
            :icon="UserFilled"
            class="user-avatar"
          />
          <span class="username">{{ userStore.userInfo?.username }}</span>
          <el-icon class="el-icon--right">
            <CaretBottom />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfile">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { 
  Fold, 
  Expand, 
  UserFilled, 
  CaretBottom,
  User,
  SwitchButton
} from '@element-plus/icons-vue'

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
}>()

const userStore = useUserStore()
const router = useRouter()

const toggleSidebar = () => {
  emit('update:collapsed', !collapsed)
}

const handleProfile = () => {
  router.push('/profile')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确认退出登录吗？', '提示', {
      type: 'warning'
    })
    userStore.clearAuth()
    router.push('/login')
  } catch {
    // 用户取消退出
  }
}
</script>

<style lang="scss" scoped>
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 0 20px;

  .left {
    .logo {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
    }
  }

  .right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .user-avatar {
        background: #1890ff;
        margin-right: 8px;
      }

      .username {
        font-size: 14px;
        margin-right: 4px;
        color: #ffffff;
      }

      .el-icon--right {
        color: #ffffff;
      }
    }
  }
}
</style> 
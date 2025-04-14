<template>
  <div class="app-container">
    <div class="profile-container">
      <!-- 顶部用户摘要区域 -->
      <div class="user-summary">
        <div class="user-info-section">
          <el-avatar :size="86" :src="avatarUrl" class="user-avatar"></el-avatar>
          <div class="user-meta">
            <h2 class="user-name">{{ userInfo.username }}</h2>
            <div class="user-role">{{ userInfo.role?.role_name || '暂无角色' }}</div>
            <div class="user-status">
              <div class="status-indicator" :class="userInfo.status === 1 ? 'active' : 'inactive'"></div>
              <span>{{ userInfo.status === 1 ? '在线' : '离线' }}</span>
            </div>
          </div>
        </div>
        <div class="user-actions">
          <el-dropdown trigger="click">
            <el-button type="primary" class="action-button">
              <template #icon><el-icon><Edit /></el-icon></template>
              编辑资料
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showPasswordDialog">
                  <el-icon class="action-icon"><Lock /></el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item @click="showEmailDialog">
                  <el-icon class="action-icon"><Message /></el-icon>
                  {{ (userInfo as any).email ? '修改邮箱' : '绑定邮箱' }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧信息栏 -->
        <div class="info-sidebar">
          <div class="info-card">
            <h3 class="card-title">基本信息</h3>
            
            <div class="info-group">
              <div class="info-item">
                <div class="info-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">账号</div>
                  <div class="info-value">{{ userInfo.username }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-icon">
                  <el-icon><Message /></el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">邮箱</div>
                  <div class="info-value">{{ (userInfo as any).email || '暂无邮箱' }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-icon">
                  <el-icon><Calendar /></el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">创建时间</div>
                  <div class="info-value">{{ formatDate(userInfo.created_at) }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-icon">
                  <el-icon><Setting /></el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">最后更新</div>
                  <div class="info-value">{{ formatDate(userInfo.updated_at) }}</div>
                </div>
              </div>
            </div>
            
            <!-- 添加装饰图标 -->
            <div class="decoration-icons">
              <div class="icon-wrapper">
                <div class="icon-item primary">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="icon-item success">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="icon-item warning">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="icon-item danger">
                  <el-icon><Bell /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧内容区 -->
        <div class="content-main">
          <div class="content-card recent-issues-card">
            <div class="card-header">
              <h3 class="card-title">最近负责的问题</h3>
              <div class="card-actions">
                <el-button type="primary" text class="view-all-button" @click="router.push('/issues')">
                  查看全部
                  <el-icon class="ml-1"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
            
            <div v-if="!recentIssues.length" class="empty-issues">
              <el-empty description="暂无负责的问题" :image-size="120">
                <template #image>
                  <div class="empty-icon-wrapper">
                    <el-icon><DocumentRemove /></el-icon>
                  </div>
                </template>
                <el-button type="primary" @click="router.push('/issues')">去浏览问题</el-button>
              </el-empty>
            </div>
            
            <div v-else class="issues-list">
              <div 
                v-for="issue in recentIssues" 
                :key="issue.id" 
                class="issue-item"
                @click="viewIssueDetail(issue.id)"
              >
                <div class="issue-content">
                  <div class="issue-header">
                    <div class="issue-id">#{{ issue.id }}</div>
                    <el-tag :type="getStatusType(issue.status)" effect="light" class="issue-status">
                      {{ getStatusLabel(issue.status) }}
                    </el-tag>
                  </div>
                  <h4 class="issue-title">{{ issue.title }}</h4>
                  <div class="issue-meta">
                    <div class="issue-time">
                      <el-icon><Clock /></el-icon>
                      <span>{{ formatDate(issue.createTime) }}</span>
                    </div>
                  </div>
                </div>
                <div class="issue-action">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 添加经典台词卡片 -->
          <div class="content-card quote-card">
            <div class="card-header">
              <h3 class="card-title">今日金句</h3>
              <div class="card-actions">
                <el-button type="primary" text class="refresh-quote-button" @click="refreshQuote">
                  换一句
                  <el-icon class="ml-1"><RefreshRight /></el-icon>
                </el-button>
              </div>
            </div>
            
            <div class="quote-content">
              <div class="quote-icon">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <blockquote class="quote-text">
                {{ currentQuote.text }}
              </blockquote>
              <div class="quote-author">— {{ currentQuote.author }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="460px"
      center
      destroy-on-close
    >
      <div class="dialog-header-icon">
        <div class="icon-wrapper">
          <el-icon><Lock /></el-icon>
        </div>
      </div>
      
      <div class="dialog-description">
        设置一个安全的新密码，建议使用字母、数字和特殊符号的组合
      </div>
      
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-position="top"
        class="custom-form"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
            prefix-icon="Key"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            prefix-icon="Check"
          />
        </el-form-item>
      </el-form>
      
      <div class="password-tips">
        <el-icon><InfoFilled /></el-icon>
        <span>密码长度至少6位，建议包含大小写字母、数字和特殊字符</span>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="updatePassword" :loading="updating" class="confirm-btn">
            确认修改
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 修改邮箱对话框 -->
    <el-dialog
      v-model="emailDialogVisible"
      :title="(userInfo as any).email ? '修改邮箱' : '绑定邮箱'"
      width="460px"
      center
      destroy-on-close
    >
      <div class="dialog-header-icon">
        <div class="icon-wrapper email-icon">
          <el-icon><Message /></el-icon>
        </div>
      </div>
      
      <div class="dialog-description">
        {{ (userInfo as any).email ? '修改您的邮箱地址，新邮箱将用于接收系统通知和找回密码' : '绑定邮箱地址，便于接收系统通知和找回密码' }}
      </div>
      
      <el-form
        :model="emailForm"
        :rules="emailRules"
        ref="emailFormRef"
        label-position="top"
        class="custom-form"
      >
        <el-form-item label="邮箱地址" prop="email">
          <el-input
            v-model="emailForm.email"
            placeholder="请输入邮箱地址"
            prefix-icon="Message"
          />
        </el-form-item>
      </el-form>
      
      <div class="email-tips">
        <el-icon><InfoFilled /></el-icon>
        <span>绑定邮箱后，您可以通过邮箱接收系统通知和重要提醒</span>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="emailDialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="updateEmail" :loading="updating" class="confirm-btn">
            {{ (userInfo as any).email ? '更新邮箱' : '绑定邮箱' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { 
  User, Message, Calendar, Setting, List, InfoFilled, Lock, Key, Clock, 
  Edit, DocumentRemove, ArrowRight, RefreshRight, ChatDotRound,
  Document, Check, Star, Bell
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import router from '@/router'
import { getIssueList } from '@/api/issues'
import { ElMessage } from 'element-plus'
import type { IssueItem } from '@/types/issues'
import type { UserInfo } from '@/types/user'
import { updateUserEmail, updateUserPassword } from '@/api/user'

const userStore = useUserStore()
const recentIssues = ref<IssueItem[]>([])

// 经典台词数据
const quotes = [
  { text: "勿忘初心，方得始终。", author: "《华严经》" },
  { text: "千里之行，始于足下。", author: "老子" },
  { text: "工欲善其事，必先利其器。", author: "孔子" },
  { text: "知之为知之，不知为不知，是知也。", author: "孔子" },
  { text: "学而不思则罔，思而不学则殆。", author: "孔子" },
  { text: "不积跬步，无以至千里；不积小流，无以成江海。", author: "荀子" },
  { text: "纸上得来终觉浅，绝知此事要躬行。", author: "陆游" },
  { text: "路漫漫其修远兮，吾将上下而求索。", author: "屈原" },
  { text: "业精于勤，荒于嬉；行成于思，毁于随。", author: "韩愈" },
  { text: "天行健，君子以自强不息。", author: "《周易》" }
]

const currentQuote = ref(quotes[Math.floor(Math.random() * quotes.length)])

// 刷新金句
const refreshQuote = () => {
  let newIndex
  do {
    newIndex = Math.floor(Math.random() * quotes.length)
  } while (quotes[newIndex].text === currentQuote.value.text && quotes.length > 1)
  
  currentQuote.value = quotes[newIndex]
}

// 修改密码相关
const passwordDialogVisible = ref(false)
const passwordFormRef = ref()
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 修改邮箱相关
const emailDialogVisible = ref(false)
const emailFormRef = ref()
const emailForm = ref({
  email: ''
})
const emailRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 提交状态
const updating = ref(false)

// 获取用户信息
const userInfo = computed<UserInfo>(() => userStore.userInfo || {
  id: 0,
  username: '',
  role_id: 0,
  status: 0,
  created_at: '',
  updated_at: '',
  role: { id: 0, role_name: '' },
  email: ''
} as UserInfo)

// 生成avatar URL
const avatarUrl = computed(() => {
  const username = userInfo.value.username || 'default'
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
})

// 获取用户最近负责的问题
const fetchRecentIssues = async () => {
  if (!userInfo.value.id) return
  
  try {
    const res = await getIssueList({
      pageSize: 5,
      page: 1,
    })
    
    if (res.data?.data) {
      if (res.data.data.items) {
        // 筛选当前用户负责的问题
        recentIssues.value = res.data.data.items.filter(
          issue => issue.assignee?.id === userInfo.value.id
        ).slice(0, 3) // 只展示最多3条
      } else if (Array.isArray(res.data.data)) {
        recentIssues.value = res.data.data.filter(
          issue => issue.assignee?.id === userInfo.value.id
        ).slice(0, 3)
      }
    }
  } catch (error) {
    console.error('获取最近问题失败:', error)
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    processing: 'warning',
    completed: 'success'
  }
  return typeMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const labelMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  }
  return labelMap[status] || status
}

// 查看问题详情
const viewIssueDetail = (id: string) => {
  router.push(`/issues?view=${id}`)
}

// 显示修改密码对话框
const showPasswordDialog = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordDialogVisible.value = true
}

// 显示修改邮箱对话框
const showEmailDialog = () => {
  emailForm.value = {
    email: (userInfo.value as any).email || ''
  }
  emailDialogVisible.value = true
}

// 修改密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      updating.value = true
      try {
        await updateUserPassword({
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword
        })
        ElMessage.success('密码修改成功')
        passwordDialogVisible.value = false
      } catch (error: any) {
        console.error('修改密码失败:', error)
        if (error.response && error.response.data) {
          ElMessage.error(error.response.data.message || '修改密码失败，请重试')
        } else {
          ElMessage.error('修改密码失败，请重试')
        }
      } finally {
        updating.value = false
      }
    }
  })
}

// 修改邮箱
const updateEmail = async () => {
  if (!emailFormRef.value) return
  
  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      updating.value = true
      try {
        await updateUserEmail(emailForm.value.email)
        ElMessage.success('邮箱更新成功')
        emailDialogVisible.value = false
        // 刷新用户信息
        await userStore.getUserInfoAction()
      } catch (error: any) {
        console.error('更新邮箱失败:', error)
        if (error.response && error.response.data) {
          ElMessage.error(error.response.data.message || '更新邮箱失败，请重试')
        } else {
          ElMessage.error('更新邮箱失败，请重试')
        }
      } finally {
        updating.value = false
      }
    }
  })
}

onMounted(() => {
  if (!userStore.userInfo) {
    userStore.getUserInfoAction()
  }
  fetchRecentIssues()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  color: #1a202c;
}

.profile-container {
  margin: 0 auto;
}

// 用户摘要部分
.user-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -6px rgba(59, 130, 246, 0.1);
  margin-bottom: 24px;
  
  .user-info-section {
    display: flex;
    align-items: center;
    gap: 24px;
    
    .user-avatar {
      border: 4px solid rgba(255, 255, 255, 0.2);
      background-color: white;
      box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.1);
    }
    
    .user-meta {
      .user-name {
        font-size: 28px;
        font-weight: 600;
        margin: 0 0 4px 0;
        letter-spacing: 0.3px;
      }
      
      .user-role {
        font-size: 16px;
        opacity: 0.8;
        margin-bottom: 12px;
      }
      
      .user-status {
        display: flex;
        align-items: center;
        font-size: 14px;
        gap: 6px;
        background-color: rgba(255, 255, 255, 0.15);
        padding: 4px 12px;
        border-radius: 12px;
        width: fit-content;
        
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          
          &.active {
            background-color: #10b981;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
          }
          
          &.inactive {
            background-color: #e5e7eb;
            box-shadow: 0 0 0 2px rgba(229, 231, 235, 0.3);
          }
        }
      }
    }
  }
  
  .user-actions {
    .action-button {
      background-color: rgba(255, 255, 255, 0.15);
      border: none;
      color: white;
      font-weight: 500;
      padding: 12px 20px;
      border-radius: 12px;
      transition: all 0.3s ease;
      backdrop-filter: blur(4px);
      font-size: 15px;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .el-icon {
        margin-right: 6px;
        font-size: 16px;
      }
    }
  }
}

// 主内容区域
.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

// 左侧信息栏
.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  // 基本信息卡片
  .info-card {
    display: flex;
    flex-direction: column;
    height: 100%;  // 让卡片高度填充整个容器高度
  }
}

// 卡片通用样式
.info-card, .content-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  }
  
  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -1px;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #60a5fa);
      border-radius: 6px;
    }
  }
}

// 基本信息卡片
.info-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: auto; // 让信息组靠上
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    border-radius: 12px;
    background-color: #f8fafc;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #f1f5f9;
      transform: translateY(-2px);
    }
    
    .info-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      font-size: 18px;
    }
    
    .info-content {
      flex: 1;
      
      .info-label {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 4px;
      }
      
      .info-value {
        font-size: 15px;
        font-weight: 500;
        color: #1e293b;
      }
    }
  }
}

// 添加装饰图标
.decoration-icons {
  margin-top: auto; // 让装饰图标在底部
  display: flex;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px dashed #e2e8f0;
  
  .icon-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    
    .icon-item {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background-color: #f1f5f9;
      color: #64748b;
      transition: all 0.3s ease;
      font-size: 20px;
      cursor: pointer;
      
      &:hover {
        background-color: #e2e8f0;
        color: #3b82f6;
        transform: translateY(-3px);
      }
      
      &.primary {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
      
      &.success {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
      
      &.warning {
        background-color: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }
      
      &.danger {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
    }
  }
}

// 右侧内容区域
.content-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// 卡片头部通用样式
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .card-actions {
    .view-all-button {
      display: flex;
      align-items: center;
      color: #3b82f6;
      font-weight: 500;
      
      &:hover {
        color: #2563eb;
      }
    }
  }
}

// 问题卡片
.recent-issues-card {
  flex: 1;  // 使其自动填充空间
  margin-bottom: 20px;  // 添加底部间距
  .empty-issues {
    padding: 20px 0;
    
    .empty-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      border-radius: 50%;
      background-color: #f1f5f9;
      font-size: 36px;
      color: #94a3b8;
    }
  }
  
  .issues-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .issue-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-radius: 12px;
      background-color: #f8fafc;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        background-color: #f1f5f9;
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        
        .issue-action {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .issue-content {
        flex: 1;
        
        .issue-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          
          .issue-id {
            font-family: 'Roboto Mono', monospace;
            font-size: 13px;
            font-weight: 500;
            color: #64748b;
            background-color: #e2e8f0;
            padding: 4px 8px;
            border-radius: 6px;
          }
          
          .issue-status {
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 500;
          }
        }
        
        .issue-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }
        
        .issue-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          
          .issue-time {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #64748b;
          }
        }
      }
      
      .issue-action {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: #e2e8f0;
        color: #64748b;
        opacity: 0.6;
        transform: translateX(10px);
        transition: all 0.3s ease;
      }
    }
  }
}

// 经典台词卡片
.quote-card {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  
  .quote-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    position: relative;
    text-align: center;
    
    .quote-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }
    
    .quote-text {
      font-size: 18px;
      line-height: 1.6;
      font-weight: 500;
      color: #1e293b;
      margin: 0 0 16px 0;
      font-style: italic;
      max-width: 80%;
      position: relative;
      padding: 0 24px;
      
      &::before,
      &::after {
        content: '"';
        position: absolute;
        font-size: 40px;
        color: #e2e8f0;
        font-family: serif;
        font-style: normal;
      }
      
      &::before {
        left: 0;
        top: -10px;
      }
      
      &::after {
        right: 0;
        bottom: -30px;
      }
    }
    
    .quote-author {
      font-size: 14px;
      color: #64748b;
      font-weight: 500;
    }
  }
  
  .refresh-quote-button {
    display: flex;
    align-items: center;
    color: #3b82f6;
    font-weight: 500;
    
    &:hover {
      color: #2563eb;
    }
  }
}

// 自定义el-tag样式
:deep(.el-tag) {
  border: none;
  border-radius: 6px;
  
  &.el-tag--success {
    background-color: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  
  &.el-tag--warning {
    background-color: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }
  
  &.el-tag--info {
    background-color: rgba(100, 116, 139, 0.1);
    color: #475569;
  }
}

// 自定义el-empty样式
:deep(.el-empty) {
  padding: 20px 0;
  
  .el-empty__image {
    width: 100px;
    height: 100px;
  }
  
  .el-empty__description {
    margin-top: 0;
  }
  
  .el-button {
    margin-top: 16px;
  }
}

:deep(.el-dropdown-menu) {
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: none;
  
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
    font-weight: 500;
    color: #334155;
    transition: all 0.2s ease;
    
    .action-icon {
      color: #3b82f6;
      margin-right: 8px;
      font-size: 16px;
      border-radius: 6px;
      padding: 4px;
      background-color: rgba(59, 130, 246, 0.1);
    }
    
    &:hover {
      background-color: #f1f5f9;
      color: #3b82f6;
      
      .action-icon {
        background-color: rgba(59, 130, 246, 0.2);
      }
    }
    
    &:last-child {
      margin-bottom: 0;
      
      .action-icon {
        color: #8b5cf6;
        background-color: rgba(139, 92, 246, 0.1);
      }
      
      &:hover .action-icon {
        background-color: rgba(139, 92, 246, 0.2);
      }
    }
  }
}

:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  
  .el-dialog__header {
    background-color: #f8fafc;
    margin: 0;
    padding: 20px 24px;
    
    .el-dialog__title {
      font-weight: 600;
      color: #1e293b;
    }
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;
    
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      gap: 12px;
    }
  }
}
</style> 
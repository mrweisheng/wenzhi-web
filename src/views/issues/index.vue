<template>
  <div class="app-container">
    <!-- 头部搜索区域 -->
    <div class="search-area bg-white rounded-lg p-3">
      <div class="flex items-center space-x-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜索问题..."
          class="!w-[260px]"
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="text-gray-400"><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="所有状态" class="!w-[150px]" size="large" @change="handleSearch">
          <el-option label="所有状态" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已完成" value="completed" />
        </el-select>
        <el-button type="primary" @click="handleCreateIssue" class="!min-w-[100px]" size="large">
          新建问题
        </el-button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <el-spinner text="加载中..."></el-spinner>
    </div>

    <!-- 问题列表为空 -->
    <div v-else-if="issues.length === 0" class="flex flex-col justify-center items-center py-20">
      <el-empty description="暂无问题" />
      <el-button type="primary" @click="handleCreateIssue" class="mt-4">新建问题</el-button>
    </div>

    <!-- 问题列表 -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="issue in issues"
        :key="issue.id"
        class="issue-card bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300"
        @click="openDrawer(issue)"
      >
        <div class="issue-card-content">
          <!-- 问题编号 -->
          <div class="issue-card-header">
            <span class="issue-id">#{{ issue.id }}</span>
            <h3 class="issue-card-title">{{ issue.title }}</h3>
            <!-- 标签组 -->
            <div class="tags-group">
              <el-tag
                :type="getPriorityType(issue.priority)"
                effect="light"
                class="priority-tag"
              >
                {{ getPriorityLabel(issue.priority) }}
              </el-tag>
              <el-tag
                :type="getStatusType(issue.status)"
                effect="light"
                class="status-tag"
              >
                {{ getStatusLabel(issue.status) }}
              </el-tag>
            </div>
          </div>
          
          <!-- 时间显示放到标题下方 -->
          <div class="time-section mb-4">
            <div class="time-tag create-time">
              <el-icon class="mr-1"><Calendar /></el-icon>
              <span>创建: {{ formatDate(issue.createTime) }}</span>
            </div>
            
            <div v-if="issue.deadline" :class="['time-tag deadline-tag', isDeadlineNear(issue.deadline) ? 'deadline-near' : '']">
              <el-icon class="mr-1"><Clock /></el-icon>
              <span>截止: {{ formatDatetime(issue.deadline) }}</span>
              <el-tag 
                v-if="isDeadlineNear(issue.deadline)" 
                type="danger" 
                effect="light" 
                size="small"
                class="ml-2"
              >
                即将到期
              </el-tag>
            </div>
          </div>
          
          <!-- 状态流程条 -->
          <div class="status-flow-section mb-5">
            <div class="status-flow" :class="{
              'flow-pending': issue.status === 'pending',
              'flow-processing': issue.status === 'processing',
              'flow-completed': issue.status === 'completed'
            }">
              <div 
                class="status-step"
                :class="{
                  'status-pending': issue.status === 'pending',
                  'status-completed': ['processing', 'completed'].includes(issue.status),
                  'status-current': issue.status === 'pending'
                }"
              >
                <div class="status-dot"></div>
                <span class="status-text">待处理</span>
              </div>
              <div class="status-line"></div>
              <div 
                class="status-step"
                :class="{
                  'status-completed': issue.status === 'completed',
                  'status-current': issue.status === 'processing'
                }"
              >
                <div class="status-dot"></div>
                <span class="status-text">处理中</span>
              </div>
              <div class="status-line"></div>
              <div 
                class="status-step"
                :class="{
                  'status-completed': issue.status === 'completed',
                  'status-current': false
                }"
              >
                <div class="status-dot"></div>
                <span class="status-text">已完成</span>
              </div>
            </div>
          </div>
          
          <!-- 用户信息区域 - 单行显示 -->
          <div class="users-section">
            <div class="users-row">
              <div class="user-cell">
                <span class="user-label">创建人:</span>
                <div class="user-info">
                  <el-avatar :size="24" :src="getAvatarUrl(issue.creator.name)" class="user-avatar" />
                  <span class="user-name">{{ issue.creator.name }}</span>
                </div>
              </div>
              
              <div class="user-cell">
                <span class="user-label">负责人:</span>
                <div class="user-info">
                  <el-avatar :size="24" :src="getAvatarUrl(issue.assignee.name)" class="user-avatar" />
                  <span class="user-name">{{ issue.assignee.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加加载更多提示 -->
    <div v-if="hasMore" class="text-center py-4">
      <div class="loading-more">
        <el-spinner class="mr-2" size="small"></el-spinner>
        <span class="text-gray-500">加载更多...</span>
      </div>
    </div>

    <!-- 问题详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="currentIssue?.title || '问题详情'"
      size="55%"
      :destroy-on-close="true"
    >
      <template #header>
        <div v-if="currentIssue" class="flex items-center space-x-4">
          <h2 class="text-2xl font-bold">{{ currentIssue.title }}</h2>
          <el-tag
            :type="getStatusType(currentIssue.status)"
            effect="light"
            size="large"
          >
            {{ getStatusLabel(currentIssue.status) }}
          </el-tag>
        </div>
        <div v-else class="flex items-center space-x-4">
          <h2 class="text-2xl font-bold">加载中...</h2>
        </div>
      </template>

      <!-- 加载中 -->
      <div v-if="loadingDetail" class="flex justify-center items-center py-12">
        <el-spinner text="加载中..."></el-spinner>
      </div>

      <div v-else-if="currentIssue" class="issue-detail space-y-6 p-6">
        <!-- 基本信息 -->
        <div class="info-card bg-white rounded-lg p-6 shadow-sm">
          <!-- 标题和编号行 -->
          <div class="flex items-center gap-3 mb-4">
            <span class="issue-number font-mono text-gray-500 text-base">#{{ currentIssue.id }}</span>
            <h2 class="text-xl font-semibold text-gray-900">{{ currentIssue.title }}</h2>
          </div>
          
          <!-- 标签行 -->
          <div class="flex items-center justify-between mb-6">
            <div class="tags-row flex items-center gap-3">
              <div class="tag-item">
                <span class="tag-label text-gray-500">优先级</span>
                <el-tag
                  :type="getPriorityType(currentIssue.priority)"
                  effect="plain"
                  class="priority-tag"
                  size="large"
                >
                  {{ getPriorityLabel(currentIssue.priority) }}
                </el-tag>
              </div>
              <div class="tag-item">
                <span class="tag-label text-gray-500">状态</span>
                <el-tag
                  :type="getStatusType(currentIssue.status)"
                  effect="plain"
                  class="status-tag"
                  size="large"
                >
                  {{ getStatusLabel(currentIssue.status) }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="issue-timeline mb-6">
            <div class="timeline-item">
              <el-icon class="timeline-icon"><Calendar /></el-icon>
              <div class="timeline-content">
                <div class="text-sm text-gray-500">创建时间</div>
                <div class="text-base font-medium">{{ formatDate(currentIssue.createTime) }}</div>
              </div>
            </div>
            <div class="timeline-divider"></div>
            <div class="timeline-item">
              <el-icon class="timeline-icon"><Clock /></el-icon>
              <div class="timeline-content">
                <div class="text-sm text-gray-500">截止时间</div>
                <div class="deadline-info">
                  <span class="text-base font-medium">{{ formatDatetime(currentIssue.deadline) }}</span>
                  <el-tag 
                    v-if="isDeadlineNear(currentIssue.deadline)" 
                    type="danger" 
                    effect="light" 
                    size="small"
                    class="ml-2"
                  >
                    即将到期
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 用户信息区域 -->
          <div class="users-info">
            <div class="flex justify-between items-start">
              <!-- 创建人 -->
              <div class="user-box">
                <span class="user-role-label">创建人</span>
                <div class="user-detail">
                  <el-avatar :size="40" :src="getAvatarUrl(currentIssue.creator?.name)" />
                  <div class="user-info">
                    <span class="user-name">{{ currentIssue.creator?.name }}</span>
                    <span class="user-role">发起人</span>
                  </div>
                </div>
              </div>
              
              <!-- 负责人 -->
              <div class="user-box">
                <span class="user-role-label">负责人</span>
                <div class="user-detail">
                  <el-avatar :size="40" :src="getAvatarUrl(currentIssue.assignee.name)" />
                  <div class="user-info">
                    <span class="user-name">{{ currentIssue.assignee.name }}</span>
                    <span class="user-role">处理人</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 问题描述 -->
        <div class="info-card bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">问题描述</h3>
          <p class="description-content">
            {{ currentIssue.description }}
          </p>
        </div>

        <!-- 处理记录 -->
        <div class="info-card bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">处理记录</h3>
          <div class="space-y-5">
            <!-- 处理记录列表 -->
            <div class="chat-records">
              <div
                v-for="record in currentIssue.records"
                :key="record.id"
                class="chat-record-item mb-6"
              >
                <div class="flex items-start gap-3">
                  <el-avatar :size="40" :src="getAvatarUrl(record.user.name)" class="flex-shrink-0" />
                  <div class="flex-grow">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-medium text-gray-900">{{ record.user.name + " : " }}</span>
                      <span class="text-sm text-gray-500">{{ record.createTime }}</span>
                    </div>
                    <div class="chat-bubble bg-gray-100 rounded-lg p-4 text-gray-800" v-html="record.content"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 添加处理记录 - 只有创建人和负责人可见 -->
            <div v-if="canAddRecord" class="add-record-section mt-8">
              <h4 class="font-medium text-gray-900 mb-4 border-b pb-2">添加处理记录</h4>
              <div class="mb-5">
                <el-input
                  type="textarea"
                  v-model="newRecordContent"
                  placeholder="请输入处理记录内容..."
                  :rows="5"
                  :disabled="addingRecord"
                ></el-input>
              </div>
              <div class="status-selector mb-4">
                <div class="label-required mb-2">更新问题状态</div>
                <el-select 
                  v-model="newRecordStatus" 
                  placeholder="请选择要更新的状态" 
                  size="large" 
                  :disabled="addingRecord"
                  class="w-full"
                >
                  <el-option label="待处理" value="pending" />
                  <el-option label="处理中" value="processing" />
                  <el-option label="已完成" value="completed" />
                </el-select>
              </div>
              <div class="flex justify-end mt-5">
                <el-button type="primary" size="large" @click="addRecord" :loading="addingRecord" :disabled="!newRecordContent || !newRecordStatus">
                  添加记录
                </el-button>
              </div>
            </div>

            <div v-if="currentIssue.records.length === 0" class="text-center text-gray-500 py-8">
              暂无处理记录
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex space-x-4">
          <!-- <el-button type="primary" @click="handleEditIssue" :disabled="loadingDetail">
            编辑问题
          </el-button> -->
          <el-button @click="handleCloseIssue">
            关闭
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 新建问题弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建问题"
      width="650px"
      :destroy-on-close="true"
    >
      <div class="create-form">
        <el-form :model="newIssue" label-position="top" :rules="formRules" ref="createFormRef">
          <el-form-item label="问题标题" prop="title">
            <el-input v-model="newIssue.title" placeholder="请输入问题标题"></el-input>
          </el-form-item>
          
          <div class="grid grid-cols-2 gap-4">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="newIssue.priority" placeholder="请选择优先级" class="w-full">
                <el-option label="高优先级" value="high" />
                <el-option label="中优先级" value="medium" />
                <el-option label="低优先级" value="low" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="负责人" prop="assignee">
              <el-select v-model="newIssue.assignee" placeholder="请选择负责人" class="w-full">
                <el-option
                  v-for="user in users"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                >
                  <div class="user-option flex items-center justify-between w-full">
                    <div class="flex items-center">
                      <el-avatar :size="26" :src="user.avatar" class="user-avatar"></el-avatar>
                      <span class="user-name">{{ user.name }}</span>
                    </div>
                    <span class="user-role text-xs text-gray-500">{{ user.role || '用户' }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <el-form-item label="截止日期" prop="deadline">
              <el-date-picker
                v-model="newIssue.deadline"
                type="datetime"
                placeholder="请选择截止日期"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                class="w-full"
              ></el-date-picker>
            </el-form-item>
          </div>
          
          <el-form-item label="问题描述" prop="description">
            <el-input
              v-model="newIssue.description"
              type="textarea"
              :rows="6"
              placeholder="请输入问题描述"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitNewIssue" :loading="submitting">创建问题</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { formatDate } from '@/utils/format'
import { Calendar, Clock, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getIssueList, getIssueDetail, createIssue, updateIssue, addIssueRecord, getUserList } from '@/api/issues'
import type { IssueItem, IssueDetail, IssueStatus } from '@/types/issues'
import type { ApiUser } from '@/types/user'
import { useUserStore } from '@/stores/user'

// 加载状态
const loading = ref(false)
const loadingDetail = ref(false)
const submitting = ref(false)
const addingRecord = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 滚动加载相关
const loadingMore = ref(false)
const hasMore = ref(true)

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')

// 抽屉控制
const drawerVisible = ref(false)
const currentIssue = ref<IssueDetail | null>(null)

// 新增变量和函数
const newRecordContent = ref('')
const newRecordStatus = ref('')

// 新建问题弹窗控制
const createDialogVisible = ref(false)
const createFormRef = ref(null)

// 新建问题表单
const newIssue = ref({
  title: '',
  priority: 'medium',
  status: 'pending',
  description: '',
  deadline: '',
  assignee: ''
})

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入问题标题', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  assignee: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入问题描述', trigger: 'blur' }]
}

// 用户列表
const users = ref<Array<{id: string, name: string, avatar: string | null, role?: string}>>([])

// 问题列表
const issues = ref<IssueItem[]>([])

// 从状态管理中获取当前用户信息
const userStore = useUserStore()
const currentUserId = computed(() => userStore.userInfo?.id || null)

// 判断是否可以添加记录
const canAddRecord = computed(() => {
  if (!currentIssue.value || !currentUserId.value) {
    console.log('不显示添加记录区域，原因:', !currentIssue.value ? '问题详情不存在' : '当前用户ID未获取')
    return false
  }

  // 检查当前用户是否为创建者或负责人
  // 确保进行类型转换后比较
  const currentId = Number(currentUserId.value)
  const creatorId = currentIssue.value.creator?.id ? Number(currentIssue.value.creator.id) : null
  const assigneeId = currentIssue.value.assignee?.id ? Number(currentIssue.value.assignee.id) : null
  
  const isCreator = creatorId === currentId
  const isAssignee = assigneeId === currentId
  
  console.log('权限检查详情:', {
    当前用户ID: currentId,
    创建者ID: creatorId,
    负责人ID: assigneeId,
    是创建者: isCreator,
    是负责人: isAssignee,
    可添加记录: isCreator || isAssignee
  })
  
  return isCreator || isAssignee
})

// 获取用户列表
const fetchUsers = async () => {
  try {
    const res = await getUserList()
    if (res.data.code === 0 && res.data.data) {
      // 将API返回的用户数据映射为下拉框需要的格式
      users.value = res.data.data.map((user: ApiUser) => ({
        id: user.id,
        name: user.real_name || user.username, // 优先使用真实姓名，否则使用用户名
        avatar: getAvatarUrl(user.real_name || user.username), // 使用开源API生成头像
        role: user.role_name || getRoleNameById(user.role_id)  // 添加角色信息
      }))
      console.log('获取到的用户列表:', users.value)
    } else {
      // 处理API返回错误，添加一些默认数据用于展示
      users.value = [
        { id: '1', name: '系统管理员', avatar: getAvatarUrl('系统管理员'), role: '管理员' },
        { id: '2', name: '技术支持', avatar: getAvatarUrl('技术支持'), role: '技术人员' }
      ]
      console.warn('获取用户列表返回数据格式不符，使用默认数据', res.data)
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败，将使用默认数据')
    // 加载失败时提供默认数据
    users.value = [
      { id: '1', name: '系统管理员', avatar: getAvatarUrl('系统管理员'), role: '管理员' },
      { id: '2', name: '技术支持', avatar: getAvatarUrl('技术支持'), role: '技术人员' }
    ]
  }
}

// 根据角色ID获取角色名称
const getRoleNameById = (roleId: string | number) => {
  const roleMap = {
    '1': '管理员',
    '2': '普通用户',
    '3': '技术人员'
  }
  return roleMap[roleId] || '用户'
}

// 获取问题列表
const fetchIssues = async () => {
  loading.value = true
  try {
    const res = await getIssueList({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: statusFilter.value as IssueStatus,
      keyword: searchQuery.value
    })
    if (res.data && res.data.data) {
      // 兼容两种可能的API返回格式
      if (res.data.data.items) {
        // 新的API格式
        issues.value = res.data.data.items
        total.value = res.data.data.total
        currentPage.value = res.data.data.currentPage
        hasMore.value = res.data.data.items.length === pageSize.value
      } else if (Array.isArray(res.data.data)) {
        // 旧的API格式，直接返回数组
        issues.value = res.data.data
        hasMore.value = res.data.data.length === pageSize.value
      } else {
        issues.value = []
        hasMore.value = false
      }
    } else {
      issues.value = []
      hasMore.value = false
    }
  } catch (error) {
    console.error('获取问题列表失败:', error)
    ElMessage.error('获取问题列表失败')
    issues.value = []
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// 获取问题详情
const fetchIssueDetail = async (id: string) => {
  loadingDetail.value = true
  try {
    const res = await getIssueDetail(id)
    currentIssue.value = res.data.data
  } catch (error) {
    console.error('获取问题详情失败:', error)
    ElMessage.error('获取问题详情失败')
    drawerVisible.value = false
  } finally {
    loadingDetail.value = false
  }
}

// 判断截止日期是否临近(7天内)
const isDeadlineNear = (deadline) => {
  if (!deadline) return false
  
  const deadlineDate = new Date(deadline)
  const today = new Date()
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays >= 0 && diffDays <= 7
}

// 修改截止日期显示函数
const formatDatetime = (date) => {
  if (!date) return '未设置'
  
  const dateObj = new Date(date)
  // 如果日期无效，返回原始值
  if (isNaN(dateObj.getTime())) return date
  
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
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

// 获取优先级标签类型
const getPriorityType = (priority) => {
  const typeMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

// 获取优先级标签文本
const getPriorityLabel = (priority) => {
  const labelMap = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return labelMap[priority] || priority
}

// 获取用户头像URL（使用开源API生成头像）
const getAvatarUrl = (name: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'default')}`
}

// 事件处理
const handleSearch = () => {
  resetLoadMore()
  fetchIssues()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchIssues()
}

const handleCreateIssue = () => {
  createDialogVisible.value = true
}

const openDrawer = (issue: IssueItem) => {
  fetchIssueDetail(issue.id)
  drawerVisible.value = true
}

const handleCloseIssue = () => {
  drawerVisible.value = false
}

const addRecord = async () => {
  if (!currentIssue.value || !newRecordContent.value || !newRecordStatus.value) return

  addingRecord.value = true
  try {
    const res = await addIssueRecord(currentIssue.value.id, {
      content: newRecordContent.value,
      newStatus: newRecordStatus.value as IssueStatus
    })

    // 更新本地状态
    if (currentIssue.value) {
      currentIssue.value.status = newRecordStatus.value as IssueStatus
    }

    // 重新获取问题详情以确保数据一致
    await fetchIssueDetail(currentIssue.value.id)
    
    // 清空输入
    newRecordContent.value = ''
    newRecordStatus.value = ''
    
    ElMessage.success('添加处理记录成功')
  } catch (error) {
    console.error('添加处理记录失败:', error)
    ElMessage.error('添加处理记录失败')
  } finally {
    addingRecord.value = false
  }
}

// 提交新问题
const submitNewIssue = async () => {
  if (!createFormRef.value) return
  
  createFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 确保截止日期格式正确
        let formattedDeadline = newIssue.value.deadline
        if (formattedDeadline && typeof formattedDeadline === 'object') {
          formattedDeadline = formatDatetime(formattedDeadline)
        }
        
        await createIssue({
          title: newIssue.value.title,
          priority: newIssue.value.priority as 'high' | 'medium' | 'low',
          status: 'pending', // 固定为待处理状态
          description: newIssue.value.description,
          deadline: formattedDeadline,
          assigneeId: newIssue.value.assignee
        })
        
        // 重新加载问题列表
        fetchIssues()
        
        // 重置表单并关闭弹窗
        createFormRef.value?.resetFields()
        createDialogVisible.value = false
        
        ElMessage.success('创建问题成功')
      } catch (error) {
        console.error('创建问题失败:', error)
        ElMessage.error('创建问题失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 滚动加载处理函数
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement
  const scrollHeight = target.scrollHeight
  const scrollTop = target.scrollTop
  const clientHeight = target.clientHeight
  
  // 距离底部100px时开始加载
  if (scrollHeight - scrollTop - clientHeight < 100 && hasMore.value && !loadingMore.value) {
    loadingMore.value = true
    currentPage.value++
    
    try {
      const res = await getIssueList({
        page: currentPage.value,
        pageSize: pageSize.value,
        status: statusFilter.value as IssueStatus,
        keyword: searchQuery.value
      })
      
      if (res.data && res.data.data) {
        // 兼容两种可能的API返回格式
        if (res.data.data.items && res.data.data.items.length > 0) {
          // 新的API格式
          issues.value.push(...res.data.data.items)
          hasMore.value = res.data.data.items.length === pageSize.value
        } else if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          // 旧的API格式，直接返回数组
          issues.value.push(...res.data.data)
          hasMore.value = res.data.data.length === pageSize.value
        } else {
          hasMore.value = false
        }
      } else {
        hasMore.value = false
      }
    } catch (error) {
      console.error('加载更多失败:', error)
      hasMore.value = false
    } finally {
      loadingMore.value = false
    }
  }
}

// 重置加载状态
const resetLoadMore = () => {
  currentPage.value = 1
  hasMore.value = true
  loadingMore.value = false
  issues.value = []
}

onMounted(() => {
  console.log('当前登录用户信息:', userStore.userInfo)
  fetchUsers()
  fetchIssues()
  
  // 添加容器滚动事件监听
  const container = document.querySelector('.app-container')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
})

// 组件卸载时移除滚动事件监听
onUnmounted(() => {
  const container = document.querySelector('.app-container')
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.search-area {
  margin-bottom: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  
  .flex {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .el-input,
  .el-select,
  .el-button {
    height: 40px;
    border-radius: 4px;
  }
  
  .el-input {
    flex: 1;
    max-width: 260px;
    
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px #e5e7eb inset;
      padding: 0 12px;
    }
  }
  
  .el-select {
    width: 150px;
    
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px #e5e7eb inset;
      padding: 0 12px;
    }
  }
  
  .el-button {
    min-width: 100px;
    padding: 0 16px;
    font-size: 14px;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.issue-card {
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
  height: auto;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 10px -1px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-3px);
  }

  .issue-card-content {
    padding: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .issue-card-header {
    margin-bottom: 16px;
    
    .issue-id {
      display: inline-block;
      font-family: 'Roboto Mono', monospace;
      color: #6b7280;
      font-size: 13px;
      padding: 4px 8px;
      background: #f3f4f6;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .issue-card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 12px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tags-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .el-tag {
        padding: 0 10px;
        height: 24px;
        line-height: 22px;
        font-size: 12px;
        font-weight: 500;
        
        &.priority-tag {
          background-color: var(--el-color-danger-light-9);
          border-color: var(--el-color-danger-light-7);
          color: var(--el-color-danger);
          
          &.el-tag--warning {
            background-color: var(--el-color-warning-light-9);
            border-color: var(--el-color-warning-light-7);
            color: var(--el-color-warning);
          }
          
          &.el-tag--info {
            background-color: var(--el-color-info-light-9);
            border-color: var(--el-color-info-light-7);
            color: var(--el-color-info);
          }
        }
        
        &.status-tag {
          background-color: var(--el-color-success-light-9);
          border-color: var(--el-color-success-light-7);
          color: var(--el-color-success);
        }
      }
    }
  }

  .time-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    
    .time-tag {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: #6b7280;
      background-color: #f9fafb;
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid #909399;
    }
    
    .create-time {
      border-left-color: #909399;
      background-color: #f9fafb;
    }
    
    .deadline-tag {
      border-left-color: #909399;
      
      &.deadline-near {
        color: #f56c6c;
        font-weight: 500;
        background-color: #fff8f8;
        border-left-color: #f56c6c;
      }
    }
  }

  .deadline-section {
    display: none; /* 隐藏原来的截止时间区域，因为已经合并到time-section中 */
  }

  .assignee-section {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 8px;

    .el-avatar {
      border: 2px solid #fff;
    }

    span {
      line-height: 28px;
    }
  }
}

.el-tag {
  font-size: 12px;
  padding: 0 10px;
  height: 22px;
  line-height: 20px;
  border-radius: 11px;
  font-weight: 500;
  margin: 0;
  display: inline-flex;
  align-items: center;

  &.el-tag--danger {
    background-color: #fff2f0;
    border-color: #ffccc7;
    color: #f5222d;
  }

  &.el-tag--warning {
    background-color: #fffbe6;
    border-color: #ffe58f;
    color: #faad14;
  }

  &.el-tag--info {
    background-color: #f5f5f5;
    border-color: #e5e7eb;
    color: #6b7280;
  }

  &.el-tag--success {
    background-color: #f6ffed;
    border-color: #b7eb8f;
    color: #52c41a;
  }
}

.el-drawer__header {
  margin-bottom: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.el-drawer__body {
  padding: 0;
  background-color: #ffffff;
}

.bg-gray-50 {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  margin: 24px;
}

.record-content {
  :deep(p) {
    margin-bottom: 0.75rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  :deep(ul), :deep(ol) {
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  :deep(ul) {
    list-style-type: disc;
  }
  
  :deep(ol) {
    list-style-type: decimal;
  }
  
  :deep(li) {
    margin-bottom: 0.25rem;
  }
}

.add-record-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  .label-required {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    position: relative;
    
    &::before {
      content: "*";
      color: #f56c6c;
      margin-right: 4px;
    }
  }
  
  .status-selector {
    max-width: 300px;
  }
  
  .el-select {
    width: 100%;
  }
}

// 状态流程样式
.status-flow-section {
  margin-bottom: 16px;
  
  .status-flow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }
    
    &.flow-pending::before {
      background-color: #ef4444;
    }
    
    &.flow-processing::before {
      background-color: #3b82f6;
    }
    
    &.flow-completed::before {
      background-color: #10b981;
    }
  }
  
  .status-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
    padding: 8px 12px;
    border-radius: 8px;
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #e5e7eb;
      border: 2px solid #f9fafb;
      z-index: 1;
      transition: all 0.3s ease;
    }
    
    .status-text {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
      white-space: nowrap;
      transition: all 0.3s ease;
    }
    
    &.status-completed {
      .status-dot {
        background-color: #10b981;
        border-color: #d1fae5;
      }
      
      .status-text {
        color: #10b981;
      }
    }
    
    &.status-pending {
      .status-dot {
        background-color: #ef4444;
        border-color: #fee2e2;
      }
      
      .status-text {
        color: #ef4444;
      }
    }
    
    &.status-current {
      transform: scale(1.15);
      background-color: white;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      
      .status-dot {
        width: 16px;
        height: 16px;
        background-color: #3b82f6;
        border-color: #dbeafe;
        border-width: 3px;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
      }
      
      .status-text {
        color: #3b82f6;
        font-weight: 600;
        font-size: 12px;
      }
      
      &.status-pending {
        .status-dot {
          background-color: #ef4444;
          border-color: #fee2e2;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
        }
        
        .status-text {
          color: #ef4444;
          font-weight: 600;
        }
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 0;
      }
    }
  }
  
  .status-line {
    flex: 1;
    height: 2px;
    background-color: #e5e7eb;
    margin: 0 2px;
    position: relative;
    top: -6px;
    transition: all 0.3s ease;
    
    // 进度处理中时，第一段线为完成状态
    .flow-processing & {
      &:first-of-type {
        background-color: #3b82f6;
        height: 3px;
      }
    }
    
    // 进度完成时，所有线都为完成状态
    .flow-completed & {
      background-color: #10b981;
      height: 3px;
    }
  }
}

// 用户选择样式
:deep(.user-option) {
  display: flex;
  align-items: center;
  padding: 2px 0;
  
  .user-avatar {
    margin-right: 8px;
    border: 1px solid #f0f0f0;
  }
  
  .user-name {
    font-size: 14px;
    line-height: 26px;
  }
  
  .user-role {
    padding-left: 8px;
    color: #909399;
  }
}

:deep(.el-select-dropdown__item.selected) {
  .user-option {
    .user-avatar {
      border-color: #409eff;
    }
    
    .user-name {
      color: #409eff;
      font-weight: 500;
    }
  }
}

// 用户信息区域样式 - 修改为单行展示
.users-section {
  margin-top: auto;
  
  .users-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px dashed #e5e7eb;
  }
  
  .user-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    
    .user-label {
      color: #6b7280;
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 6px;
      
      .user-avatar {
        border: 1px solid #f0f0f0;
      }
      
      .user-name {
        font-size: 14px;
        color: #374151;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100px;
      }
    }
  }
}

// 详情抽屉样式
.issue-detail {
  background-color: #f0f2f5;
  
  .info-card {
    border: 1px solid #e5e7eb;
    
    .issue-number {
      padding: 4px 8px;
      background: #f3f4f6;
      border-radius: 4px;
      font-weight: 500;
    }

    .tags-row {
      .tag-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .tag-label {
          font-size: 13px;
        }
        
        .el-tag {
          margin: 0;
          height: 32px;
          line-height: 30px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          
          &.priority-tag {
            min-width: 90px;
            text-align: center;
          }
          
          &.status-tag {
            min-width: 80px;
            text-align: center;
          }
        }
      }
    }
    
    .issue-timeline {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 16px;
      background-color: #f9fafb;
      border-radius: 8px;
      
      .timeline-item {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .timeline-icon {
          font-size: 20px;
          color: #6b7280;
        }
        
        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      }
      
      .timeline-divider {
        width: 1px;
        height: 40px;
        background-color: #e5e7eb;
      }
    }
    
    .users-info {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f3f4f6;
      
      .user-box {
        .user-role-label {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 12px;
          display: block;
        }
        
        .user-detail {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: #f9fafb;
          border-radius: 12px;
          border: 1px solid #f3f4f6;
          
          .el-avatar {
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .user-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            
            .user-name {
              font-weight: 600;
              color: #111827;
              font-size: 15px;
            }
            
            .user-role {
              font-size: 12px;
              color: #6b7280;
            }
          }
        }
      }
    }
  }
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  color: #6b7280;
  font-size: 14px;
}

.chat-records {
  .chat-record-item {
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .chat-bubble {
    position: relative;
    max-width: 85%;
    margin-left: 0;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      background-color: #f3f4f6;
    }
    
    &::before {
      content: '';
      position: absolute;
      left: -8px;
      top: 12px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 8px 8px 8px 0;
      border-color: transparent #f3f4f6 transparent transparent;
    }
  }
}

.add-record-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  
  .label-required::after {
    content: '*';
    color: #f56c6c;
    margin-left: 4px;
  }
}
</style>
<template>
  <div class="app-container">
    <!-- 头部搜索区域 -->
    <div class="search-area bg-white rounded-lg p-4">
      <div class="search-row">
        <el-input
          v-model="searchQuery"
          placeholder="搜索案例..."
          class="search-input"
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="text-gray-400"><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="caseTypeFilter" placeholder="所有案例类型" class="filter-select" size="large" @change="handleSearch">
          <el-option label="所有类型" value="" />
          <el-option label="聊天话术" value="chatScript" />
          <el-option label="聊天反馈" value="chatFeedback" />
          <el-option label="谈单成功" value="dealSuccess" />
          <el-option label="谈单失败" value="dealFailure" />
        </el-select>
        <el-button type="primary" @click="handleCreateCase" class="create-button" size="large">
          新建案例
        </el-button>
      </div>
    </div>
    
    <!-- 加载中 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>

    <!-- 案例列表为空 -->
    <div v-else-if="cases.length === 0" class="flex flex-col justify-center items-center py-20">
      <el-empty description="暂无案例" />
      <el-button type="primary" @click="handleCreateCase" class="mt-4">新建案例</el-button>
    </div>

    <!-- 案例列表 -->
    <div v-else class="case-grid">
      <div
        v-for="item in cases"
        :key="item.id"
        class="case-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
      >
        <!-- 删除按钮 - 仅有删除权限的用户可见 -->
        <div v-if="hasDeletePermission" class="delete-button" @click.stop="confirmDelete(item)">
          <el-tooltip content="删除案例" placement="top">
            <el-icon><Delete /></el-icon>
          </el-tooltip>
        </div>
        
        <!-- 图片预览区域 -->
        <div class="case-card-image-wrapper" @click="openDrawer(item)">
          <img v-if="item.images && item.images.length > 0" 
              :src="item.images[0]" 
              class="case-card-image" 
              alt="案例图片"
          />
          <div v-else class="no-image">
            <el-icon><Picture /></el-icon>
            <span>暂无图片</span>
          </div>
          <div v-if="item.images && item.images.length > 1" class="image-count">
            <el-icon><Picture /></el-icon>
            <span>{{ item.images.length }}</span>
          </div>
        </div>
        
        <div class="case-card-content" @click="openDrawer(item)">
          <!-- 案例编号和标题 -->
          <div class="case-card-header">
            <div class="flex justify-between items-center mb-2">
              <span class="case-id">#{{ item.id }}</span>
              <el-tag
                :type="getStatusType(item.status)"
                effect="light"
                size="small"
                class="status-tag"
              >
                {{ getStatusLabel(item.status) }}
              </el-tag>
            </div>
            <h3 class="case-card-title">{{ item.title }}</h3>
            <!-- 标签组 -->
            <div class="tags-group">
              <el-tag
                :type="getCaseTypeType(item.case_type)"
                effect="light"
                class="category-tag"
              >
                {{ getCaseTypeLabel(item.case_type) }}
              </el-tag>
            </div>
          </div>
          
          <!-- 时间显示区域 -->
          <div class="time-section mb-4">
            <div class="time-tag archive-time">
              <el-icon class="mr-1"><Clock /></el-icon>
              <span>{{ item.status === 'archived' ? `归档: ${formatDate(item.archiveTime)}` : '待归档' }}</span>
            </div>
          </div>
          
          <!-- 简介内容 -->
          <div class="description-section mb-4">
            <p class="description-text">{{ truncateText(item.description, 100) }}</p>
          </div>
          
          <!-- 用户信息区域 - 归档人 -->
          <div class="users-section">
            <div class="users-row">
              <div class="user-cell">
                <span class="user-label">归档人:</span>
                <div class="user-info">
                  <el-avatar :size="24" 
                    :src="getAvatarUrl(item.archiver ? item.archiver.name : (item.creator ? item.creator.name : '未知用户'))" 
                    class="user-avatar" />
                  <span class="user-name">
                    {{ item.archiver ? item.archiver.name : (item.status === 'archived' ? '未知' : '待定') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="currentCase?.title || '案例详情'"
      size="60%"
      :destroy-on-close="true"
    >
      <template #header>
        <div v-if="currentCase" class="flex items-center justify-between w-full">
          <h2 class="text-2xl font-bold">{{ currentCase.title }}</h2>
          <div v-if="hasDeletePermission" class="drawer-actions">
            <el-button 
              type="danger" 
              size="small" 
              plain 
              @click.stop="confirmDelete(currentCase)"
              :loading="deleting"
            >
              <el-icon class="mr-1"><Delete /></el-icon>
              删除案例
            </el-button>
          </div>
        </div>
        <div v-else class="flex items-center space-x-4">
          <h2 class="text-2xl font-bold">加载中...</h2>
        </div>
      </template>

      <!-- 加载中 -->
      <div v-if="loadingDetail" class="flex justify-center items-center py-12">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>

      <div v-else-if="currentCase" class="case-detail p-6">
        <!-- 图片轮播区域 -->
        <div class="carousel-container" v-if="currentCase.images && currentCase.images.length > 0">
          <el-carousel height="400px" indicator-position="outside" :interval="4000" arrow="always" type="card">
            <el-carousel-item v-for="(image, index) in currentCase.images" :key="index" @click="openImageViewer(index)">
              <div class="carousel-image-container">
                <img :src="image" class="carousel-image" :alt="`案例图片${index + 1}`">
                <div class="image-overlay">
                  <el-icon><ZoomIn /></el-icon>
                  <span>点击查看大图</span>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 图片查看器 - 查看大图 -->
        <div 
          class="image-viewer-container" 
          v-if="imageViewerVisible" 
          @click="closeImageViewer" 
          tabindex="0" 
          ref="imageViewerRef"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div class="image-viewer-content" @click.stop>
            <div class="image-viewer-header">
              <span class="image-counter">{{ currentImageIndex + 1 }} / {{ currentCase?.images?.length }}</span>
              <div class="image-actions">
                <el-tooltip content="放大 (+)" placement="bottom">
                  <el-button circle plain size="small" @click="zoomIn">
                    <el-icon><ZoomIn /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="缩小 (-)" placement="bottom">
                  <el-button circle plain size="small" @click="zoomOut">
                    <el-icon><ZoomOut /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="旋转 (R)" placement="bottom">
                  <el-button circle plain size="small" @click="rotateImage">
                    <el-icon><RefreshRight /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="下载图片" placement="bottom">
                  <el-button circle plain size="small" @click="downloadImage">
                    <el-icon><Download /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="关闭 (ESC)" placement="bottom">
                  <el-button circle plain size="small" @click="closeImageViewer">
                    <el-icon><Close /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            <div class="image-viewer-body">
              <el-button @click.stop="prevImage" circle plain class="nav-button prev-button" :disabled="currentImageIndex === 0">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              
              <div class="image-container">
                <div v-if="imageLoading" class="image-loading">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
                <img 
                  :src="currentImageUrl" 
                  alt="大图预览" 
                  class="preview-image" 
                  :style="{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }"
                  @wheel="handleMouseWheel"
                  @load="handleImageLoad"
                >
              </div>
              
              <el-button @click.stop="nextImage" circle plain class="nav-button next-button" :disabled="currentImageIndex === (currentCase?.images?.length || 0) - 1">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            
            <div class="keyboard-tips">
              键盘快捷键: ← 上一张 | → 下一张 | + 放大 | - 缩小 | R 旋转 | ESC 关闭
            </div>
          </div>
        </div>

        <!-- 案例描述区域 -->
        <div class="info-card bg-white rounded-lg shadow-sm mb-6">
          <div class="card-header py-4 px-6 border-b border-gray-200">
            <h3 class="section-title">案例描述</h3>
          </div>
          <div class="card-body p-6">
            <div class="content-wrapper px-4">
              <p class="description-content whitespace-pre-line">
                {{ currentCase.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- 基本信息区域 -->
        <div class="info-card bg-white rounded-lg shadow-sm mb-6">
          <!-- 标题 -->
          <div class="card-header py-4 px-6 border-b border-gray-200">
            <h3 class="section-title">基本信息</h3>
          </div>
          
          <!-- 内容区域 -->
          <div class="card-body p-6">
            <div class="content-wrapper">
              <div class="basic-info-container">
                <!-- 案例编号 -->
                <div class="basic-info-item">
                  <div class="info-icon-box">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">案例编号</div>
                    <div class="info-value">
                      <span class="case-number">{{ currentCase.id }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 案例类型 -->
                <div class="basic-info-item">
                  <div class="info-icon-box">
                    <el-icon><Collection /></el-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">案例类型</div>
                    <div class="info-value">
                      <el-tag
                        :type="getCaseTypeType(currentCase.case_type)"
                        class="case-type-tag"
                      >
                        {{ getCaseTypeLabel(currentCase.case_type) }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                
                <!-- 案例状态 -->
                <div class="basic-info-item">
                  <div class="info-icon-box">
                    <el-icon><Flag /></el-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">归档状态</div>
                    <div class="info-value">
                      <el-tag
                        :type="getStatusType(currentCase.status)"
                        class="status-tag"
                      >
                        {{ getStatusLabel(currentCase.status) }}
                      </el-tag>
                    </div>
                  </div>
                </div>

                <!-- 创建时间 -->
                <div class="basic-info-item">
                  <div class="info-icon-box">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="info-content">
                    <div class="info-label">创建时间</div>
                    <div class="info-value">
                      {{ formatDate(currentCase.createTime) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 归档信息 - 横向布局 -->
              <div class="archive-section mt-5">
                <div class="card-section-title mb-4">归档信息</div>
                <div class="archive-info-wrapper bg-gray-50 rounded-lg p-5">
                  <div class="archive-info-grid">
                    <!-- 归档时间 -->
                    <div class="archive-info-item">
                      <div class="info-row">
                        <div class="info-icon-container">
                          <el-icon class="info-icon"><Clock /></el-icon>
                        </div>
                        <div class="info-content">
                          <div class="info-label">归档时间</div>
                          <div class="info-value">
                            {{ currentCase.status === 'archived' ? formatDate(currentCase.archiveTime) : '待归档' }}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 归档人 -->
                    <div class="archive-info-item">
                      <div class="info-row">
                        <div class="info-icon-container">
                          <el-icon class="info-icon"><User /></el-icon>
                        </div>
                        <div class="info-content">
                          <div class="info-label">归档人</div>
                          <div class="info-value user-value">
                            <el-avatar :size="24" :src="getAvatarUrl(currentCase.archiver ? currentCase.archiver.name : (currentCase.creator?.name || '未知用户'))" />
                            <span>{{ currentCase.archiver ? currentCase.archiver.name : (currentCase.status === 'archived' ? '未知' : '待定') }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 新建案例对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建案例"
      width="700px"
      :destroy-on-close="true"
    >
      <div class="create-form">
        <el-form :model="newCase" label-position="top" :rules="formRules" ref="createFormRef">
          <el-form-item label="案例标题" prop="title">
            <el-input v-model="newCase.title" placeholder="请输入案例标题"></el-input>
          </el-form-item>
          
          <el-form-item label="案例类型" prop="case_type">
            <el-select v-model="newCase.case_type" placeholder="请选择案例类型" class="w-full">
              <el-option label="聊天话术" value="chatScript" />
              <el-option label="聊天反馈" value="chatFeedback" />
              <el-option label="谈单成功" value="dealSuccess" />
              <el-option label="谈单失败" value="dealFailure" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="案例描述" prop="content">
            <el-input
              v-model="newCase.content"
              type="textarea"
              :rows="6"
              placeholder="请输入案例描述"
            ></el-input>
          </el-form-item>
          
          <el-form-item label="上传图片（可选，最多10张，每张不超过2MB）">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="10"
              :file-list="fileList"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :on-exceed="handleExceed"
              :before-upload="beforeUpload"
            >
              <el-icon><Plus /></el-icon>
              <template #file="{ file }">
                <div>
                  <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                  <div class="el-upload-list__item-actions">
                    <span 
                      class="el-upload-list__item-delete" 
                      @click.stop="handleFileRemove(file)"
                    >
                      <el-icon><Delete /></el-icon>
                    </span>
                  </div>
                </div>
              </template>
            </el-upload>
            <div class="upload-tips text-sm text-gray-500 mt-2">
              <p>* 支持PNG、JPG、JPEG格式，每张图片大小不超过2MB</p>
              <p>* 最多可上传10张图片</p>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitNewCase" :loading="submitting">创建案例</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, reactive } from 'vue'
import { Search, Calendar, Clock, Picture, Timer, Plus, Delete, Loading, MoreFilled, ZoomIn, Close, ArrowLeft, ArrowRight, ZoomOut, RefreshRight, Download, User, Document, Collection, Flag } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCaseList, getCaseDetail, createCase, deleteCase } from '@/api/cases'
import { useUserStore } from '@/stores/user'

// 用户权限角色
const userStore = useUserStore()
// 模拟当前用户角色，实际应从userStore中获取
const currentUserRole = ref('admin') // 可能的值: 'admin', 'manager', 'service', 'inspector', 'user'

// 判断是否有删除权限
const hasDeletePermission = computed(() => {
  // 根据角色判断，超级管理员、主管、客服及质检人员可以删除
  const role = currentUserRole.value
  return ['admin', 'manager', 'service', 'inspector'].includes(role)
})

// 定义案例类型接口
interface Creator {
  id: number
  name: string
}

interface Archiver {
  id: number
  name: string
}

interface Case {
  id: string
  title: string
  case_type: string
  status: string  // 内部状态字段
  content?: string  // API返回的内容字段
  description: string  // 内部使用的描述字段
  created_at?: string  // API返回的创建时间
  updated_at?: string  // API返回的更新时间
  createTime: string  // 内部使用的创建时间
  archiveTime?: string  // 内部使用的归档时间
  creator: Creator
  archiver?: Archiver  // 内部使用的归档人
  images?: string[]
}

// 数据加载状态
const loading = ref(false)
const loadingDetail = ref(false)

// 抽屉控制
const drawerVisible = ref(false)
const currentCase = ref<Case | null>(null)

// 搜索和筛选
const searchQuery = ref('')
const caseTypeFilter = ref('')

// 案例列表
const cases = ref<Case[]>([])

// 获取案例类型标签样式
const getCaseTypeType = (case_type: string) => {
  const typeMap: Record<string, string> = {
    chatScript: 'info',
    chatFeedback: 'warning',
    dealSuccess: 'success',
    dealFailure: 'danger'
  }
  return typeMap[case_type] || 'info'
}

// 获取案例类型标签文本
const getCaseTypeLabel = (case_type: string) => {
  const labelMap: Record<string, string> = {
    chatScript: '聊天话术',
    chatFeedback: '聊天反馈',
    dealSuccess: '谈单成功',
    dealFailure: '谈单失败'
  }
  return labelMap[case_type] || case_type
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'info',
    inProcess: 'warning',
    archived: 'success'
  }
  return typeMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    draft: '草稿',
    inProcess: '处理中',
    archived: '已归档'
  }
  return labelMap[status] || status
}

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取用户头像URL
const getAvatarUrl = (name?: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || '未知用户')}`
}

// 搜索处理
const handleSearch = () => {
  // 这里只是示例，实际应该调用API获取数据
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 打开详情抽屉
const openDrawer = (item: Case) => {
  currentCase.value = null
  drawerVisible.value = true
  loadingDetail.value = true
  
  // 调用API获取详情
  getCaseDetail(item.id)
    .then(res => {
      if (res.data.code === 0 && res.data.data) {
        const detailData = res.data.data
        // 映射API返回的数据到内部使用的数据结构
        currentCase.value = {
          id: detailData.id,
          title: detailData.title,
          case_type: detailData.case_type,
          status: 'archived', // API没有返回status字段，默认为已归档
          content: detailData.content,
          description: detailData.content,
          created_at: detailData.created_at,
          updated_at: detailData.updated_at,
          createTime: detailData.created_at,
          archiveTime: detailData.updated_at,
          creator: detailData.creator,
          archiver: detailData.creator, // API没有返回归档人，使用创建人代替
          images: detailData.images || []
        }
      } else {
        ElMessage.error(res.data.message || '获取案例详情失败')
      }
    })
    .catch(error => {
      console.error('获取案例详情失败:', error)
      ElMessage.error('获取案例详情失败')
    })
    .finally(() => {
      loadingDetail.value = false
    })
}

// 新建案例
const handleCreateCase = () => {
  createDialogVisible.value = true
}

// 新建案例对话框
const createDialogVisible = ref(false)
const newCase = ref({
  title: '',
  case_type: 'chatScript',
  content: ''
})
const formRules = ref({
  title: [{ required: true, message: '请输入案例标题', trigger: 'blur' }],
  case_type: [{ required: true, message: '请选择案例类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入案例描述', trigger: 'blur' }]
})
const createFormRef = ref(null)
const fileList = ref([])
const submitting = ref(false)

// 文件上传处理函数
const handleFileChange = (uploadFile: any) => {
  // 生成缩略图预览
  const reader = new FileReader()
  reader.readAsDataURL(uploadFile.raw)
  reader.onload = () => {
    uploadFile.url = reader.result
  }
  
  // 添加到文件列表
  const isExist = fileList.value.some(item => item.uid === uploadFile.uid)
  if (!isExist) {
    fileList.value.push(uploadFile)
  }
}

const handleFileRemove = (file: any) => {
  // 从文件列表中移除
  fileList.value = fileList.value.filter(item => item.uid !== file.uid)
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传10张图片!')
}

const beforeUpload = (file: any) => {
  // 检查文件类型
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  if (!isImage) {
    ElMessage.error('只能上传JPG/PNG格式的图片!')
    return false
  }
  
  // 检查文件大小
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  
  return true
}

const submitNewCase = () => {
  if (!createFormRef.value) return
  
  createFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 准备FormData
      const formData = new FormData()
      formData.append('title', newCase.value.title)
      formData.append('case_type', newCase.value.case_type)
      formData.append('content', newCase.value.content)
      
      // 添加图片文件
      if (fileList.value.length > 0) {
        fileList.value.forEach((file: any) => {
          formData.append('images', file.raw)
        })
      }
      
      submitting.value = true
      try {
        const res = await createCase(formData)
        if (res.data.code === 0) {
          ElMessage.success('案例创建成功')
          createDialogVisible.value = false
          // 重新加载案例列表
          fetchCases()
          // 重置表单
          resetForm()
        } else {
          ElMessage.error(res.data.message || '创建失败')
        }
      } catch (error: any) {
        console.error('创建案例失败:', error)
        ElMessage.error(error.message || '提交失败，请重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (createFormRef.value) {
    createFormRef.value.resetFields()
  }
  fileList.value = []
  newCase.value = {
    title: '',
    case_type: 'chatScript',
    content: ''
  }
}

// 获取案例列表数据
const fetchCases = async () => {
  loading.value = true
  try {
    const res = await getCaseList({
      case_type: caseTypeFilter.value,
      keyword: searchQuery.value,
      page: 1,
      pageSize: 20
    })
    if (res.data.code === 0) {
      // 处理API返回的数据，确保必要字段存在
      cases.value = (res.data.data?.list || []).map((item: any) => ({
        ...item,
        // 确保基本字段存在并进行字段映射
        id: item.id || `CASE-${Math.floor(Math.random() * 10000)}`,
        title: item.title || '无标题案例',
        case_type: item.case_type || 'chatScript',
        // 状态默认为已归档（因为API没有返回status字段）
        status: 'archived',
        // 字段名称映射
        description: item.content || '无描述信息',
        createTime: item.created_at || new Date().toISOString(),
        // 设置归档时间为创建时间（因为API没有返回归档时间）
        archiveTime: item.updated_at || item.created_at,
        // 确保creator对象存在
        creator: item.creator || { id: 0, name: '未知用户' },
        // archiver是可选的，API没有返回，设为创建者
        archiver: item.creator || null,
        // images是可选的
        images: Array.isArray(item.images) ? item.images : []
      }))
    } else {
      ElMessage.error(res.data.message || '获取案例列表失败')
    }
  } catch (error) {
    console.error('获取案例列表失败:', error)
    ElMessage.error('获取案例列表失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  // 获取用户角色信息（实际项目中应从userStore获取）
  if (userStore.userInfo?.role?.role_name) {
    currentUserRole.value = userStore.userInfo.role.role_name
  }
  // 加载案例列表
  fetchCases()
})

// 确认删除
const deleting = ref(false)
const confirmDelete = (item: Case) => {
  ElMessageBox.confirm(
    `确定要删除案例"${item.title}"吗？删除后将无法恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      handleDeleteCase(item.id)
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 删除案例
const handleDeleteCase = async (id: string) => {
  deleting.value = true
  try {
    const res = await deleteCase(id)
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      // 从列表中移除已删除的案例
      cases.value = cases.value.filter(item => item.id !== id)
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (error: any) {
    console.error('删除案例失败:', error)
    ElMessage.error(error.message || '删除失败，请重试')
  } finally {
    deleting.value = false
  }
}

// 图片查看器控制
const imageViewerVisible = ref(false)
const currentImageIndex = ref(0)
const currentImageUrl = ref('')
const zoomLevel = ref(1)
const rotation = ref(0)
const imageViewerRef = ref(null)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchDistance = ref(0)
const isTouching = ref(false)
const imageLoading = ref(false)
const preloadedImages = ref<{ [key: string]: boolean }>({})

// 图片预加载函数
const preloadImages = (images: string[], currentIndex: number) => {
  if (!images || images.length === 0) return
  
  // 预加载当前图片、前一张和后一张
  const indicesToPreload = [
    currentIndex,
    (currentIndex + 1) % images.length,
    (currentIndex - 1 + images.length) % images.length
  ]
  
  indicesToPreload.forEach(index => {
    const imageUrl = images[index]
    if (imageUrl && !preloadedImages.value[imageUrl]) {
      const img = new Image()
      img.src = imageUrl
      img.onload = () => {
        preloadedImages.value[imageUrl] = true
      }
    }
  })
}

// 打开图片查看器
const openImageViewer = (index: number) => {
  currentImageIndex.value = index
  imageViewerVisible.value = true
  
  // 设置当前图片URL并显示加载状态
  imageLoading.value = true
  currentImageUrl.value = currentCase.value?.images?.[currentImageIndex.value] || ''
  
  // 重置缩放和旋转
  zoomLevel.value = 1
  rotation.value = 0
  
  // 预加载图片
  if (currentCase.value?.images) {
    preloadImages(currentCase.value.images, currentImageIndex.value)
  }
  
  // 添加键盘事件监听
  setTimeout(() => {
    if (imageViewerRef.value) {
      imageViewerRef.value.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
  }, 100)
}

// 关闭图片查看器
const closeImageViewer = () => {
  imageViewerVisible.value = false
  document.removeEventListener('keydown', handleKeyDown)
}

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (!imageViewerVisible.value) return

  switch (event.key) {
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'Escape':
      closeImageViewer()
      break
    case '+':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case 'r':
      rotateImage()
      break
  }
}

// 鼠标滚轮处理
const handleMouseWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (event.deltaY < 0) {
    zoomIn()
  } else if (event.deltaY > 0) {
    zoomOut()
  }
}

// 图片操作
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.1, 3)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.5)
}

const rotateImage = () => {
  rotation.value = (rotation.value + 90) % 360
}

// 切换图片
const prevImage = () => {
  if (!currentCase.value?.images || currentCase.value.images.length <= 1) return
  
  imageLoading.value = true
  currentImageIndex.value = (currentImageIndex.value - 1 + (currentCase.value.images.length)) % (currentCase.value.images.length)
  currentImageUrl.value = currentCase.value.images[currentImageIndex.value] || ''
  
  // 预加载其他图片
  preloadImages(currentCase.value.images, currentImageIndex.value)
}

const nextImage = () => {
  if (!currentCase.value?.images || currentCase.value.images.length <= 1) return
  
  imageLoading.value = true
  currentImageIndex.value = (currentImageIndex.value + 1) % (currentCase.value.images.length)
  currentImageUrl.value = currentCase.value.images[currentImageIndex.value] || ''
  
  // 预加载其他图片
  preloadImages(currentCase.value.images, currentImageIndex.value)
}

// 图片加载完成事件
const handleImageLoad = () => {
  imageLoading.value = false
}

// 下载当前图片
const downloadImage = () => {
  if (!currentImageUrl.value) return
  
  try {
    // 创建一个链接元素
    const link = document.createElement('a')
    link.href = currentImageUrl.value
    
    // 从URL中提取文件名，或使用默认名称
    const filename = currentImageUrl.value.split('/').pop() || `case_image_${Date.now()}.jpg`
    link.download = filename
    
    // 触发点击事件下载图片
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage({
      type: 'success',
      message: '图片下载已开始'
    })
  } catch (error) {
    console.error('下载图片失败:', error)
    ElMessage({
      type: 'error',
      message: '下载图片失败'
    })
  }
}

// 处理触摸开始事件
const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1) {
    // 单指触摸，可能是滑动操作
    touchStartX.value = event.touches[0].clientX
    touchStartY.value = event.touches[0].clientY
    isTouching.value = true
  } else if (event.touches.length === 2) {
    // 双指触摸，可能是缩放操作
    const dx = event.touches[0].clientX - event.touches[1].clientX
    const dy = event.touches[0].clientY - event.touches[1].clientY
    touchDistance.value = Math.sqrt(dx * dx + dy * dy)
  }
}

// 处理触摸移动事件
const handleTouchMove = (event: TouchEvent) => {
  if (!isTouching.value) return
  
  if (event.touches.length === 1) {
    // 单指滑动
    const touchEndX = event.touches[0].clientX
    const touchEndY = event.touches[0].clientY
    const deltaX = touchEndX - touchStartX.value
    
    // 横向滑动超过50px时切换图片
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevImage()
      } else {
        nextImage()
      }
      // 重置触摸状态
      isTouching.value = false
    }
  } else if (event.touches.length === 2) {
    // 双指缩放
    const dx = event.touches[0].clientX - event.touches[1].clientX
    const dy = event.touches[0].clientY - event.touches[1].clientY
    const newDistance = Math.sqrt(dx * dx + dy * dy)
    
    // 计算缩放比例变化
    if (touchDistance.value > 0) {
      const scale = newDistance / touchDistance.value
      if (scale > 1.05) {
        zoomIn()
        touchDistance.value = newDistance
      } else if (scale < 0.95) {
        zoomOut()
        touchDistance.value = newDistance
      }
    }
  }
}

// 处理触摸结束事件
const handleTouchEnd = () => {
  isTouching.value = false
  touchDistance.value = 0
}

// 在组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
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
  
  .search-row {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    
    .search-input {
      flex: 1;
      max-width: calc((100% - 16px * 3 - 20%) / 3);
    }
    
    .filter-select {
      flex: 1;
      max-width: calc((100% - 16px * 3 - 20%) / 3);
    }
    
    .create-button {
      width: 20%;
      min-width: 120px;
      max-width: 180px;
    }
    
    @media (max-width: 1200px) {
      gap: 12px;
      
      .search-input,
      .filter-select {
        max-width: calc((100% - 12px * 3 - 20%) / 3);
      }
      
      .create-button {
        min-width: 110px;
      }
    }
    
    @media (max-width: 992px) {
      flex-wrap: wrap;
      gap: 12px;
      
      .search-input,
      .filter-select {
        flex: 1;
        min-width: calc(33.33% - 8px);
        max-width: calc(33.33% - 8px);
      }
      
      .create-button {
        width: 100%;
        max-width: none;
        margin-top: 12px;
      }
    }
    
    @media (max-width: 768px) {
      .search-input,
      .filter-select {
        width: 100%;
        max-width: 100%;
        min-width: 100%;
      }
    }
  }
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.case-card {
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    box-shadow: 0 4px 10px -1px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-3px);
    
    .delete-button {
      opacity: 1;
    }
  }
  
  .delete-button {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: rgba(220, 38, 38, 0.8);
      transform: scale(1.1);
    }
  }

  .case-card-image-wrapper {
    height: 160px;
    position: relative;
    overflow: hidden;
    background-color: #f3f4f6;
    flex-shrink: 0;
    
    .case-card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover .case-card-image {
      transform: scale(1.05);
    }
    
    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      
      .el-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
      
      span {
        font-size: 13px;
      }
    }
    
    .image-count {
      position: absolute;
      right: 10px;
      bottom: 10px;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 2;
    }
  }

  .case-card-content {
    padding: 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .case-card-header {
    margin-bottom: 12px;
    
    .case-id {
      display: inline-block;
      font-family: monospace;
      color: #6b7280;
      font-size: 12px;
      padding: 2px 6px;
      background: #f3f4f6;
      border-radius: 4px;
    }
    
    .case-card-title {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
      margin: 6px 0 10px 0;
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
    }
  }

  .time-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
    
    .time-tag {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #6b7280;
      background-color: #f9fafb;
      padding: 6px 10px;
      border-radius: 6px;
      border-left: 3px solid #909399;
      
      &.archive-time {
        border-left-color: #67C23A;
      }
      
      &.draft-time {
        border-left-color: #909399;
      }
    }
  }

  .description-section {
    margin-bottom: 10px;
    
    .description-text {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.5;
      /* 设置最大高度，超出显示省略号 */
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      max-height: 60px;
    }
  }

  .users-section {
    margin-top: auto;
    
    .users-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      padding-top: 6px;
      border-top: 1px dashed #e5e7eb;
    }
    
    .user-cell {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      
      .user-label {
        color: #6b7280;
        font-size: 11px;
        margin-bottom: 3px;
      }
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .user-name {
          font-size: 12px;
          color: #374151;
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

// 详情页样式
.case-detail {
  background-color: #f0f2f5;
  
  .carousel-container {
    margin-bottom: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 12px;
    overflow: hidden;
    
    :deep(.el-carousel__item) {
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      
      &:hover .image-overlay {
        opacity: 1;
      }
    }
    
    .carousel-image-container {
      width: 100%;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
    }
    
    .carousel-image {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.02);
      }
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s;
      cursor: pointer;
      
      .el-icon {
        font-size: 32px;
        color: white;
        margin-bottom: 10px;
      }
      
      .overlay-text {
        color: white;
        font-size: 14px;
      }
    }
  }
  
  .info-card {
    border: 1px solid #e5e7eb;
    overflow: hidden;
    
    .card-header {
      background-color: #f9fafb;
      
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        position: relative;
        padding-left: 12px;
        margin: 0;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 16px;
          width: 4px;
          background-color: #409EFF;
          border-radius: 2px;
        }
      }
    }
    
    .card-body {
      background-color: white;
    }

    .card-section-title {
      font-size: 15px;
      font-weight: 500;
      color: #333;
      position: relative;
      padding-left: 10px;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 14px;
        width: 3px;
        background-color: #909399;
        border-radius: 2px;
      }
    }
  }
}

.description-content {
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
  text-align: justify;
  letter-spacing: 0.3px;
  padding: 0 10px;
}

.case-number {
  display: inline-block;
  background-color: #f4f4f5;
  color: #606266;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: 600;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(0, 0, 0, 0.5);
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

:deep(.el-carousel__indicators) {
  .el-carousel__button {
    background-color: rgba(255, 255, 255, 0.4);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.7);
    }
  }
  
  .is-active .el-carousel__button {
    background-color: white;
  }
}

.carousel-container {
  margin: 16px 0;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  
  &:hover {
    .image-overlay {
      opacity: 1;
    }
  }
}

.carousel-image-container {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.carousel-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.02);
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
  
  .el-icon {
    font-size: 32px;
    color: white;
    margin-bottom: 10px;
  }
  
  .overlay-text {
    color: white;
    font-size: 14px;
  }
}

.image-viewer-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(5px);
}

.image-viewer-header {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  
  .close-button {
    background-color: transparent;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    
    &:hover {
      color: #f56c6c;
    }
  }
}

.image-viewer-body {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  .current-image {
    max-width: 90%;
    max-height: 80vh;
    object-fit: contain;
  }
  
  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    font-size: 24px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.8);
    }
    
    &.prev {
      left: 20px;
    }
    
    &.next {
      right: 20px;
    }
  }
}

// 添加键盘操作提示
.keyboard-tips {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

// 适配移动设备
@media (max-width: 768px) {
  .image-viewer-container {
    .image-viewer-header {
      padding: 10px;
      
      .image-counter {
        font-size: 12px;
      }
    }
    
    .nav-button {
      width: 36px;
      height: 36px;
      
      .el-icon {
        font-size: 16px;
      }
    }
    
    .keyboard-tips {
      display: none; // 在移动设备上隐藏键盘提示
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 添加样式
.detail-section {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 20px;
  margin-bottom: 20px;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.detail-header {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    position: relative;
    padding-left: 12px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 16px;
      width: 4px;
      background-color: #409EFF;
      border-radius: 2px;
    }
  }
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
  
  .detail-label {
    min-width: 80px;
    font-size: 14px;
    color: #606266;
    text-align: right;
  }
  
  .detail-value {
    flex: 1;
    font-size: 14px;
    color: #303133;
    word-break: break-word;
    
    &.empty {
      color: #909399;
      font-style: italic;
    }
  }
}

.case-type-tag, .status-tag {
  font-size: 13px;
  padding: 4px 10px;
  font-weight: 600;
  border-radius: 4px;
  white-space: nowrap;
}

.category-tag {
  font-size: 12px;
  padding: 2px 8px;
  height: 24px;
  font-weight: 500;
}

.status-tag.el-tag--small {
  font-size: 12px;
  padding: 0 8px;
  height: 22px;
  line-height: 20px;
  font-weight: 500;
}

.content-wrapper {
  padding: 0 10px;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
}

// 抽屉样式覆盖
:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  
  .drawer-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

:deep(.el-drawer__body) {
  padding: 0;
  background-color: #f0f2f5;
}

.basic-info-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .basic-info-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    
    .info-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background-color: #ecf5ff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409EFF;
      font-size: 18px;
      flex-shrink: 0;
    }
    
    .info-content {
      flex: 1;
      
      .info-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 8px;
      }
      
      .info-value {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }
    }
  }
}

.archive-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
  
  .archive-info-item {
    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .info-icon-container {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background-color: rgba(64, 158, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      .info-icon {
        font-size: 18px;
        color: #409EFF;
      }
    }
    
    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      
      .info-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 8px;
      }
      
      .info-value {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
        
        &.user-value {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      }
    }
  }
}
</style>

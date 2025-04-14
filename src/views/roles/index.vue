<template>
  <div class="app-container">
    <!-- 全屏加载 -->
    <div 
      v-if="fullscreenLoading" 
      class="fullscreen-loading"
    >
      <el-loading
        :visible="true"
        fullscreen
        text="正在加载权限数据..."
        background="rgba(0, 0, 0, 0.7)"
      />
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="roleList"
      style="width: 100%; margin-top: 20px"
      :row-key="(row) => row.id"
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="role_name" label="角色名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button 
            type="primary" 
            link 
            @click="handlePermission(row)"
            :loading="permissionLoading && currentRoleId === row.id"
          >
            权限设置
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 角色表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="roleForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="roleForm.role_name" placeholder="请输入角色名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 权限设置对话框 -->
    <el-dialog
      title="权限设置"
      v-model="permissionDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      class="permission-dialog"
    >
      <div v-loading="permissionLoading" class="permission-content">
        <div class="permission-header">
          <h3>为角色 "{{ currentRoleName }}" 分配权限</h3>
          <p class="permission-tip">请选择该角色可访问的菜单和功能</p>
        </div>
        <el-tree
          ref="treeRef"
          :data="menuTree"
          show-checkbox
          node-key="id"
          :props="{ label: 'name' }"
          :default-checked-keys="selectedMenus"
          class="permission-tree"
          style="max-height: 400px; overflow-y: auto"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit" :loading="submitting">
            保存权限设置
          </el-button>
        </div>
      </template>
    </el-dialog>

    
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoles, createRole, updateRole, deleteRole, getRoleMenus } from '@/api/role'
import { formatDate } from '@/utils/format'
import { getMenus } from '@/api/menu'
import { formatDateRange } from '@/utils/date'

const loading = ref(false)
const roleList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const permissionDialogVisible = ref(false)
const submitting = ref(false)

const formRef = ref()

const roleForm = ref({
  role_name: '',
  description: '',
  menu_ids: []
})

const rules = {
  role_name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 查询参数
const queryParams = ref({
  page: 1,
  pageSize: 10,
  role_name: '',
  startTime: '',
  endTime: ''
})

// 获取角色列表
const getRoleList = async () => {
  try {
    loading.value = true
    const res = await getRoles()
    roleList.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch (error) {
    console.error('Get roles error:', error)
    roleList.value = []
  } finally {
    loading.value = false
  }
}

// 新增角色
const handleAdd = () => {
  dialogTitle.value = '新增角色'
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  roleForm.value = { ...row }
  dialogVisible.value = true
}

// 删除角色
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该角色吗？', '提示', {
      type: 'warning'
    })
    
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    getRoleList()
  } catch (error) {
    console.error('Delete role error:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate()
  
  try {
    submitting.value = true
    if (roleForm.value.id) {
      await updateRole(roleForm.value.id, roleForm.value)
      ElMessage.success('更新成功')
    } else {
      await createRole(roleForm.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getRoleList()
  } catch (error) {
    console.error('Submit role error:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  roleForm.value = {
    role_name: '',
    description: '',
    menu_ids: []
  }
}

// 权限相关
const treeRef = ref()
const menuTree = ref([])
const selectedMenus = ref([])
const currentRoleId = ref()
const currentRoleName = ref('')
const permissionLoading = ref(false)

// 添加全局加载状态
const fullscreenLoading = ref(false)

// 获取所有菜单
const getMenuList = async () => {
  try {
    const res = await getMenus()
    console.log('菜单数据:', res.data.data)
    if (Array.isArray(res.data.data)) {
      menuTree.value = res.data.data
    } else {
      menuTree.value = []
      console.error('返回的菜单数据格式不正确')
    }
  } catch (error) {
    console.error('Get menus error:', error)
    menuTree.value = []
  }
}

// 打开权限设置对话框
const handlePermission = async (row) => {
  try {
    // 显示全屏加载
    fullscreenLoading.value = true
    currentRoleId.value = row.id
    currentRoleName.value = row.role_name
    
    const [menuRes, roleMenuRes] = await Promise.all([
      getMenus(),
      getRoleMenus(row.id)
    ])
    
    if (Array.isArray(menuRes.data.data)) {
      menuTree.value = menuRes.data.data
    } else {
      menuTree.value = []
      console.error('返回的菜单数据格式不正确')
    }
    
    selectedMenus.value = roleMenuRes.data.data.map(menu => menu.id)
    
    permissionDialogVisible.value = true
  } catch (error) {
    console.error('Get role menus error:', error)
    ElMessage.error('获取权限数据失败')
  } finally {
    // 关闭全屏加载
    fullscreenLoading.value = false
  }
}

// 提交权限设置
const handlePermissionSubmit = async () => {
  if (!currentRoleId.value || !treeRef.value) return
  
  try {
    submitting.value = true
    const checkedKeys = treeRef.value.getCheckedKeys()
    console.log('选中的权限:', checkedKeys)
    await updateRole(currentRoleId.value, {
      menu_ids: checkedKeys
    })
    ElMessage.success('权限设置成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('Update role permissions error:', error)
  } finally {
    submitting.value = false
  }
}

// 日期范围
const dateRange = ref()

// 监听日期变化
watch(dateRange, (val) => {
  const { startTime, endTime } = formatDateRange(val)
  queryParams.value.startTime = startTime
  queryParams.value.endTime = endTime
})

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    page: 1,
    pageSize: 10,
    role_name: '',
    startTime: '',
    endTime: ''
  }
  dateRange.value = undefined
  getRoleList()
}

onMounted(() => {
  getRoleList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.toolbar {
  padding: 10px 0;
}

/* 权限对话框样式 */
:deep(.permission-dialog) {
  .el-dialog__body {
    padding: 0;
  }
  
  .el-dialog__header {
    padding: 20px 24px;
    margin: 0;
    border-bottom: 1px solid #e4e7ed;
    background-color: #f5f7fa;
  }
  
  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e4e7ed;
    background-color: #f5f7fa;
  }
}

.permission-content {
  padding: 20px;
  
  .permission-header {
    margin-bottom: 16px;
    
    h3 {
      margin: 0 0 8px;
      font-size: 16px;
      color: #303133;
    }
    
    .permission-tip {
      margin: 0;
      color: #909399;
      font-size: 13px;
    }
  }
}

.permission-tree {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background-color: #f9fafc;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 添加全屏加载样式 */
.fullscreen-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-loading-spinner) {
  .circular {
    width: 42px;
    height: 42px;
  }
  .el-loading-text {
    color: #fff;
    font-size: 16px;
    margin: 8px 0;
  }
}
</style>

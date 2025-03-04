<template>
  <div class="app-container">
    <div class="toolbar">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item>
          <el-input
            v-model="queryParams.username"
            placeholder="用户名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select 
            v-model="queryParams.role_id" 
            placeholder="角色" 
            clearable
            filterable
          >
            <el-option 
              v-for="role in roleList"
              :key="role.id"
              :label="role.role_name"
              :value="role.id"
            >
              {{ role.role_name }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select 
            v-model="queryParams.status" 
            placeholder="状态" 
            clearable
            filterable
          >
            <el-option 
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </div>

    <el-table v-loading="loading" :data="userList" style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="real_name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role.role_name" label="角色" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 用户表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="userForm.username" 
            placeholder="请输入用户名"
            :disabled="!!userForm.id"
          />
        </el-form-item>
        <el-form-item 
          label="密码" 
          prop="password"
          :rules="[
            { required: !userForm.id, message: '请输入密码', trigger: 'blur' },
            { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
          ]"
        >
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="姓名" prop="real_name">
          <el-input v-model="userForm.real_name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role_id">
          <el-select v-model="userForm.role_id" placeholder="请选择角色">
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.role_name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="userForm.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser, updateUserStatus } from '@/api/user'
import { getRoles } from '@/api/role'
import type { UserInfo, UserForm } from '@/types/user'
import type { Role } from '@/types/role'
import { formatDate } from '@/utils/format'

const loading = ref(false)
const userList = ref<UserInfo[]>([])
const roleList = ref<Role[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)

const formRef = ref<FormInstance>()
const userForm = ref<UserForm>({
  username: '',
  password: '',
  role_id: 0,
  real_name: '',
  email: '',
  status: 1
})

const queryParams = ref({
  username: '',
  role_id: undefined,
  status: undefined
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  role_id: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 状态选项
const statusOptions = [
  { label: '全部', value: undefined },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
] as const

// 搜索表单
const searchForm = ref({
  username: '',
  role_id: '',
  status: ''
})

// 获取用户列表
const getUserList = async () => {
  try {
    loading.value = true
    // 使用 queryParams 而不是 searchForm
    const params = {
      username: queryParams.value.username || undefined,
      role_id: queryParams.value.role_id || undefined,
      status: queryParams.value.status || undefined
    }
    console.log('搜索参数:', params)  // 添加日志打印
    const res = await getUsers(params)
    userList.value = res.data
  } catch (error) {
    console.error('Get users error:', error)
  } finally {
    loading.value = false
  }
}

// 获取角色列表
const getRoleList = async () => {
  try {
    const res = await getRoles()
    roleList.value = res.data
    console.log('res', roleList.value)
  } catch (error) {
    console.error('Get roles error:', error)
  }
}

// 搜索
const handleSearch = () => {
  console.log('点击搜索按钮，查询条件:', queryParams.value)  // 添加日志打印
  getUserList()
}

// 重置查询
const resetQuery = () => {
  console.log('重置前:', queryParams.value)  // 添加日志打印
  queryParams.value = {
    username: '',
    role_id: undefined,
    status: undefined
  }
  console.log('重置后:', queryParams.value)  // 添加日志打印
  getUserList()
}

// 新增用户
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: UserInfo) => {
  dialogTitle.value = '编辑用户'
  userForm.value = {
    ...row,
    password: '' // 编辑时不显示密码
  }
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm('确认删除该用户吗？', '提示', {
      type: 'warning'
    })
    
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    getUserList()
  } catch (error) {
    console.error('Delete user error:', error)
  }
}

// 修改用户状态
const handleStatusChange = async (row: UserInfo) => {
  try {
    await updateUserStatus(row.id, row.status)
    ElMessage.success('状态修改成功')
  } catch (error) {
    console.error('Update user status error:', error)
    // 恢复状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate()
  
  try {
    submitting.value = true
    const submitData = { ...userForm.value }
    if (!submitData.password) {
      delete submitData.password
    }
    
    if (userForm.value.id) {
      await updateUser(userForm.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createUser(submitData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getUserList()
  } catch (error) {
    console.error('Submit user error:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  userForm.value = {
    username: '',
    password: '',
    role_id: 0,
    real_name: '',
    email: '',
    status: 1
  }
}

// 格式化状态显示
const formatStatus = (status: number) => {
  return statusOptions.find(item => item.value === status)?.label || '未知'
}

onMounted(async () => {
  await getUserList()
  await getRoleList()
  console.log('roleList:', roleList.value)
})
</script>

<style scoped>
.toolbar {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  flex: 1;
  margin-right: 20px;
}
</style>

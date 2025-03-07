<template>
  <div class="app-container">
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
          <el-button type="primary" link @click="handlePermission(row)">权限设置</el-button>
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
      width="600px"
    >
      <el-tree
        ref="treeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'name' }"
        :default-checked-keys="selectedMenus"
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 日期范围选择器 -->
    <el-date-picker
      v-model="dateRange"
      type="daterange"
      value-format="YYYY-MM-DD"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
    />
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
    currentRoleId.value = row.id
    await getMenuList()
    const res = await getRoleMenus(row.id)
    selectedMenus.value = res.data.data.map(menu => menu.id)
    permissionDialogVisible.value = true
  } catch (error) {
    console.error('Get role menus error:', error)
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
.toolbar {
  padding: 10px 0;
}
</style>

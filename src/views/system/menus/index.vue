<template>
  <div class="app-container">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增菜单</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="menuList"
      style="width: 100%"
      row-key="id"
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="name" label="菜单名称" />
      <el-table-column prop="path" label="路由路径" />
      <el-table-column prop="icon" label="图标" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 菜单表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="menuForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="上级菜单" v-if="!menuForm.id">
          <el-tree-select
            v-model="menuForm.parent_id"
            :data="menuList"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择上级菜单"
            clearable
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input 
            v-model="menuForm.path" 
            placeholder="请输入路由路径"
            :disabled="!!menuForm.id"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="menuForm.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="menuForm.sort" :min="0" :max="99" />
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
import { getMenus, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import type { Menu, MenuForm } from '@/types/menu'
import { useUserStore } from '@/stores/user'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const loading = ref(false)
const menuList = ref<Menu[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)

const formRef = ref<FormInstance>()
const menuForm = ref<MenuForm>({
  name: '',
  path: '',
  icon: '',
  sort: 0,
  parent_id: null
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请输入图标名称', trigger: 'blur' }
  ]
}

// 在 setup 中获取 store
const userStore = useUserStore()

// 获取菜单列表
const getMenuList = async () => {
  try {
    loading.value = true
    const res = await getMenus()
    if (res.data && res.data.data) {
      // 确保数据是数组
      menuList.value = Array.isArray(res.data.data) ? res.data.data : []
    }
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
    menuList.value = [] // 出错时设置为空数组
  } finally {
    loading.value = false
  }
}

// 新增菜单
const handleAdd = () => {
  dialogTitle.value = '新增菜单'
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row: Menu) => {
  dialogTitle.value = '编辑菜单'
  menuForm.value = { ...row }
  dialogVisible.value = true
}

// 删除菜单
const handleDelete = async (row: Menu) => {
  try {
    await ElMessageBox.confirm('确认删除该菜单吗？', '提示', {
      type: 'warning'
    })
    
    await deleteMenu(row.id)
    ElMessage.success('删除成功')
    // 删除成功后刷新菜单
    await userStore.getUserInfoAction()
    getMenuList()
  } catch (error) {
    console.error('Delete menu error:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate()
  
  try {
    submitting.value = true
    if (menuForm.value.id) {
      const updateData = {
        name: menuForm.value.name,
        icon: menuForm.value.icon,
        sort: menuForm.value.sort
      }
      await updateMenu(menuForm.value.id, updateData)
      ElMessage.success('更新成功')
      await userStore.getUserInfoAction()
    } else {
      await createMenu(menuForm.value)
      ElMessage.success('创建成功')
      await userStore.getUserInfoAction()
    }
    dialogVisible.value = false
    getMenuList()
  } catch (error) {
    console.error('Submit menu error:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  menuForm.value = {
    name: '',
    path: '',
    icon: '',
    sort: 0,
    parent_id: null
  }
}

// 判断是否可以上移
const canMoveUp = (row: Menu) => {
  // 获取同级菜单
  const siblings = menuList.value.filter(item => item.parent_id === row.parent_id)
  const index = siblings.findIndex(item => item.id === row.id)
  return index > 0
}

// 判断是否可以下移
const canMoveDown = (row: Menu) => {
  const siblings = menuList.value.filter(item => item.parent_id === row.parent_id)
  const index = siblings.findIndex(item => item.id === row.id)
  return index < siblings.length - 1
}

// 上移
const handleMoveUp = async (row: Menu) => {
  try {
    const siblings = menuList.value.filter(item => item.parent_id === row.parent_id)
    const index = siblings.findIndex(item => item.id === row.id)
    const prevMenu = siblings[index - 1]
    
    // 交换排序值
    const tempSort = row.sort
    await updateMenu(row.id, { sort: prevMenu.sort })
    await updateMenu(prevMenu.id, { sort: tempSort })
    
    // 刷新列表和侧边栏
    getMenuList()
    await userStore.getUserInfoAction()
    ElMessage.success('排序更新成功')
  } catch (error) {
    console.error('Move menu error:', error)
    ElMessage.error('排序更新失败')
  }
}

// 下移
const handleMoveDown = async (row: Menu) => {
  try {
    const siblings = menuList.value.filter(item => item.parent_id === row.parent_id)
    const index = siblings.findIndex(item => item.id === row.id)
    const nextMenu = siblings[index + 1]
    
    // 交换排序值
    const tempSort = row.sort
    await updateMenu(row.id, { sort: nextMenu.sort })
    await updateMenu(nextMenu.id, { sort: tempSort })
    
    // 刷新列表和侧边栏
    getMenuList()
    await userStore.getUserInfoAction()
    ElMessage.success('排序更新成功')
  } catch (error) {
    console.error('Move menu error:', error)
    ElMessage.error('排序更新失败')
  }
}

onMounted(() => {
  getMenuList()
})
</script>

<style scoped>
.toolbar {
  padding: 10px 0;
}

.sort-column {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-buttons {
  display: flex;
  gap: 4px;
}

/* 当按钮禁用时降低透明度 */
.sort-buttons .el-button.is-disabled {
  opacity: 0.5;
}
</style> 
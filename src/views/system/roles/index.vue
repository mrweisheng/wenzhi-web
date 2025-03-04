<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRoles, createRole, updateRole, deleteRole } from '@/api/role'
import { getMenus } from '@/api/menu'  // 确保使用正确的方法名
import type { FormInstance, FormRules } from 'element-plus'
import type { Role, RoleForm } from '@/types/role'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { Menu } from '@/types/menu'

// 定义菜单选项
const menuOptions = ref<Menu[]>([])
const roleList = ref<Role[]>([])

// 获取菜单列表
const fetchMenus = async () => {
  try {
    const { data } = await getMenus()
    menuOptions.value = data
  } catch (error) {
    console.error('获取菜单列表失败:', error)
  }
}

// 获取角色列表
const fetchRoles = async () => {
  try {
    const { data } = await getRoles()
    roleList.value = data
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

onMounted(() => {
  fetchRoles()
  fetchMenus()
})

// ... 其他代码保持不变
</script> 
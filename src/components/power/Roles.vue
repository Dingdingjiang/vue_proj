<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row class="mg-b-15">
        <el-button type="primary" @click="addRoleDialogVisible = true"
          >添加角色</el-button
        >
      </el-row>
      <el-table :data="rolesTableData" stripe border style="width: 100%">
        <!--表格展开列  -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success "
                      @close="removeRightById(scope.row, item2.id)"
                      closable
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18"
                    ><el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      @close="removeRightById(scope.row, item3.id)"
                      :key="item3.id"
                      closable
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 列表索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="180">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" width="180">
        </el-table-column>
        <!-- 表格操作列 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="eidtRoleBtn(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showAllotRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="handleAddRoleDialogClose"
    >
      <el-form
        :model="roleInf"
        ref="addRoleFormRef"
        :rules="RoleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleInf.roleName" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleInf.roleDesc" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="handleEditRoleDialogClose"
    >
      <el-form
        :model="roleInf"
        ref="editRoleFormRef"
        :rules="RoleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleInf.roleName" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleInf.roleDesc" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="allotRightDialogVisible"
      width="50%"
      @close="clearDefaultRightList()"
    >
      <el-tree
        :data="rightList"
        :default-checked-keys="defaultRightList"
        ref="rightTree"
        node-key="id"
        :props="defaultRightProps"
        show-checkbox
        default-expand-all
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRightById()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    //   获取角色列表
    this.getRolesList()
  },
  data() {
    return {
      // 角色及权限列表
      rolesTableData: [],
      roleId: 0,
      roleInf: {
        id: '',
        roleName: '',
        roleDesc: '',
      },
      rightList: [],
      addRoleDialogVisible: false,
      editRoleDialogVisible: false,
      allotRightDialogVisible: false,
      // 角色已有的权限ID列表，供el-tree使用
      defaultRightList: [],
      RoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述 ', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
        ],
      },
      defaultRightProps: {
        children: 'children',
        label: 'authName',
      },
    }
  },
  methods: {
    //   获取角色列表函数
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.erroe('获取角色列表失败！')
      }
      this.rolesTableData = res.data
    },
    // 添加角色
    addRole() {
      this.addRoleDialogVisible = false
      this.$refs.addRoleFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功')
        this.getRolesList()
      })
    },
    // 重置添加角色表单数据
    handleAddRoleDialogClose() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 重置编辑角色表单数据
    handleEditRoleDialogClose() {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 显示编辑角色对话框并传递角色信息
    eidtRoleBtn(role) {
      this.roleInf = role
      this.editRoleDialogVisible = true
    },
    // 修改角色名称或角色描述
    async editRole() {
      const { data: res } = await this.$http.put('roles/' + this.roleInf.id, {
        roleName: this.roleInf.roleName,
        roleDesc: this.roleInf.roleDesc,
      })
      if (res.meta.status !== 200) return this.$message.error('修改用户失败！')
      this.getRolesList()
      this.$message.success('修改角色成功！')
      this.editRoleDialogVisible = false
    },
    // 通过角色ID值删除角色
    deleteRoleById(roleId) {
      console.log(roleId)
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('roles/' + roleId)
          if (res.meta.status !== 200) {
            return this.$message.error('删除角色失败！')
          }
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    removeRightById(role, rightId) {
      console.log(role)
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除权限失败！')
          }
          // 数据返回的就是当前的用户权限列表直接赋值即可
          role.children = res.data
          this.$message({
            type: 'success',
            message: '删除权限成功!',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消删除成功',
          })
        })
    },
    // 清空展开权限id列表
    clearDefaultRightList() {
      this.defaultRightList = []
    },
    // 显示分配权限列表并获取权限列表
    async showAllotRightDialog(role) {
      this.allotRightDialogVisible = true
      const { data: res } = await this.$http.get('rights/tree')
      this.rightList = res.data
      this.getDefaultRightKeys(role, this.defaultRightList)
      // 传递角色ID供allotRightById（）使用
      this.roleId = role.id
    },
    // 获取默认选中的权限ID列表
    getDefaultRightKeys(node, arr) {
      if (!node.children) return arr.push(node.id)

      node.children.forEach((item) => {
        this.getDefaultRightKeys(item, arr)
      })
    },
    // 获取选中节点ID并持久化
    async allotRightById() {
      // 获取选中一、二、三级的权限ID值
      const checkedKeysList = [
        ...this.$refs.rightTree.getCheckedKeys(),
        ...this.$refs.rightTree.getHalfCheckedKeys(),
      ]
      const idStr = checkedKeysList.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('更新权限失败！')
      this.allotRightDialogVisible = false
      this.$message.success('更新权限成功！')
      this.getRolesList()
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>

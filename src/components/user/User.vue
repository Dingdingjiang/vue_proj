<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row class="mg-b-15">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInf.query" clearable>
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchUser()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="16">
          <el-button type="primary" class="addUserBtn" @click="showAddForm"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <el-table
        class="mg-b-15"
        :data="userList"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column type="index" width="50" label="#"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="操作">
          <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
          ></el-button>
          <el-button
            type="warning"
            icon="el-icon-setting"
            size="mini"
          ></el-button>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInf.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInf.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="handleDialogClose"
    >
      <el-form
        :model="addUserForm"
        status-icon
        :rules="addUserFormRules"
        ref="addUserFormRef"
        label-width="100px"
        resetFields
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model.number="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.number="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList()
  },
  data() {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return callback()
      }
      // 返回一个错误提示
      callback(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      // 返回一个错误提示
      callback(new Error('请输入合法的手机号码'))
    }
    return {
      userList: [],
      queryInf: {
        query: '',
        pagenum: 1,
        pagesize: 2,
      },
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      total: 0,
      addDialogVisible: false,
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInf,
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(newPagezise) {
      this.queryInf.pagesize = newPagezise
      this.getUserList()
    },
    handleCurrentChange(newPagenum) {
      this.queryInf.pagenum = newPagenum
      this.getUserList()
    },
    showAddForm() {
      this.addDialogVisible = true
    },
    searchUser() {
      this.queryInf.pagenum = 1
      this.queryInf.pagesize = 2
      this.getUserList()
    },
    handleDialogClose() {
      this.$refs.addUserFormRef.resetFields()
    },
    addUser() {
      this.$refs.addUserFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) this.$message.error('添加用户失败！')
        this.getUserList()
        this.$message.success('添加用户失败！')
        this.addDialogVisible = false
      })
    },
  },
}
</script>

<style lang="less" scoped>
.addUserBtn {
  margin-left: 20px;
}
</style>

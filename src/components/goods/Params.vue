<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 显示警示框 -->
      <el-row>
        <el-alert
          class="mg-b-15"
          title="注意只为第三级分类添加参数！"
          type="warning"
          :closable="false"
          show-icon
        >
        </el-alert>
      </el-row>
      <!-- 分类级联选择框 -->
      <el-row>
        <span>选择商品分类：</span>
        <el-cascader
          v-model="selectedParams"
          :options="paramsList"
          :props="paramsProps"
          @change="getParamsTableData"
        ></el-cascader>
      </el-row>
      <el-row>
        <!-- 动态参数面板 -->
        <el-tabs v-model="activeName" @tab-click="getParamsTableData">
          <el-tab-pane label="动态参数" name="many"
            ><el-button
              type="primary"
              :disabled="isBtnDisabled"
              @click="showaddParamsDialog"
              >添加参数</el-button
            >
            <el-table :data="paramsTableData" stripe style="width: 100%">
              <!-- 扩展列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    class="mg-l-10 mg-b-15"
                    v-for="tag in scope.row.attr_vals"
                    :key="tag"
                    @close="handleTagClose(scope.row, tag)"
                    closable
                  >
                    {{ tag }}
                  </el-tag>
                  <!-- 添加的输入框 -->
                  <el-input
                    class="mg-l-10 mg-b-15"
                    v-if="tagInputVisible"
                    v-model="tagInputValue"
                    ref="tagInputRef"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputBlur"
                    clearable
                  >
                  </el-input>
                  <!-- 添加的按钮 -->
                  <el-button
                    v-else
                    class="mg-l-10 mg-b-15"
                    size="small"
                    @click="showTagInput"
                    >+ New Tag</el-button
                  >
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column prop="attr_name" label="参数名称">
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    @click="showEditParamsDialog(scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="DeleteParams(scope.row.attr_id)"
                    >删除</el-button
                  ></template
                >
              </el-table-column></el-table
            ></el-tab-pane
          >
          <!-- 静态属性面板 -->
          <el-tab-pane label="静态属性" name="only"
            ><el-button
              type="primary"
              :disabled="isBtnDisabled"
              @click="showaddParamsDialog"
              >添加属性</el-button
            >
            <el-table :data="paramsTableData" stripe style="width: 100%">
              <!-- 扩展列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    class="mg-l-10 mg-b-15"
                    v-for="tag in scope.row.attr_vals"
                    :key="tag"
                    @close="handleTagClose(scope.row, tag)"
                    closable
                  >
                    {{ tag }}
                  </el-tag>
                  <!-- 添加的输入框 -->
                  <el-input
                    class="mg-l-10 mg-b-15"
                    v-if="tagInputVisible"
                    v-model="tagInputValue"
                    ref="tagInputRef"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputBlur"
                  >
                  </el-input>
                  <!-- 添加的按钮 -->
                  <el-button
                    v-else
                    class="mg-l-10 mg-b-15"
                    size="small"
                    @click="showTagInput"
                    >+ New Tag</el-button
                  >
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column prop="attr_name" label="属性名称">
              </el-table-column>
              <el-table-column prop="name" label="操作">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    @click="showEditParamsDialog(scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="DeleteParams(scope.row.attr_id)"
                    >删除</el-button
                  ></template
                ></el-table-column
              ></el-table
            ></el-tab-pane
          ></el-tabs
        >
      </el-row>
    </el-card>
    <!-- 添加属性参数对话框 -->
    <el-dialog
      :title="'添加' + isManyOrOnly"
      :visible.sync="addParamsDialogVisible"
      @close="handleAddParamsDialogClose"
      width="50%"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsrules"
        ref="addParamsFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="isManyOrOnly" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改属性对话框 -->
    <el-dialog
      :title="'修改' + isManyOrOnly"
      :visible.sync="editParamsDialogVisible"
      @close="handleEditParamsDialogClose"
      width="50%"
    >
      <el-form
        :model="editParamsForm"
        :rules="addParamsrules"
        ref="editParamsFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="isManyOrOnly" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateList()
  },
  data() {
    return {
      selectedParams: [],
      paramsList: [],
      paramsTableData: [],
      activeName: 'many',
      addParamsDialogVisible: false,
      tagInputVisible: false,
      tagInputValue: '',
      paramsProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      addParamsForm: {
        attr_name: '',
        attr_sel: '',
        attr_vals: '',
      },
      addParamsrules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
        ],
      },
      arrtList: [],
      editParamsDialogVisible: false,
      editParamsForm: {
        attr_name: '',
        attr_sel: '',
        attr_vals: '',
        attr_id: 0,
      },
    }
  },
  computed: {
    // 控制添加属性按钮是否可用
    isBtnDisabled() {
      if (this.selectedParams.length !== 3) {
        return true
      }
      return false
    },
    // 根据面板属性返回对应字符串
    isManyOrOnly() {
      if (this.activeName === 'only') {
        return '静态属性'
      } else {
        return '动态参数'
      }
    },
    // 返回被选中的分类ID
    getSelectedID() {
      return this.selectedParams[this.selectedParams.length - 1]
    },
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      this.paramsList = res.data
    },
    // 获取参数及属性列表
    async getParamsTableData() {
      const CateId = this.getSelectedID
      const { data: res } = await this.$http.get(
        `categories/${CateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      this.paramsTableData = res.data
      this.paramsTableData.forEach(
        (item) =>
          (item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [])
      )
    },
    showaddParamsDialog() {
      this.addParamsDialogVisible = true
    },
    // 显示修改属性对话框
    showEditParamsDialog(params) {
      this.editParamsDialogVisible = true
      this.editParamsForm.attr_name = params.attr_name
      this.editParamsForm.attr_id = params.attr_id
    },
    // 监听添加参数对话框关闭事件
    handleAddParamsDialogClose() {
      this.$refs.addParamsFormRef.resetFields()
    },
    addParams() {
      this.$refs.addParamsFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.getSelectedID}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.addParamsDialogVisible = false
        this.$message.success('添加参数成功！')
        this.getParamsTableData()
      })
    },
    handleEditParamsDialogClose() {
      this.$refs.editParamsFormRef.resetFields()
    },
    editParams() {
      this.$refs.editParamsFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.getSelectedID}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.editParamsDialogVisible = false
        this.$message.success('修改参数成功')
        this.getParamsTableData()
      })
    },
    // 删除属性或者参数
    DeleteParams(attrId) {
      this.$confirm('此操作将永久删除该属性（参数）, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.getSelectedID}/attributes/${attrId}`
          )
          if (res.meta.status !== 200) {
            this.$message.error('删除属性（参数）失败！')
          }
          this.$message.success('删除属性（参数）成功！')
          this.getParamsTableData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 切换按钮和输入框
    showTagInput() {
      this.tagInputVisible = true
      this.$nextTick(() => {
        this.$refs.tagInputRef.focus()
      })
      // this.$refs.tagInputRef.focus()
    },
    // 添加新标签 失去焦点或者回车提交
    async handleInputConfirm(row) {
      row.attr_vals.push(this.tagInputValue.trim())
      const { data: res } = await this.$http.put(
        `categories/${this.getSelectedID}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' '),
        }
      )
      if (res.meta.status !== 200) return this.$message.error('添加标签失败！')
      this.$message.success('添加标签成功！')
      this.tagInputVisible = false
    },
    // 监听标签输入框失去焦点事件
    handleInputBlur() {
      this.tagInputVisible = false
      this.tagInputValue = ''
    },
    handleTagClose(row, tag) {
      this.$confirm('此操作将永久删除该标签, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          row.attr_vals.splice(row.attr_vals.indexOf(tag), 1)
          const { data: res } = await this.$http.put(
            `categories/${this.getSelectedID}/attributes/${row.attr_id}`,
            {
              attr_name: row.attr_name,
              attr_sel: this.activeName,
              attr_vals: row.attr_vals.join(' '),
            }
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除标签失败！')
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
  },
}
</script>

<style lang="less" scoped>
</style>

<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type="primary" class="mg-b-15" @click="showAddCateDialog">
          添加分类
        </el-button>
      </el-row>
      <el-row>
        <TreeTable
          :data="cateList"
          :columns="columnsConfig"
          index-text="#"
          :show-row-hover="false"
          :selection-type="false"
          :expand-type="false"
          show-index
          border
          class="mg-b-15"
        >
          <template slot="cat_deleted_slot" slot-scope="scope">
            <i
              class="el-icon-success"
              v-if="!scope.row.cat_deleted"
              style="color: lightgreen"
            ></i>
            <i class="el-icon-error" style="color: red" v-else></i>
          </template>
          <template slot="cat_level_slot" slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level === 1"
              >二级</el-tag
            >
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
          <template slot="opt_slot">
            <el-button type="primary" icon="el-icon-edit" size="mini"
              >编辑</el-button
            >
            <el-button type="danger" icon="el-icon-delete" size="mini"
              >删除</el-button
            >
          </template>
        </TreeTable>
      </el-row>
      <el-row>
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
      </el-row>
    </el-card>
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      @close="handleAddCateDialogClose"
      width="50%"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            class="cateCascader"
            v-model="selectedCate"
            :options="parentCateList"
            :props="cascaderProps"
            @change="setAddCateForm"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
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
      cateList: [],
      fartherCateList: [],
      total: 0,
      queryInf: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      addCateDialogVisible: false,
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      columnsConfig: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'cat_deleted_slot',
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'cat_level_slot',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt_slot',
        },
      ],
      addCateForm: {
        // 父级分类ID
        cat_pid: 0,
        cat_name: '',
        cat_level: 0,
      },
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
      },
      selectedCate: [],
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInf,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newsize) {
      this.queryInf.pagesize = newsize
      this.getCateList()
    },
    handleCurrentChange(newpage) {
      this.queryInf.pagenum = newpage
      this.getCateList()
    },
    async showAddCateDialog() {
      this.addCateDialogVisible = true

      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败！')
      }
      this.parentCateList = res.data
      console.log(res)
    },
    addCate() {
      this.addCateDialogVisible = false
      this.$refs.addCateRef.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post(
            'categories',
            this.addCateForm
          )
          if (res.meta.status !== 200) this.$message.error('添加分类失败！')
          this.$message.success('添加分类成功')
          this.getCateList()
        }
      })

      // console.log(this.selectedCate)
      console.log(this.addCateForm)
    },
    setAddCateForm() {
      if (this.selectedCate.length > 0) {
        this.addCateForm.cat_pid =
          this.selectedCate[this.selectedCate.length - 1]
        this.addCateForm.cat_level = this.selectedCate.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    handleAddCateDialogClose() {
      this.$refs.addCateRef.resetFields()
      this.selectedCate = []
    },
  },
}
</script>

<style lang="less" scoped>
.cateCascader {
  width: 100%;
}

.el-cascader-menu__wrap .el-scrollbar__wrap {
  height: 300px;
}
</style>

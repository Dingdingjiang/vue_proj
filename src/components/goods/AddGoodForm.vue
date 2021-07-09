<template>
  <div>
    <el-alert title="添加商品信息" type="info" class="mg-b-15" show-icon center>
    </el-alert>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 步骤条 -->
    <el-row>
      <el-steps
        class="mg-b-15"
        :space="200"
        :active="tabValue - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
    </el-row>
    <el-row>
      <!-- 标签页 -->
      <el-form
        :model="baseGoodInfForm"
        :rules="baseGoodInfFormrules"
        ref="baseGoodInfFormRef"
        label-width="100px"
        label-position="top"
        class=""
      >
        <el-tabs
          tab-position="left"
          v-model="tabValue"
          :before-leave="handleTabChange"
          @tab-click="getParamsTableData"
        >
          <el-tab-pane label="基本信息" name="0">
            <!-- 基本信息的表单 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="baseGoodInfForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="baseGoodInfForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="baseGoodInfForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="baseGoodInfForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader
                v-model="baseGoodInfForm.goods_cat"
                :options="catesList"
                :props="catesProps"
                @change="handleCateCascaderChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyParamsData"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox
                class="mg-b-15 mg-l-0"
                :label="tag"
                border
                v-for="tag in item.attr_vals"
                :key="tag"
                checked
              ></el-checkbox>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyParamsData"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3"
            ><el-upload
              :action="picUploadPath"
              ref="picUpload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :headers="getHttpHead"
              list-type="picture"
            >
              <el-button slot="trigger" size="small" type="primary"
                >选取文件</el-button
              >
            </el-upload></el-tab-pane
          >
          <el-tab-pane label="商品内容" name="4" class="goodContent">
            <quill-editor
              class="mg-b-15"
              v-model="baseGoodInfForm.goods_introduce"
            ></quill-editor>
            <el-button type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-row>
    <el-dialog
      :title="picPreviewInf.name"
      :visible.sync="picPreviewDialogVisible"
      width="50%"
    >
      <img
        :src="picPreviewInf.url"
        :alt="picPreviewInf.name"
        style="object-fit: contain"
        class="previewPic"
      />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="picPreviewDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  created() {
    this.getCateList()
  },
  data() {
    return {
      baseGoodInfForm: {
        goods_name: '测试商品',
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        attrs: [],
      },
      //   控制标签页和步骤条的显示
      tabValue: '0',
      catesList: [],
      paramsTableData: [],
      manyParamsData: [],
      onlyParamsData: [],
      picPreviewInf: {
        url: '',
        name: '',
      },
      picPreviewDialogVisible: false,
      picUploadPath: 'http://127.0.0.1:8888/api/private/v1/upload',
      catesProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      baseGoodInfFormrules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    //   获取参数及属性数据
    async getParamsTableData(tab) {
      const CateId = this.getSelectedID
      const { data: res } = await this.$http.get(
        `categories/${CateId}/attributes`,
        {
          params: { sel: this.isManyOrOnly },
        }
      )
      //   选中了三级ID并且返回数据不正确报错
      if (res.meta.status !== 200 && CateId) {
        return this.$message.error('获取参数（属性）数据失败！')
      }
      if (this.isManyOrOnly === 'many') {
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyParamsData = res.data
      } else {
        this.onlyParamsData = res.data
      }
    },
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败！')
      }
      this.catesList = res.data
    },
    handleCateCascaderChange() {
      if (this.baseGoodInfForm.goods_cat.length !== 3) {
        this.$message.warning('只能选择三级分类！')
        this.baseGoodInfForm.goods_cat = []
      }
    },
    handleTabChange(activeTab, oldActiveTab) {
      if (this.baseGoodInfForm.goods_cat.length !== 3) {
        this.$message.error('未选择三级分类！')
        return false
      }
    },
    // 监听图片预览
    handlePreview(file) {
      this.picPreviewInf.url = file.url
      this.picPreviewInf.name = file.name
      this.picPreviewDialogVisible = true
    },
    // 监听图片删除
    handleRemove(file, fileList) {
      const picTempPath = file.response.data.tmp_path
      const i = this.baseGoodInfForm.pics.findIndex(
        (item) => item.pic === picTempPath
      )
      this.baseGoodInfForm.pics.splice(i, 1)
    },
    // 监听图片上传成功
    handleSuccess(response, file, fileList) {
      const picTempPath = response.data.tmp_path
      this.baseGoodInfForm.pics.push({ pic: picTempPath })
    },
    addGood() {
      // 验证表单合法性
      this.$refs.baseGoodInfFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('有必填项未填写，请重新见检查表单！')
        }

        // 处理分类数组
        const form = _.cloneDeep(this.baseGoodInfForm)
        form.goods_cat = form.goods_cat.join(',')

        // 处理attrs数组
        // 动态参数处理
        console.log(this.manyParamsData)
        this.manyParamsData.forEach((item) => {
          const newItem = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(','),
          }
          form.attrs.push(newItem)
        })
        // 静态属性处理
        this.onlyParamsData.forEach((item) => {
          const newItem = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          form.attrs.push(newItem)
        })

        // 发起添加商品请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        console.log(res)
      })
    },
  },
  computed: {
    // 返回被选中的分类ID
    getSelectedID() {
      if (this.baseGoodInfForm.goods_cat.length !== 3) {
        return null
      }
      return this.baseGoodInfForm.goods_cat[2]
    },
    // 根据面板属性返回对应字符串
    isManyOrOnly() {
      if (this.tabValue === '1') {
        return 'many'
      } else {
        return 'only'
      }
    },
    getHttpHead() {
      const head = { Authorization: window.sessionStorage.getItem('token') }
      return head
    },
  },
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin-left: 0px !important;
}

.previewPic {
  width: 100%;
}
</style>

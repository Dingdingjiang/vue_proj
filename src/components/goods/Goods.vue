<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索框及添加按钮行 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInf.query"
            class="mg-b-15"
            @clear="getGoodsList"
            clearable
          >
            <el-button
              icon="el-icon-search"
              slot="append"
              @click="getGoodsList"
            ></el-button> </el-input
        ></el-col>

        <el-col :span="16"
          ><el-button type="primary" class="mg-l-15 mg-b-15" @click="goAddPage"
            >添加商品</el-button
          ></el-col
        >
      </el-row>
      <el-row>
        <el-table :data="goodsTableData" style="width: 100%" stripe border>
          <el-table-column type="index" label="#"> </el-table-column>
          <el-table-column prop="goods_name" label="商品名称">
          </el-table-column>
          <el-table-column prop="goods_price" label="商品价格" width="100px">
          </el-table-column>
          <el-table-column prop="goods_weight" label="商品重量" width="100px">
          </el-table-column>
          <el-table-column prop="add_time" label="创建时间" width="160px">
            <template slot-scope="scope"
              >{{ dateFormat(scope.row.add_time) }}
            </template></el-table-column
          >
          <el-table-column label="操作" width="120px">
            <template>
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInf.pagenum"
          :page-sizes="[10, 15, 20, 30]"
          :page-size="queryInf.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getGoodsList()
  },
  data() {
    return {
      inputValue: '',
      queryInf: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      goodsTableData: [],
      total: 0,
    }
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInf,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodsTableData = res.data.goods
      this.total = res.data.total
      console.log(res.data)
    },
    handleSizeChange(newPageSize) {
      this.queryInf.pagesize = newPageSize
      this.getGoodsList()
    },
    handleCurrentChange(newPageNum) {
      this.queryInf.pagenum = newPageNum
      this.getGoodsList()
    },
    goAddPage() {
      this.$router.push('/goods/add')
    },
  },
  computed: {
    // 时间转换
    dateFormat() {
      return function (originVal) {
        const dt = new Date(originVal)
        const y = dt.getFullYear()
        const m = (dt.getMonth() + 1 + '').padStart(2, '0')
        const d = (dt.getDate() + '').padStart(2, '0')
        const hh = (dt.getHours() + '').padStart(2, '0')
        const mm = (dt.getMinutes() + '').padStart(2, '0')
        const ss = (dt.getSeconds() + '').padStart(2, '0')

        return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
      }
    },
  },
}
</script>

<style lang="less" scoped>
</style>

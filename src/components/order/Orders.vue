<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-table :data="orderList" border style="width: 100%" class="mg-b-15">
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="order_number" label="订单编号" width="250">
          </el-table-column>
          <el-table-column prop="order_price" label="订单价格">
          </el-table-column>
          <el-table-column label="是否付款" prop="pay_status">
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.pay_status === '1'"
                >已付款</el-tag
              >
              <el-tag type="danger" v-else>未付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_send" label="是否发货"> </el-table-column>
          <el-table-column prop="create_time" label="下单时间" width="250">
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template>
              <!-- 修改地址按钮 -->
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditLocationDialog"
              ></el-button>
              <!-- 查询位置按钮 -->
              <el-button
                type="success"
                icon="el-icon-location"
                size="mini"
                @click="showLocationDialog"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>

      <el-row>
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
    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editLocationDialogVisible"
      @close="handleEditLocationDialogClose"
      width="50%"
    >
      <el-form
        :model="editLocationForm"
        :rules="editLocationFormrules"
        ref="editLocationFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="editLocationForm.address1"
            :options="citydata"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input
            v-model="editLocationForm.address2"
          ></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editLocationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editLocationDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 查看物流进度详情 -->
    <el-dialog
      title="物流进度 "
      :visible.sync="lookLocationDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(location, index) in locationInfo"
          :key="index"
          :timestamp="location.time"
        >
          {{ location.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="lookLocationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="lookLocationDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata.js'

export default {
  created() {
    this.getOrderList()
  },
  data() {
    return {
      orderList: [],
      orderForm: {
        query: '',
        pagenum: 1,
        pagesize: 10,
        user_id: '',
        pay_status: '0',
        is_send: '否',
        order_fapiao_title: [],
        order_fapiao_company: '',
        order_fapiao_content: '',
        consignee_addr: '',
      },
      editLocationDialogVisible: false,
      queryInf: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      editLocationForm: {
        address1: [],
        address2: '',
      },
      editLocationFormrules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      },
      citydata,
      lookLocationDialogVisible: false,
      locationInfo: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: '',
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context:
            '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: '',
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: '',
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context:
            '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: '',
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: '',
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: '',
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: '',
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: '',
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: '',
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: '',
        },
      ],
    }
  },
  methods: {
    //   获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInf,
      })
      res.data.goods.forEach((item) => {
        item.create_time = this.dateFormat(item.create_time)
        item.update_time = this.dateFormat(item.update_time)
      })
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    handleSizeChange(newSize) {
      this.queryInf.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newNum) {
      this.queryInf.pagenum = newNum
      this.getOrderList()
    },
    showEditLocationDialog() {
      this.editLocationDialogVisible = true
    },
    handleEditLocationDialogClose() {
      this.$refs.editLocationFormRef.resetFields()
    },
    async showLocationDialog() {
      //   const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      //   if (res.meta.status !== 200) {
      //     return this.$message.error('获取物流信息失败！')
      //   }
      //   this.locationInfo = res.data
      this.lookLocationDialogVisible = true
    },
  },
  computed: {
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

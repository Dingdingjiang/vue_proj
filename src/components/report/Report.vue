<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div id="main" style="width: 600px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  created() {},
  async mounted() {
    var myChart = echarts.init(document.getElementById('main'))

    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取图标数据失败！')
    }
    myChart.setOption(res.data)
  },
  data() {
    return {
      options: {},
    }
  },
  methods: {
    async getLineData() {
      const { data: res } = await this.$http.get('reports/type/1')
      console.log(res)
      this.options = res.data
    },
  },
  computed: {},
}
</script>

<style lang="less" scoped>
</style>

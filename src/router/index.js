import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/User.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Goods from '../components/goods/Goods.vue'
import Categories from '../components/goods/Categories.vue'
import Params from '../components/goods/Params.vue'
import AddGoodsForm from '../components/goods/AddGoodForm.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/goods', component: Goods },
      { path: '/categories', component: Categories },
      { path: '/params', component: Params },
      { path: '/goods/add', component: AddGoodsForm },

    ]
  }

]

const router = new VueRouter({
  routes
})
// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login')
  next()
})
export default router

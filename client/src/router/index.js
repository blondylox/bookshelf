import { createRouter, createWebHistory } from "vue-router"
import Catalog from "../views/Catalog.vue"
import Book from "../views/Book.vue"
import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import Profile from "../views/Profile.vue"
// import Seller from "../views/Seller.vue"
import Cart from "../views/Cart.vue"

const routes = [
  { path: "/", component: Catalog },
  { path: "/book/:id", component: Book },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/profile", component: Profile },
  // { path: "/seller", component: Seller },
  { path: "/cart", component: Cart }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

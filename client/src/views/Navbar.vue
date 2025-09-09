<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const user = ref(null)
const router = useRouter()

onMounted(() => {
  const u = localStorage.getItem("user")
  if (u) user.value = JSON.parse(u)
})

function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  router.push("/login")
}
</script>

<template>
  <nav class="navbar">
    <router-link to="/">Каталог</router-link>

    <div class="nav-right">
      <!-- Корзина только у покупателя -->
      <router-link v-if="user?.role === 'buyer'" to="/cart">🛒 Корзина</router-link>

      <!-- Профиль доступен всем -->
      <router-link v-if="user" to="/profile">Профиль</router-link>

      <button v-if="user" @click="logout">Выйти</button>

      <template v-else>
        <router-link to="/login">Войти</router-link>
        <router-link to="/register">Регистрация</router-link>
      </template>
    </div>
  </nav>
</template>

<style>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #007bff;
  color: white;
  padding: 12px 20px;
  z-index: 1000;
}
.navbar a {
  color: white;
  margin-right: 15px;
  text-decoration: none;
}
.navbar .nav-right {
  display: flex;
  gap: 10px;
}
.navbar button {
  background: red;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}
</style>

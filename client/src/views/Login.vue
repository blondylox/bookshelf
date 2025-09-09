<script setup>
import { ref } from "vue"

const login = ref("")
const password = ref("")
const error = ref("")

async function submit() {
  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: login.value, password: password.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Ошибка входа")

    // сохраняем и токен, и юзера
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))

    window.location.href = "/"
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="auth-page">
    <h1>Вход</h1>
    <form @submit.prevent="submit">
      <input v-model="login" placeholder="Логин" />
      <input v-model="password" type="password" placeholder="Пароль" />
      <button type="submit">Войти</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style>
.auth-page {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fafafa;
}
.auth-page h1 {
  text-align: center;
  margin-bottom: 20px;
}
.auth-page form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.auth-page input,
.auth-page button {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #aaa;
  border-radius: 6px;
}
.auth-page button {
  background: #007bff;
  color: white;
  cursor: pointer;
}
.auth-page .error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>

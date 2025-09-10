<script setup>
import { ref } from "vue"

const login = ref("")
const email = ref("")
const password = ref("")
const name = ref("")
const error = ref("")

async function submit() {
  try {
    const res = await fetch("https://bookshelf-rq6q.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: login.value,
        email: email.value,
        password: password.value,
        name: name.value
      })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Ошибка регистрации")

    localStorage.setItem("token", data.token)
    window.location.href = "/"
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="auth-page">
    <h1>Регистрация</h1>
    <form @submit.prevent="submit">
      <input v-model="login" placeholder="Логин" />
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Пароль" />
      <input v-model="name" placeholder="Имя" />
      <button type="submit">Зарегистрироваться</button>
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
  background: #28a745;
  color: white;
  cursor: pointer;
}

.auth-page .error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>

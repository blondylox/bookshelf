<template>
  <header class="header">
    <nav class="nav-left">
      <router-link to="/">Каталог</router-link>
      <router-link to="/seller">Продавец</router-link>
      <router-link to="/profile">Профиль</router-link>
    </nav>
    <nav class="nav-right">
      <router-link to="/login">Вход</router-link>
      <router-link to="/register">Регистрация</router-link>
    </nav>
  </header>
</template>

<style>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
}

nav {
  display: flex;
  gap: 20px;
}

nav a {
  color: white;
  text-decoration: none;
}

nav a.router-link-active {
  font-weight: bold;
}
</style>

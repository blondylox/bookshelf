<script setup>
import { ref, onMounted } from "vue"

const cart = ref([])

async function loadCart() {
  const token = localStorage.getItem("token")
  if (!token) return

  const res = await fetch("https://bookshelf-rq6q.onrender.com/api/cart", {
    headers: { "Authorization": "Bearer " + token }
  })
  cart.value = await res.json()
}

async function removeItem(id) {
  const token = localStorage.getItem("token")
  await fetch(`https://bookshelf-rq6q.onrender.com/api/cart/${id}`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  })
  await loadCart()
}

async function checkout() {
  const token = localStorage.getItem("token")
  const res = await fetch("https://bookshelf-rq6q.onrender.com/api/cart/checkout", {
    method: "POST",
    headers: { "Authorization": "Bearer " + token }
  })
  if (res.ok) {
    alert("✅ Заказ оформлен!")
    cart.value = []
  } else {
    const data = await res.json()
    alert("Ошибка: " + data.error)
  }
}

onMounted(loadCart)
</script>

<template>
  <div class="cart-page">
    <h1>🛒 Моя корзина</h1>

    <div v-if="cart.length === 0">Корзина пуста</div>

    <ul v-else>
      <li v-for="item in cart" :key="item.id">
        {{ item.book.title }} × {{ item.qty }} = {{ item.book.price * item.qty }} ₽
        <button @click="removeItem(item.id)">Удалить</button>
      </li>
    </ul>

    <p v-if="cart.length > 0"><b>Итого:</b>
      {{ cart.reduce((sum, it) => sum + it.book.price * it.qty, 0) }} ₽
    </p>

    <button v-if="cart.length > 0" @click="checkout">Оформить заказ</button>
  </div>
</template>

<style>
.cart-page {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fafafa;
}
.cart-page ul {
  list-style: none;
  padding: 0;
}
.cart-page li {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  padding: 6px 0;
  border-bottom: 1px solid #ddd;
}
.cart-page button {
  margin-left: 12px;
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid #aaa;
  border-radius: 4px;
  cursor: pointer;
}
</style>

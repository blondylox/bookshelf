<script setup>
import { ref, onMounted } from "vue"

const user = ref(null)
const orders = ref([])

async function loadOrders() {
  const token = localStorage.getItem("token")
  if (!token) return

  const u = JSON.parse(localStorage.getItem("user"))
  user.value = u

  const url =
    u.role === "seller" || u.role === "admin"
      ? "http://localhost:3000/api/orders"
      : "http://localhost:3000/api/orders/my"

  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  })
  orders.value = await res.json()
}

async function cancelOrder(orderId) {
  const token = localStorage.getItem("token")
  if (!token) return

  const res = await fetch(
    `http://localhost:3000/api/orders/${orderId}/cancel`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  )

  if (!res.ok) {
    const err = await res.json()
    alert("Ошибка: " + (err.error || "не удалось отменить заказ"))
    return
  }

  await loadOrders()
}

onMounted(loadOrders)
</script>

<template>
  <div class="profile-page">
    <h1>Профиль: {{ user?.name }}</h1>
    <p><b>Логин:</b> {{ user?.login }}</p>
    <p><b>Роль:</b> {{ user?.role }}</p>

    <h2 v-if="user?.role === 'buyer'">Мои заказы</h2>
    <h2 v-else>Заказы покупателей</h2>

    <div v-if="orders.length === 0">Заказов пока нет</div>
    <ul>
      <li v-for="o in orders" :key="o.id" class="order-item">
        <p>
          Заказ №{{ o.id }} —
          <b>{{ o.status }}</b> —
          {{ new Date(o.createdAt).toLocaleString() }}
        </p>

        <ul>
          <li v-for="it in o.items" :key="it.id">
            {{ it.book.title }} × {{ it.qty }} =
            {{ it.price * it.qty }}₽
          </li>
        </ul>

        <p><b>Итого:</b> {{ o.items.reduce((s, it) => s + it.price * it.qty, 0) }} ₽</p>

        <!-- Кнопка отмены только у покупателя -->
        <button
          v-if="user?.role === 'buyer' && o.status === 'pending'"
          @click="cancelOrder(o.id)"
        >
          ❌ Отменить заказ
        </button>

        <!-- Продавец/админ видят покупателя -->
        <p v-if="user?.role !== 'buyer'">
          <b>Покупатель:</b> {{ o.user?.login }}
        </p>
      </li>
    </ul>
  </div>
</template>

<style>
.order-item {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.order-item button {
  margin-top: 10px;
  padding: 8px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.order-item button:hover {
  background: #c82333;
}
</style>

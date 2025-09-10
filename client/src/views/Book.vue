<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const book = ref(null)
const qty = ref(1)
const message = ref("")
const user = ref(null)

async function loadBook() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books/${route.params.id}`)
  book.value = await res.json()
}

async function buyBook() {
  const token = localStorage.getItem("token")
  if (!token) {
    message.value = "Сначала войдите в систему"
    return
  }

  const u = JSON.parse(localStorage.getItem("user"))
  user.value = u
  if (u.role !== "buyer") {
    message.value = "Купить могут только покупатели"
    return
  }

  try {
    const res = await fetch("https://bookshelf-rq6q.onrender.com/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        items: [
          { bookId: book.value.id, qty: qty.value }
        ],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Ошибка заказа")

    message.value = "✅ Заказ создан!"
  } catch (e) {
    message.value = e.message
  }
}

onMounted(() => {
  loadBook()
  const u = localStorage.getItem("user")
  if (u) user.value = JSON.parse(u)
})
</script>

<template>
  <div v-if="book" class="book-page">
    <div class="book-header">
      <!-- основная обложка -->
      <img
        v-if="book.images?.length"
        :src="book.images[0].url"
        alt="Обложка"
        class="book-cover"
      />

      <!-- информация о книге -->
      <div class="book-info">
        <h1>{{ book.title }}</h1>
        <p><b>Описание:</b> {{ book.description }}</p>
        <p><b>Цена:</b> {{ book.price }} ₽</p>
        <p><b>Издательство:</b> {{ book.publisher?.name }}</p>

        <!-- жанры -->
        <p v-if="book.genres?.length">
          <b>Жанры:</b>
          <span
            v-for="g in book.genres"
            :key="g.genre.id"
            class="genre-tag"
          >
            {{ g.genre.name }}
          </span>
        </p>

        <!-- блок покупки -->
        <div v-if="user?.role === 'buyer'" class="buy-block">
          <input type="number" v-model="qty" min="1" />
          <button @click="buyBook">Купить</button>
        </div>
        <p v-if="message" class="message">{{ message }}</p>
      </div>
    </div>

    <!-- миниатюры -->
    <div class="thumbnails" v-if="book.images?.length > 1">
      <img
        v-for="img in book.images.slice(1)"
        :key="img.id"
        :src="img.url"
        alt="Доп. обложка"
      />
    </div>
  </div>
</template>

<style>
.book-page {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
  text-align: left;
}

.book-header {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.book-cover {
  width: 260px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.2);
}

.book-info {
  flex: 1;
}

.genre-tag {
  display: inline-block;
  background: #f0f0f0;
  padding: 3px 8px;
  margin: 0 5px 5px 0;
  border-radius: 6px;
  font-size: 14px;
}

.buy-block {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.buy-block input {
  width: 60px;
  padding: 6px;
}

.buy-block button {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.buy-block button:hover {
  background: #218838;
}

.message {
  margin-top: 10px;
  font-weight: bold;
}
</style>

<script setup> 
import { ref, onMounted } from "vue"

const books = ref([])
const query = ref("")
const genre = ref("")
const publisher = ref("")
const sort = ref("")
const user = ref(null)

const genres = ref([])
const publishers = ref([])

async function loadBooks() {
  let url = "https://bookshelf-rq6q.onrender.com/api/books"
  if (query.value) url += `q=${query.value}&`
  if (genre.value) url += `genre=${genre.value}&`
  if (publisher.value) url += `publisher=${publisher.value}&`
  if (sort.value) url += `sort=${sort.value}`

  const res = await fetch(url)
  const data = await res.json()
  books.value = data.items || data
}

async function loadFilters() {
  const resGenres = await fetch("http://localhost:3000/api/genres")
  genres.value = await resGenres.json()

  const resPublishers = await fetch("http://localhost:3000/api/publishers")
  publishers.value = await resPublishers.json()
}

async function createOrder(bookId) {
  const token = localStorage.getItem("token")
  if (!token) {
    alert("Нужно войти как покупатель")
    return
  }

  const res = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ items: [{ bookId, qty: 1 }] })
  })

  if (res.ok) {
    alert("Заказ создан!")
  } else {
    const data = await res.json()
    alert("Ошибка: " + (data.error || "не удалось создать заказ"))
  }
}

onMounted(() => {
  loadBooks()
  loadFilters()
  const u = localStorage.getItem("user")
  if (u) user.value = JSON.parse(u)
})
</script>

<template>
  <div class="catalog">
    <!-- Поиск и фильтры -->
    <div class="search-bar">
      <input v-model="query" @keyup.enter="loadBooks" placeholder="🔍 Поиск..." />
      <button @click="loadBooks">Найти</button>

      <select v-model="genre">
        <option value="">Все жанры</option>
        <option v-for="g in genres" :key="g.id" :value="g.name">{{ g.name }}</option>
      </select>

      <select v-model="publisher">
        <option value="">Все издательства</option>
        <option v-for="p in publishers" :key="p.id" :value="p.name">{{ p.name }}</option>
      </select>

      <select v-model="sort">
        <option value="">Без сортировки</option>
        <option value="price_asc">Цена ↑</option>
        <option value="price_desc">Цена ↓</option>
        <option value="title_asc">Название</option>
      </select>

      <button @click="loadBooks">Применить</button>
    </div>

    <!-- Список книг -->
    <div v-if="books.length > 0" class="grid">
      <div v-for="book in books" :key="book.id" class="card">
        <img 
          v-if="book.images && book.images.length > 0" 
          :src="book.images[0].url" 
          alt="Обложка" 
          class="cover"
        />
        <div v-else class="no-cover">Без обложки</div>

        <h3>{{ book.title }}</h3>
        <p v-if="book.description">{{ book.description }}</p>
        <p><b>{{ book.price }} ₽</b></p>
        <router-link :to="`/book/${book.id}`">Подробнее</router-link>

        <!-- кнопка для покупателя -->
        <button 
          v-if="user?.role === 'buyer'" 
          @click="createOrder(book.id)">
          Купить
        </button>
      </div>
    </div>

    <div v-else class="no-results">Ничего не найдено</div>
  </div>
</template>

<style>
.catalog {
  padding: 80px 20px 20px; /* меньше отступ сверху */
}

.search-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 30px;
  max-width: 1000px;
}

.search-bar input {
  flex: 3; 
  padding: 12px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.search-bar select, 
.search-bar button {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #aaa;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
  text-align: center;
}

.cover {
  max-width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.no-cover {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  border-radius: 4px;
  font-size: 20px;
  margin-bottom: 10px;
}

.no-results {
  text-align: center;
  font-size: 18px;
  color: #777;
  margin-top: 40px;
}
</style>

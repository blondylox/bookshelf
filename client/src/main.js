import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'   // добавили импорт

const app = createApp(App)

app.use(router)  // подключили роутер
app.mount('#app')
    
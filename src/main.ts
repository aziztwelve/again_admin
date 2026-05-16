import {createApp} from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import axiosPlugin from "./plugins/axios"

import store from './store'
import Cookies from 'js-cookie'

import './assets/css/tailwind.css'
import './assets/css/main.css'

import './store/modules/auth/subscriber.js';

const access_token = Cookies.get('access_token');
import {startNotificationsPolling} from './notifications-poller'
import {assetPath} from '@/utils/assetPath'
import {createEchoPlugin} from '@/plugins/echoPlugin'
import {useStatusFunctions} from "@/composables/useStatusFunctions";


store.dispatch('auth/attempt', access_token)
    .then(() => {
        const app = createApp(App)
            .use(store)
            .use(router)
            .use(axiosPlugin)

        app.config.globalProperties.$assetPath = assetPath

        // Инициализация Echo после того как axios.defaults (withCredentials) установлен
        import('./echo') // src/echo.js
            .then(() => {
                app.mount('#app')
                startNotificationsPolling()

                app.use(createEchoPlugin())

            })
            .catch(err => {
                console.error('Echo init failed:', err)
                // монтируем приложение даже если Echo не поднялся
                app.mount('#app')
                startNotificationsPolling()
            })

        useStatusFunctions().getAllStatuses()



    })

    .catch(() => {
        // В случае ошибки авторизации — всё равно монтируем и пытаемся инициализировать Echo
        const app = createApp(App)
            .use(store)
            .use(router)
            .use(axiosPlugin)

        import('./echo').finally(() => {
            app.mount('#app')
            startNotificationsPolling()
        })
    });
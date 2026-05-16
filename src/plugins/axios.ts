// plugins/axios.ts
import axios from "axios";
import { App } from "vue";

axios.defaults.baseURL = process.env.VUE_APP_BASE_URL
axios.defaults.withCredentials = true;

export default {
    install(app: App) {
        app.config.globalProperties.$axios = axios;
        // Если хочешь, можно добавить provide/inject
        app.provide('axios', axios);
    }
}

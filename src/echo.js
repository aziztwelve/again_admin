import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import Cookies from "js-cookie";

window.Pusher = Pusher;

const REVERB_KEY = process.env.VUE_APP_REVERB_APP_KEY || '';
const REVERB_HOST = process.env.VUE_APP_REVERB_HOST || window.location.hostname;
const REVERB_PORT = Number(process.env.VUE_APP_REVERB_PORT || 443);
const REVERB_SCHEME = process.env.VUE_APP_REVERB_SCHEME || 'wss';
const API_BASE = (process.env.VUE_APP_API_BASE_URL || '').replace(/\/$/, '');

const authEndpoint = API_BASE ? `${API_BASE}/broadcasting/auth` : '/broadcasting/auth';

// Правильно: транспорты всегда ['ws', 'wss'], а forceTLS зависит от схемы
const enabledTransports = ['ws', 'wss'];
const forceTLS = REVERB_SCHEME === 'wss';

// Включаем логирование Pusher для диагностики
Pusher.logToConsole = process.env.NODE_ENV !== 'production';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: REVERB_KEY,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT,
    wssPort: REVERB_PORT,
    forceTLS: forceTLS,
    encrypted: forceTLS,
    enabledTransports: enabledTransports,
    disableStats: true,
    authEndpoint: authEndpoint,
    // Динамическое получение токена при каждом auth-запросе
    auth: {
        headers: {},
    },
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                const token = Cookies.get('access_token');
                if (!token) {
                    callback(new Error('No access token'), null);
                    return;
                }

                fetch(authEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Auth failed: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    callback(null, data);
                })
                .catch(error => {
                    console.error(`Echo auth error for ${channel.name}:`, error);
                    callback(error, null);
                });
            },
        };
    },
});

console.log('Echo instance created:', window.Echo);

export default window.Echo;
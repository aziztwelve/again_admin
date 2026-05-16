import {onMounted, onBeforeUnmount, ref} from 'vue';
import {useStore} from 'vuex';

interface EchoListenerOptions {
    channel: string;
    event: string;
    onMessage: (payload: any) => void;
    onError?: (error: any) => void;
    isPrivate?: boolean;
}

// Глобальный трекер активных подписок
const activeSubscriptions = new Map<string, boolean>();

export function useEchoListener(options: EchoListenerOptions) {
    const store = useStore();
    const subscriptionKey = `${options.channel}:${options.event}`;
    const isSubscribed = ref(false);

    onMounted(() => {
        // Проверяем, нет ли уже активной подписки
        if (activeSubscriptions.has(subscriptionKey) && activeSubscriptions.get(subscriptionKey)) {
            console.warn(`Подписка на ${subscriptionKey} уже активна`);
            isSubscribed.value = true;
            return;
        }

        if (!(window as any).Echo) {
            console.warn('Echo not available');
            return;
        }

        try {
            const channelMethod = options.isPrivate ? 'private' : 'channel';

            (window as any).Echo[channelMethod](options.channel)
                .listen(options.event, async (payload: any) => {
                    try {
                        await options.onMessage(payload);
                    } catch (error) {
                        console.error(`Ошибка при обработке события ${options.event}:`, error);
                    }
                })
                .error((error: any) => {
                    console.error(`Ошибка подписки на ${subscriptionKey}:`, error);
                    if (options.onError) {
                        options.onError(error);
                    }
                });

            activeSubscriptions.set(subscriptionKey, true);
            isSubscribed.value = true;
        } catch (error) {
            console.error(`Ошибка при создании подписки на ${subscriptionKey}:`, error);
        }
    });

    onBeforeUnmount(() => {
        if ((window as any).Echo && activeSubscriptions.get(subscriptionKey)) {
            try {
                (window as any).Echo.leave(options.channel);
                activeSubscriptions.set(subscriptionKey, false);
                isSubscribed.value = false;
            } catch (error) {
                console.error(`Ошибка при отписке от ${subscriptionKey}:`, error);
            }
        }
    });

    return {
        isSubscribed
    };
}
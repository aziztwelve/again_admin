import {App} from 'vue'
import {ECHO_CHANNELS, ECHO_EVENTS} from "@/config/echoConfig";


interface EchoChannel {
    channel: string
    event: string
    isPrivate?: boolean
    onMessage: (payload: any) => void | Promise<void>
    onError?: (error: any) => void
}

// Трекер активных подписок
const activeSubscriptions = new Map<string, boolean>()

export function createEchoPlugin() {


    const channels: EchoChannel[] = [
        // {
        //     channel: ECHO_CHANNELS.ADMIN_NOTIFICATIONS,
        //     event: ECHO_EVENTS.CONVERSATION_UPDATED,
        //     isPrivate: true,
        //     onMessage: async (payload: any) => {
        //
        //
        //     },
        //     onError: (error: any) => {
        //         console.error('❌ Ошибка подписки:', error)
        //     }
        // }
    ]

    return {
        install(app: App) {

            if (!(window as any).Echo) {
                console.log('⚠️ Echo не доступен')
                return
            }

            // Инициализируем все подписки СРАЗУ (без onMounted)
            channels.forEach((channelConfig) => {
                const subscriptionKey = `${channelConfig.channel}:${channelConfig.event}`

                // Проверяем не подписаны ли уже
                if (activeSubscriptions.has(subscriptionKey) && activeSubscriptions.get(subscriptionKey)) {
                    console.warn(`⚠️ Подписка на ${subscriptionKey} уже активна`)
                    return
                }

                try {
                    const channelMethod = channelConfig.isPrivate ?? true ? 'private' : 'channel'


                    ;(window as any).Echo[channelMethod](channelConfig.channel)
                        .listen(channelConfig.event, async (payload: any) => {
                            try {
                                await channelConfig.onMessage(payload)

                            } catch (error) {
                                console.error(`❌ Ошибка обработки события ${subscriptionKey}:`, error)
                            }
                        })
                        .error((error: any) => {
                            console.error(`❌ Ошибка подписки на ${subscriptionKey}:`, error)
                            if (channelConfig.onError) {
                                channelConfig.onError(error)
                            }
                        })

                    activeSubscriptions.set(subscriptionKey, true)


                } catch (error) {
                    console.error(`❌ Ошибка при создании подписки на ${subscriptionKey}:`, error)
                }
            })

        }
    }
}
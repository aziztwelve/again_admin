
import { ref, computed } from 'vue'
import type { GiftCard, GiftCardListResponse, GetGiftCardsParams } from '@/features/gift-card/types'
import { useGiftCards } from '@/features/gift-card/composables/useGiftCards'

// Глобальный кэш для разных комбинаций параметров
const cache = new Map<string, {
    data: GiftCard[]
    meta: any
    timestamp: number
}>()

const isLoading = ref(false)
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

export function useGiftCardsCache() {
    const { getGiftCards, sending } = useGiftCards()

    /**
     * Генерирует уникальный ключ кэша на основе параметров
     */
    const getCacheKey = (params?: GetGiftCardsParams): string => {
        if (!params) return 'default'

        const cleanParams = Object.fromEntries(
            Object.entries(params)
                .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
                .sort(([a], [b]) => a.localeCompare(b)) // Сортируем для консистентности
        )

        return JSON.stringify(cleanParams)
    }

    /**
     * Проверяет, актуален ли кэш
     */
    const isCacheValid = (cacheKey: string): boolean => {
        const cached = cache.get(cacheKey)
        if (!cached) return false

        const now = Date.now()
        return (now - cached.timestamp) < CACHE_DURATION
    }

    /**
     * Загружает подарочные карты с кэшированием
     */
    const loadGiftCards = async (
        params?: GetGiftCardsParams,
        forceRefresh = false
    ): Promise<GiftCardListResponse | undefined> => {
        const cacheKey = getCacheKey(params)

        // Если кэш валиден и не требуется принудительное обновление
        if (!forceRefresh && isCacheValid(cacheKey)) {
            const cached = cache.get(cacheKey)!
            return {
                data: cached.data,
                meta: cached.meta
            }
        }

        // Если уже идёт загрузка, ждём
        if (isLoading.value) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!isLoading.value) {
                        clearInterval(checkInterval)
                        const cached = cache.get(cacheKey)
                        resolve(cached ? {
                            data: cached.data,
                            meta: cached.meta
                        } : undefined)
                    }
                }, 100)
            })
        }

        isLoading.value = true

        try {
            const response = await getGiftCards(params)

            if (response) {
                // Сохраняем в кэш
                cache.set(cacheKey, {
                    data: response.data,
                    meta: response.meta,
                    timestamp: Date.now()
                })
            }

            return response
        } catch (e) {
            console.error('Failed to load gift cards:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Загружает только активные подарочные карты
     */
    const loadActiveGiftCards = async (forceRefresh = false): Promise<GiftCard[]> => {
        const response = await loadGiftCards({ status: 'active' }, forceRefresh)
        return response?.data ?? []
    }

    /**
     * Загружает карты по статусу
     */
    const loadGiftCardsByStatus = async (
        status: 'inactive' | 'active' | 'used' | 'cancelled',
        forceRefresh = false
    ): Promise<GiftCard[]> => {
        const response = await loadGiftCards({ status }, forceRefresh)
        return response?.data ?? []
    }

    /**
     * Загружает все подарочные карты без пагинации (для селектов)
     */
    const loadAllGiftCards = async (forceRefresh = false): Promise<GiftCard[]> => {
        const response = await loadGiftCards({ per_page: 1000 }, forceRefresh)
        return response?.data ?? []
    }

    /**
     * Инвалидирует кэш (очищает)
     */
    const invalidateCache = (params?: GetGiftCardsParams) => {
        if (params) {
            const cacheKey = getCacheKey(params)
            cache.delete(cacheKey)
        } else {
            // Очищаем весь кэш
            cache.clear()
        }
    }

    /**
     * Обновляет конкретную подарочную карту в кэше
     */
    const updateGiftCardInCache = (updatedGiftCard: GiftCard) => {
        cache.forEach((cached, key) => {
            const index = cached.data.findIndex(c => c.id === updatedGiftCard.id)
            if (index !== -1) {
                cached.data[index] = updatedGiftCard
            }
        })
    }

    /**
     * Удаляет подарочную карту из кэша
     */
    const removeGiftCardFromCache = (giftCardId: number) => {
        cache.forEach((cached, key) => {
            cached.data = cached.data.filter(c => c.id !== giftCardId)
        })
    }

    /**
     * Добавляет новую подарочную карту в кэш
     */
    const addGiftCardToCache = (newGiftCard: GiftCard) => {
        cache.forEach((cached, key) => {
            // Добавляем в начало списка
            cached.data.unshift(newGiftCard)
        })
    }

    /**
     * Получить размер кэша
     */
    const getCacheSize = computed(() => cache.size)

    /**
     * Получить информацию о кэше
     */
    const getCacheInfo = () => {
        const info: Array<{ key: string, itemsCount: number, age: number }> = []

        cache.forEach((cached, key) => {
            info.push({
                key,
                itemsCount: cached.data.length,
                age: Math.round((Date.now() - cached.timestamp) / 1000) // в секундах
            })
        })

        return info
    }

    return {
        // Основные методы
        loadGiftCards,
        loadActiveGiftCards,
        loadGiftCardsByStatus,
        loadAllGiftCards,

        // Управление кэшем
        invalidateCache,
        updateGiftCardInCache,
        removeGiftCardFromCache,
        addGiftCardToCache,

        // Состояния
        isLoading,
        sending,
        getCacheSize,
        getCacheInfo
    }
}
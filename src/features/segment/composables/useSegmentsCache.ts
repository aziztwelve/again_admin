import {ref, computed} from 'vue'
import type {Segment, SegmentListResponse} from '@/features/segment/types'
import {useSegments} from '@/features/segment/composables/useSegments'

interface SegmentsCacheParams {
    search?: string
    is_active?: boolean
    per_page?: number
    page?: number
    sort_by?: string
    sort_direction?: 'asc' | 'desc'
}

// Глобальный кэш для разных комбинаций параметров
const cache = new Map<string, {
    data: Segment[]
    meta: any
    timestamp: number
}>()

const isLoading = ref(false)
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

export function useSegmentsCache() {
    const {getSegments, sending} = useSegments()

    /**
     * Генерирует уникальный ключ кэша на основе параметров
     */
    const getCacheKey = (params?: SegmentsCacheParams): string => {
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
     * Загружает сегменты с кэшированием
     */
    const loadSegments = async (
        params?: SegmentsCacheParams,
        forceRefresh = false
    ): Promise<SegmentListResponse | undefined> => {
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
            const response = await getSegments(params)

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
            console.error('Failed to load segments:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Загружает только активные сегменты (удобный хелпер)
     */
    const loadActiveSegments = async (forceRefresh = false): Promise<Segment[]> => {
        const response = await loadSegments({is_active: true}, forceRefresh)
        return response?.data ?? []
    }

    /**
     * Загружает все сегменты без пагинации (для селектов)
     */
    const loadAllSegments = async (forceRefresh = false): Promise<Segment[]> => {
        const response = await loadSegments({per_page: 1000}, forceRefresh)
        return response?.data ?? []
    }

    /**
     * Инвалидирует кэш (очищает)
     */
    const invalidateCache = (params?: SegmentsCacheParams) => {
        if (params) {
            const cacheKey = getCacheKey(params)
            cache.delete(cacheKey)
        } else {
            // Очищаем весь кэш
            cache.clear()
        }
    }

    /**
     * Обновляет конкретный сегмент в кэше
     */
    const updateSegmentInCache = (updatedSegment: Segment) => {
        cache.forEach((cached, key) => {
            const index = cached.data.findIndex(s => s.id === updatedSegment.id)
            if (index !== -1) {
                cached.data[index] = updatedSegment
            }
        })
    }

    /**
     * Удаляет сегмент из кэша
     */
    const removeSegmentFromCache = (segmentId: number) => {
        cache.forEach((cached, key) => {
            cached.data = cached.data.filter(s => s.id !== segmentId)
        })
    }

    /**
     * Добавляет новый сегмент в кэш
     */
    const addSegmentToCache = (newSegment: Segment) => {
        cache.forEach((cached, key) => {
            // Добавляем в начало списка
            cached.data.unshift(newSegment)
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
        const info: Array<{key: string, itemsCount: number, age: number}> = []

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
        loadSegments,
        loadActiveSegments,
        loadAllSegments,

        // Управление кэшем
        invalidateCache,
        updateSegmentInCache,
        removeSegmentFromCache,
        addSegmentToCache,

        // Состояния
        isLoading,
        sending,
        getCacheSize,
        getCacheInfo
    }
}
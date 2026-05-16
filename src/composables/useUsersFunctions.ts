import { ref, computed } from 'vue'
import axios from 'axios'
import { useErrorHandler } from '@/composables/useErrorHandler'

export interface Role {
    id: number | string
    name: string
}

export interface Permission {
    id: number | string
    name: string
}

export interface UsersQuery {
    page?: number
    per_page?: number
    search?: string
}

export interface UsersPage<TUser = any> {
    data: TUser[]
    total: number
    per_page: number
    current_page: number
}

export interface UsersIndexResponse<TUser = any> {
    users: UsersPage<TUser>
    roles?: Role[]
    permissions?: Permission[]
}

const cachedRoles = ref<Role[]>([])
const cachedPermissions = ref<Permission[]>([])


const sending = ref(false)
const progress = ref(0)

export function useUsersFunctions() {
    const errorHandler = useErrorHandler()

    const isBusy = computed(() => sending.value)

    const getUsers = async <TUser = any>(
        query: UsersQuery,
    ): Promise<UsersIndexResponse<TUser> | undefined> => {
        if (sending.value) return
        sending.value = true
        progress.value = 0

        const page = query.page ?? 1
        const perPage = query.per_page ?? 20

        try {
            const { data } = await axios.get(`/users`, {
                params: {
                    page,
                    per_page: perPage,
                    search: query.search || undefined,
                },
            })

            // ожидаем формат как у тебя: res.data.users.data / res.data.users.total
            return data as UsersIndexResponse<TUser>
        } catch (e: any) {
            errorHandler.showError(e)
        } finally {
            sending.value = false
        }
    }

    const getRoles = async (forceRefresh = false): Promise<Role[] | undefined> => {
        if (cachedRoles.value.length && !forceRefresh) return cachedRoles.value
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const { data } = await axios.get('roles')
            cachedRoles.value = data?.roles || []
            return cachedRoles.value
        } catch (e: any) {
            cachedRoles.value = []
            errorHandler.showError(e)
        } finally {
            sending.value = false
        }
    }

    const getPermissions = async (forceRefresh = false): Promise<Permission[] | undefined> => {
        if (cachedPermissions.value.length && !forceRefresh) return cachedPermissions.value
        if (sending.value) return

        sending.value = true
        progress.value = 0

        try {
            const { data } = await axios.get('roles/permissions')
            cachedPermissions.value = data?.permissions || []
            return cachedPermissions.value
        } catch (e: any) {
            cachedPermissions.value = []
            errorHandler.showError(e)
        } finally {
            sending.value = false
        }
    }

    const clearCache = () => {
        cachedRoles.value = []
        cachedPermissions.value = []
    }


    return {
        // flags
        sending,
        progress,
        isBusy,

        // cached
        cachedRoles,
        cachedPermissions,

        // api
        getUsers,
        getRoles,
        getPermissions,

        // utils
        clearCache,
    }
}

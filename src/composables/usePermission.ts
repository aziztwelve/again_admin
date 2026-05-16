import {computed} from 'vue';
import {useStore} from 'vuex';
import {PermissionsData} from "@/constants/PermissionsData";
import {toast} from 'vue-sonner'


export default function usePermission() {
    const store = useStore();

    // const hasPermission = (permissionId: string | number) => {
    //     return  computed(() =>
    //         store.getters['auth/hasPermission'](permissionId)
    //     ).value;
    //
    // };


    const hasPermission = (permissionId: string | number, showToast = true): boolean => {

        const user = store.getters["auth/user"]
        //если supper_admin разрешить все
        if (user?.roles[0]?.id == 1) {
            return true;
        }

        const hasAccess = computed(() =>
            store.getters['auth/hasPermission'](permissionId)
        ).value;


        if (!hasAccess && showToast) {
            toast.error('У вас нет доступа');
        }

        return hasAccess;
    };

    const canManageUsers = computed(() =>
        hasPermission(PermissionsData.MANAGE_USERS)
    );

    return {
        hasPermission,
    };
}
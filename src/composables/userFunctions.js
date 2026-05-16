import axios from "axios";
import {toast} from "vue-sonner";
import {useErrorHandler} from "@/composables/useErrorHandler";
import {useSuccessHandler} from "@/composables/useSuccessHandler";

export function useUserFunctions() {

    const addUser = async (user) => {
        try {
            const res = await axios.post(`/users`, user);
            useSuccessHandler().showSuccess(res);
            return true;
        } catch (e) {
            useErrorHandler().showError(e);
            return false;
        }
    };
    const updateUser = async (user) => {
        if (!user) return
        try {
            const userData = {
                first_name: user.profile?.first_name || '',
                last_name: user.profile?.last_name || '',
                phone: user.profile?.phone?.trim() || null,
                address: user.profile?.address || null,
                email: user.email,
                roles: user.roles?.map(role => role.id) || [],
                permissions: user.permissions?.map(perm => perm.id) || [],
            };

            const res = await axios.put(`/users/${user.id}`, userData);

            if (res.data.user) {
                toast.success(res.data.message || "Пользователь успешно обновлён");
                return res.data.user
            } else {
                toast.error(res.data.message || "Не удалось обновить пользователя");
            }
        } catch (e) {
            if (e.response) {
                toast.error(e.response.data.error || e.response.data.message || "Произошла ошибка при обновлении");
            } else {
                toast.error("Ошибка сети");
            }
            console.error("Error updating user:", e);
        }
    };

    const updateUserProfile = async (profile) => {
        if (!profile) return
        try {

            const userData = {
                first_name: profile?.first_name || '',
                last_name: profile?.last_name || '',
                phone: profile?.phone?.trim() || null,
                address: profile?.address || null,
                email: profile?.email || null,
            };

            const res = await axios.put(`/users/update-profile/${profile.id}`, userData);

            useSuccessHandler().showSuccess(res);
            return res.data.user

        } catch (e) {
            if (e.response) {
                toast.error(e.response.data.error || e.response.data.message || "Произошла ошибка при обновлении");
            } else {
                toast.error("Ошибка сети");
            }
            console.error("Error updating user:", e);
        }
    };

    const changeUser = async (user, loader) => {

        try {
            loader = true;
            if (user.changePass) {
                // Обработка смены пароля
                if (user.password !== user.confirm_password) {
                    toast.error("Пароли не совпадают!");
                    return;
                }

                await axios.put(`/users/${user.id}/update-password`, {
                    old_password: user.old_password,
                    password: user.password,
                    password_confirmation: user.confirm_password,
                });
                toast.success("Пароль успешно изменен");
            } else {
                // Подготовка данных для обновления пользовател

                const userData = {
                    first_name: user.profile?.first_name || '',
                    last_name: user.profile?.last_name || '',
                    phone: user.profile?.phone || null,
                    email: user.email,
                    roles: [user.role],
                    permissions: user.perms,
                };


                await axios.put(`/users/${user.id}`, userData)
                    .then(res => {
                        toast.success(res.data.message || "Данные пользователя обновлены");
                        return true
                    })
            }
        } catch (e) {
            if (e.response) {
                toast.error(e.response.data.error || e.response.data.message || "Произошла ошибка");
            } else {
                toast.error("Ошибка сети");
            }
            console.error("Error updating user:", e);
        } finally {
            loader = false;
        }
    };
    const deleteUser = async (user_id) => {
        console.log(user_id);
        axios
            .delete(`/users/${user_id}`)
            .then((res) => {
                toast.success(res.data.message);
            })
            .catch(err => {
                toast.error(err.data.message);
            })
    };
    const forceDestroy = async (user_id) => {
        console.log(user_id);
        axios
            .delete(`/users/${user_id}/forceDestroy`)
            .then((res) => {
                toast.success(res.data.message);
            })
            .catch(err => {
                toast.error(err.data.message);
            })
    };

    const restoreUser = async (user_id) => {
        axios
            .get(`users/${user_id}/restore`)
            .then(res => {
                toast.success(res.data.message);
            })
            .catch(err => {
                toast.error(err.data.response.data.message);
            })
    };
    const getUsers = async (page, per_page) => {
        return axios
            .get(`users`, {
                params: {
                    page: page,
                    per_page: per_page,
                },
            })
            .then(res => {
                return res.data;
            })
            .catch(err => {
                toast.error(err.data.response.data.message);
            })
    };


    return {
        addUser,
        changeUser,
        deleteUser,
        restoreUser,
        forceDestroy,
        updateUser,
        updateUserProfile,
        getUsers
    };
}

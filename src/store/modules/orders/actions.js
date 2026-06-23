import ordersApi from "@/api/ordersApi.js";

function pickApiErrorMessage(error, fallback) {
  const d = error?.response?.data;
  if (typeof d === "string") return d;
  if (d?.message) return d.message;
  if (d?.error)
    return typeof d.error === "string" ? d.error : d.error?.message || fallback;
  return fallback;
}

export default {
  namespaced: true,

  state: {
    loadStatus: 0,
    status: {},
    error: null,
  },

  getters: {
    isLoading: (state) => state.loadStatus,
    status: (state) => state.status,
    error: (state) => state.error,
  },

  actions: {
    async createOrder({ commit }, data) {
      commit("set_loadStatus", true);
      commit("set_status", null);
      commit("set_error", null);
      try {
        const response = await ordersApi.create(data);
        commit("set_status", response.data.message);
        // Возвращаем тело ответа целиком, чтобы вызывающая сторона могла
        // достать новый order.id (нужно, например, для пост-обработки —
        // ручного применения скидки через /orders/{id}/apply-discount).
        return response.data;
      } catch (error) {
        commit(
          "set_error",
          error.response?.data?.error || "Creating Order Failed, Try Again",
        );
        throw error;
      } finally {
        commit("set_loadStatus", false);
      }
    },

    async deleteOrder({ commit }, id) {
      commit("set_loadStatus", true);
      commit("set_status", null);
      commit("set_error", null);
      try {
        const response = await ordersApi.delete(id);
        commit("set_status", response.data.success);
      } catch (error) {
        commit(
          "set_error",
          error.response?.data?.error || "Deleting Order Failed, Try Again",
        );
      } finally {
        commit("set_loadStatus", false);
      }
    },
  },

  mutations: {
    set_loadStatus(state, loadStatus) {
      state.loadStatus = loadStatus;
    },

    set_status(state, status) {
      state.status = status;
    },

    set_error(state, error) {
      state.error = error;
    },
  },
};

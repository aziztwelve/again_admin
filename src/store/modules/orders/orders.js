import router from '@/router'
import ordersApi from '@/api/ordersApi.js'

export default {
    namespaced: true,

    state: {
        loadStatus: 0,
        orders: null,
        error: null,
    },

    getters: {
        isLoading: state => state.loadStatus,
        orders: state => state.orders,
        hasError: state => !!state.error,
    },

    actions: {
        async getOrders ( { commit, state } ){
            commit( 'set_loadStatus', true );
            commit( 'set_error', null );
            try {
                const response = await ordersApi.getOrders();
                commit( 'set_orders', response.data.orders );
            } catch ( error ) {
                commit( 'set_error', error.response?.data?.message || 'Orders Fetch Failed' );
            } finally {
                commit( 'set_loadStatus', false );
            }
        },
        
    },
    
    mutations: {
        set_loadStatus ( state, loadStatus ){
            state.loadStatus = loadStatus;
        },

        set_orders ( state, orders ){
            state.orders = orders;
        },

        set_error ( state, error ){
            state.error = error;
        },
    }
}
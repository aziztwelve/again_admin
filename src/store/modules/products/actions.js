import productsApi from '@/api/productsApi.js'

export default {
    namespaced: true,

    state: {
        loadStatus: 0,
        status: {},
        error: null,
    },

    getters: {
        isLoading: state => state.loadStatus,
        status: state => state.status,
        error: state => state.error,
    },

    actions: {

        async createProduct ( { commit }, data ){
            commit( 'set_loadStatus', true );
            commit( 'set_status', null );
            commit( 'set_error', null );
            try {
                const response = await productsApi.create( data );
                commit( 'set_status', response.data.message );
            } catch ( error ) {
                commit( 'set_error', error.response?.data?.error || 'Creating Product Failed, Try Again' );
            } finally {
                commit( 'set_loadStatus', false );
            }
        },

        async deleteProduct ( { commit }, id ){
            commit( 'set_loadStatus', true );
            commit( 'set_status', null );
            commit( 'set_error', null );
            try {
                const response = await productsApi.delete( id );
                commit( 'set_status', response.data.success );
            } catch ( error ) {
                commit( 'set_error', error.response?.data?.error || 'Deleting Product Failed, Try Again' );
            } finally {
                commit( 'set_loadStatus', false );
            }
        },

    },
    
    mutations: {
        set_loadStatus ( state, loadStatus ){
            state.loadStatus = loadStatus;
        },

        set_status ( state, status ){
            state.status = status;
        },

        set_error ( state, error ){
            state.error = error;
        },
    }
}
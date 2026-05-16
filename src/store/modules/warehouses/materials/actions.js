import warehousesApi from '@/api/warehousesApi.js'

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
        async createMaterial ( { commit }, data ){
            commit( 'set_loadStatus', true );
            commit( 'set_status', null );
            commit( 'set_error', null );
            try {
                const response = await warehousesApi.createMaterial( data );
                commit( 'set_status', response.data.message );
            } catch ( error ) {
                commit( 'set_error', error.response?.data?.error || 'Creating Material Failed, Try Again' );
            } finally {
                commit( 'set_loadStatus', false );
            }
        },

        async deleteMaterial ( { commit }, id ){
            commit( 'set_loadStatus', true );
            commit( 'set_status', null );
            commit( 'set_error', null );
            try {
                const response = await warehousesApi.deleteMaterial( id );
                commit( 'set_status', response.data.success );
            } catch ( error ) {
                commit( 'set_error', error.response?.data?.error || 'Deleting Material Failed, Try Again' );
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
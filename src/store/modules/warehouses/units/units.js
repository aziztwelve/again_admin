import router from '@/router'
import warehousesApi from '@/api/warehousesApi.js'

export default {
    namespaced: true,

    state: {
        loadStatus: 0,
        units: null,
        error: null,
    },

    getters: {
        isLoading: state => state.loadStatus,
        units: state => state.units,
        hasError: state => !!state.error,
    },

    actions: {
        async getUnits ( { commit, state } ){
            commit( 'set_loadStatus', true );
            commit( 'set_error', null );
            try {
                const response = await warehousesApi.getUnits();
                commit( 'set_units', response.data );
            } catch ( error ) {
                commit( 'set_error', error.response?.data?.message || 'Units Fetch Failed' );
            } finally {
                commit( 'set_loadStatus', false );
            }
        },
        
    },
    
    mutations: {
        set_loadStatus ( state, loadStatus ){
            state.loadStatus = loadStatus;
        },

        set_units ( state, units ){
            state.units = units;
        },

        set_error ( state, error ){
            state.error = error;
        },
    }
}
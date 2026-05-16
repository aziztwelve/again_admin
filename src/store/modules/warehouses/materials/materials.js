import router from '@/router'
import warehousesApi from '@/api/warehousesApi.js'

export default {
    namespaced: true,

    state: {
        loadStatus: 0,
        materials: null,
        error: null,
    },

    getters: {
        isLoading: state => state.loadStatus,
        materials: state => state.materials,
        hasError: state => !!state.error,
    },

    actions: {
        async getMaterials ( { commit, state } ){
            commit( 'set_loadStatus', true );
            commit( 'set_error', null );
            try {
                const response = await warehousesApi.getMaterials();
                commit( 'set_materials', response.data.data );
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

        set_materials ( state, materials ){
            state.materials = materials;
        },

        set_error ( state, error ){
            state.error = error;
        },
    }
}
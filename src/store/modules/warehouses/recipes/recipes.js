import router from '@/router'
import warehousesApi from '@/api/warehousesApi.js'

export default {
    namespaced: true,

    state: {
        loadStatus: 0,
        recipes: null,
        error: null,
    },

    getters: {
        isLoading: state => state.loadStatus,
        recipes: state => state.recipes,
        hasError: state => !!state.error,
    },

    actions: {
        async getRecipes ( { commit, state } ){
            commit( 'set_loadStatus', true );
            commit( 'set_error', null );
            try {
                const response = await warehousesApi.getRecipes();
                commit( 'set_recipes', response.data.data );
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

        set_recipes ( state, recipes ){
            state.recipes = recipes;
        },

        set_error ( state, error ){
            state.error = error;
        },
    }
}
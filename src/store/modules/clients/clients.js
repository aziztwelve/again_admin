import router from '@/router'
import clientsApi from '@/api/clientsApi.js'

export default {
    namespaced: true,

    state: {
        loadStatus: 0,
        clients: null,
        error: null,
    },

    getters: {
        isLoading: state => state.loadStatus,
        clients: state => state.clients,
        hasError: state => !!state.error,
    },

    actions: {
        async getClients ( { commit, state } ){
            commit( 'set_loadStatus', true );
            commit( 'set_error', null );
            try {
                const response = await clientsApi.getClients( );
                commit( 'set_clients', response.data.data );
            } catch ( error ) {
                commit( 'set_error', error.response?.data?.message || 'Products Fetch Failed' );
            } finally {
                commit( 'set_loadStatus', false );
            }
        },
        
    },
    
    mutations: {
        set_loadStatus ( state, loadStatus ){
            state.loadStatus = loadStatus;
        },

        set_clients ( state, clients ){
            state.clients = clients;
        },

        set_error ( state, error ){
            state.error = error;
        },
    }
}
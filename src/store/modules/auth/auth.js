import authApi from '@/api/authApi.js'


export default {
    namespaced: true,

    state: {
        loadStatus: 0,
        access_token: null,
        user: null,
        error: null,
    },

    getters: {
        isLoading: state => state.loadStatus,
        authenticated: state => !!state.access_token && !!state.user,
        user: state => state.user,
        hasError: state => !!state.error,
        permissions: state => state.user?.permissions || [],
        hasPermission: state => (permissionId) => {
            return state.user?.permissions?.includes(permissionId) || false;
        }
    },

    actions: {
        async signIn ( { commit, dispatch }, credentials ){
            commit( 'set_loadStatus', true );
            commit( 'set_error', null );
            try {
                const response = await authApi.signIn( credentials );
                const access_token = response.data.token;
                dispatch( 'attempt', access_token );
            } catch ( error ) {
                commit( 'set_error', error.response?.data?.message || 'Sign in failed' );
            } finally {
                commit( 'set_loadStatus', false );
            }
        },  
        async attempt ({ commit, state }, access_token ){
            
            if ( access_token ){
              commit( 'set_access_token', access_token );
            }

            if ( !state.access_token ){
                return
            }

            try {
                const userResponse = await authApi.getUserInfo();
                commit( 'set_user', userResponse.data );
            } catch (error) {
                commit ( 'set_access_token', null );
                commit ( 'set_user', null );
                commit( 'set_error', 'Failed to fetch user info' );
            }
        },

    },
    
    mutations: {
        set_loadStatus ( state, loadStatus ){
            state.loadStatus = loadStatus;
        },

        set_access_token ( state, access_token ){
            state.access_token = access_token;
        },

        set_user ( state, user ){
            state.user = user;
        },
      
        set_error ( state, error ){
            state.error = error;
        },
    }
}
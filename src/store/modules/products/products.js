import router from '@/router'
import productsApi from '@/api/productsApi.js'

export default {
    namespaced: true,

    state: {
        loadStatus: 0,

        products: null,

        queryParams: {
            per_page: 15,
            page: 1,
        },

        meta: {
            current_page: '',
            per_page: '',
            total_count: '',
            total_pages: '',
        },

        error: null,
    },

    getters: {
        isLoading: state => state.loadStatus,
        products: state => state.products,
        meta: state => state.meta,
        hasError: state => !!state.error,
    },

    actions: {
        async getProducts ( { commit, state } ){
            commit( 'set_loadStatus', true );
            commit( 'set_error', null );
            try {
                const response = await productsApi.getProducts( state.queryParams );
                commit( 'set_products', response.data.data );

                commit( 'set_current_page', response.data.current_page );
                commit( 'set_per_page', response.data.per_page );
                commit( 'set_total_count', response.data.total );
                commit( 'set_total_pages', response.data.last_page );
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

        set_products ( state, products ){
            state.products = products;
        },

        set_current_page( state, current_page ){
            state.meta.current_page = current_page;
        },

        set_per_page( state, per_page ){
            state.meta.per_page = per_page;
        },
        
        set_total_count( state, total_count ){
            state.meta.total_count = total_count;
        },
        
        set_total_pages( state, total_pages ){
            state.meta.total_pages = total_pages;
        },

        set_error ( state, error ){
            state.error = error;
        },
    }
}
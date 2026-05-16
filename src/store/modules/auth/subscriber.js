import store from '@/store'
import axios from 'axios';
import Cookies from 'js-cookie'

store.subscribe ( ( mutation ) => {
    switch ( mutation.type ){
        case 'auth/set_access_token':
            if ( mutation.payload ){
                axios.defaults.headers.common['Accept'] = 'application/json'
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + mutation.payload;
                Cookies.set( 'access_token', mutation.payload, { expires: 1 })
            } else { 
                axios.defaults.headers.common['Authorization'] = null;
                Cookies.remove( 'access_token' )
            }
        break;
    }
})
import axios from 'axios'

class authApi{
    signIn( credentials ) {
        return axios.post( "/admin-login", credentials );
    }

    getUserInfo(){
        return axios.get ( "/admin-user" );
    }

    // postSignOut() {
    //     return axios.post ( "auth/logout" );
    // }
}

export default new authApi();
import axios from 'axios'

class clientsApi{
    
    getClients() {
        return axios.get("/clients");
    }

    getClient(id) {
        return axios.get("/clients/" + id);
    }
    
    create(data) {
        return axios.post("/clients", data);
    }

    update(id, data) {
        return axios.put("/clients/" + id, data);
    }

    delete(id) {
        return axios.delete("/clients/" + id);
    }
    
}

export default new clientsApi();
import axios from 'axios'

class productsApi{
    
    getProducts() {
        return axios.get("/products");
    }

    getProduct(id) {
        return axios.get("/products/" + id);
    }
    
    create(data) {
        return axios.post("/products", data);
    }

    update(id, data) {
        return axios.put("/products/" + id, data);
    }

    delete(id) {
        return axios.delete("/products/" + id);
    }
    
}

export default new productsApi();
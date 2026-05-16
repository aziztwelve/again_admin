import axios from 'axios'

class warehousesApi{

    //Materials Api 
    
    getMaterials() {
        return axios.get("/materials");
    }

    getMaterial(id) {
        return axios.get("/materials/" + id);
    }
    
    createMaterial(data) {
        return axios.post("/materials", data);
    }

    updateMaterial(id, data) {
        return axios.put("/materials/" + id, data);
    }

    deleteMaterial(id) {
        return axios.delete("/materials/" + id);
    }

    //Recipes Api 
    
    getRecipes() {
        return axios.get("/recipes");
    }

    getRecipe(id) {
        return axios.get("/recipes/" + id);
    }
    
    createRecipe(data) {
        return axios.post("/recipes", data);
    }

    updateRecipe(id, data) {
        return axios.put("/recipes/" + id, data);
    }

    deleteRecipe(id) {
        return axios.delete("/recipes/" + id);
    }

    //Units Api

    getUnits() {
        return axios.get("/units");
    }
    
}

export default new warehousesApi();
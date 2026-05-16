import { createStore } from 'vuex'

import authModule from './modules/auth/auth.js';

import materialsModule from './modules/warehouses/materials/materials.js';
import materialModule from './modules/warehouses/materials/material.js';
import materialActionsModule from './modules/warehouses/materials/actions.js';

import recipesModule from './modules/warehouses/recipes/recipes.js';
import recipeModule from './modules/warehouses/recipes/recipe.js';
import recipeActionsModule from './modules/warehouses/recipes/actions.js';

import unitsModule from './modules/warehouses/units/units.js'

import ordersModule from './modules/orders/orders.js';
import orderModule from './modules/orders/order.js';
import orderActionsModule from './modules/orders/actions.js';

import productsModule from './modules/products/products.js';
import productModule from './modules/products/product.js';
import productActionsModule from './modules/products/actions.js';

import clientsModule from './modules/clients/clients.js';
import clientModule from './modules/clients/client.js';
import clientActionsModule from './modules/clients/actions.js';
import notifications from "@/store/modules/notifications";
import tabsModule from "@/store/modules/tabs/tabs";



const store = createStore ({
    modules: {
        auth: authModule, 

        materials: materialsModule,
        material: materialModule,
        materialActions: materialActionsModule,
        
        recipes: recipesModule,
        recipe: recipeModule,
        recipeActions: recipeActionsModule,

        units: unitsModule,

        orders: ordersModule,
        order: orderModule,
        orderActions: orderActionsModule,

        products: productsModule,
        product: productModule, 
        productActions: productActionsModule,
        
        clients: clientsModule,
        client: clientModule, 
        clientActions: clientActionsModule,

        tabs: tabsModule,


        notifications
    }
})

export default store;

import {createRouter, createWebHistory} from 'vue-router'
import store from '@/store'

const routes = [
    {
        path: '/auth',
        name: 'auth',
        component: () => import('../views/AuthView.vue'),
        beforeEnter: (to, from, next) => {
            if (store.getters['auth/authenticated']) {
                const redirectTo = to.query.redirect || '/dashboard';
                return next({path: redirectTo});
            }
            next()
        },
    },

    {
        path: '/auth/logout',
        name: 'logout',
        component: () => import('../views/LogOut.vue'),
    },

    {
        path: '/order/:id/print',
        name: 'orders-print',
        component: () => import('../views/orders/OrderPrint.vue'),
    },

    {
        path: '/',
        name: 'MainView',
        component: () => import('../views/MainView.vue'),
        redirect: '/dashboard',
        children: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: () => import('../views/dashboard/DashboardView.vue'),
            },

            {
                path: '/orders',
                name: 'orders',
                component: () => import('../views/orders/OrdersView.vue'),
                redirect: '/orders/list',
                children: [
                    {
                        path: '/orders/list',
                        name: 'orders-list',
                        component: () => import('../components/orders/list/OrdersList.vue'),
                    },
                    {
                        path: '/order/create',
                        name: 'orders-create',
                        component: () => import('../components/orders/create/OrderCreate.vue'),
                    },
                    {
                        path: '/order/:id',
                        name: 'orders-view',
                        component: () => import('../components/orders/view/OrderView.vue'),
                    },
                    {
                        path: '/orders/tasks',
                        name: 'orders-tasks',
                        component: () => import('../components/orders/tasks'),
                    },
                    {
                        path: '/orders/tasks/create',
                        name: 'orders-tasks-create',
                    },
                ]
            },


            {
                path: 'contact-requests',
                name: 'contact_request',
                component: () => import('../components/contact_request/list/ContactList.vue'),
            },

            {
                path: 'restock-subscriptions',
                name: 'restock_subscription',
                component: () => import('../components/restock_subscription/RestockSubscriptionList.vue'),
            },

            {
                path: '/promotion/abandoned-carts',
                name: 'promotion-abandoned-carts',
                component: () => import('../components/analytics/abandoned-carts/Index.vue'),
            },


            {
                path: '/products',
                name: 'products',
                component: () => import('../views/products/ProductsView.vue'),
                redirect: '/products/list',
                children: [
                    {
                        path: '/products/list',
                        name: 'products-list',
                        component: () => import('../components/products/list/ProductsList.vue'),
                    },
                    {
                        path: '/products/online',
                        name: 'products-online',
                        component: () => import('../components/products/list/online/ProductsList.vue'),
                    },
                    {
                        path: '/products/create',
                        name: 'products-create',
                        component: () => import('../components/products/create/ProductCreate.vue'),
                    },
                    {
                        path: '/product/update/:id',
                        name: 'products-update',
                        component: () => import('../components/products/edit/ProductEdit.vue'),
                    },
                    {
                        path: '/products/import',
                        name: 'products-import',
                        component: () => import('../components/products/import/index.vue'),
                    },
                    {
                        path: '/prices_stock',
                        name: 'prices_stock',
                        component: () => import('../components/price_stock/index.vue'),
                    },
                    {
                        path: '/products/reviews',
                        name: 'products-reviews',
                        component: () => import('../components/products/reviews/index.vue'),
                    },
                ]
            },


            {
                path: '/category',
                name: 'category',
                component: () => import('../views/category/CategoryView.vue'),
                redirect: '/category/list',
                children: [
                    {
                        path: '/category/list',
                        name: 'category-list',
                        component: () => import('../components/category/CategoryList.vue'),
                    },
                ]
            },


            {
                path: '/deliveries',
                name: 'Deliveries',
                component: () => import('../views/deliveries/DeliveriesView.vue'),
            },
            {
                path: '/clients',
                name: 'clients',
                redirect: '/clients/list',
                component: () => import('../views/clients/ClientsView.vue'),
                children: [
                    {
                        path: '/clients/list',
                        name: 'clients-list',
                        component: () => import('../components/clients/Index.vue'),
                    },

                    {
                        path: '/clients/discounts',
                        name: 'clients-discounts',
                        component: () => import('../components/discount/Discount.vue'),
                    },

                    {
                        path: '/clients/:id(\\d+)',
                        name: 'clients-show',
                        component: () => import('../components/clients/Show/Index.vue'),
                        meta: {
                            title: 'Карточка клиента',
                            requiresAuth: true,
                        },
                    },
                ]
            },

            {
                path: '/segments',
                name: 'segments',
                redirect: '/segments/list',
                children: [
                    // Список сегментов
                    {
                        path: 'list',
                        name: 'segments-list',
                        component: () => import('@/features/segment/components/list/index.vue'),
                        meta: {
                            title: 'Сегменты клиентов',
                            requiresAuth: true,
                        }
                    },

                    // Детальный просмотр сегмента
                    {
                        path: ':id',
                        name: 'segments-detail',
                        component: () => import('@/features/segment/components/detail/index.vue'),
                        props: true,
                        meta: {
                            title: 'Детали сегмента',
                            requiresAuth: true,
                        }
                    },
                ]
            },
            {
                path: '/gift-card',
                name: 'gift-card',
                redirect: '/gift-card/list',
                children: [
                    // Список сегментов
                    {
                        path: 'list',
                        name: 'gift-card-list',
                        component: () => import('@/features/gift-card/components/list/index.vue'),
                        meta: {
                            title: 'Подарочные карты',
                            requiresAuth: true,
                        }
                    },

                    // Детальный просмотр сегмента
                    {
                        path: ':id',
                        name: '/gift-card-detail',
                        component: () => import('@/features/gift-card/components/detail/index.vue'),
                        props: true,
                        meta: {
                            title: 'Детали Подарочные карты',
                            requiresAuth: true,
                        }
                    },
                ]
            },

            {
                path: '/integrations',
                name: 'integrations',
                redirect: '/integrations/payments',
                component: () => import('../views/integrations/IntegrationsView.vue'),
                children: [
                    {
                        path: '/integrations/payments',
                        name: 'integrations-payments',
                        component: () => import('../components/integrations/payments/index.vue'),
                    },
                    {
                        path: '/integrations/cashboxes',
                        name: 'integrations-cashboxes',
                        component: () => import('../components/integrations/cashboxes/index.vue'),
                    },
                    {
                        path: '/integrations/delivery',
                        name: 'integrations-delivery',
                        component: () => import('../components/integrations/delivery/index.vue'),
                    },
                    {
                        path: '/integrations/messengers',
                        name: 'integrations-messengers',
                        component: () => import('../components/integrations/messengers/index.vue'),
                    },
                    {
                        path: '/integrations/email',
                        name: 'integrations-email',
                        component: () => import('../components/integrations/email/index.vue'),
                    },
                    {
                        path: '/integrations/moysklad',
                        name: 'integrations-moysklad',
                        component: () => import('../components/integrations/moysklad/MoySklad.vue'),
                    },


                    {
                        path: '/integrations/analytics',
                        name: 'integrations-analytics',
                        component: () => import('../components/integrations/analytics/index.vue'),
                    },

                ]
            },
            {
                path: '/analytics',
                name: 'Analytics',
                redirect: '/analytics/summary',
                component: () => import('../views/analytics/AnalyticsView.vue'),
                children: [
                    {
                        path: '/analytics/summary',
                        name: 'analytics-summary',
                        component: () => import('../components/analytics/summary/index.vue'),

                    },
                    {
                        path: '/analytics/order-sources',
                        name: 'analytics-order-sources',
                        component: () => import('../components/analytics/utm/Index.vue'),
                    }
                ]
            },
            {
                path: '/dialogs',
                name: 'dialogs',
                redirect: '/dialogs/whatsapp',
                component: () => import('../views/dialogs/DialogsView.vue'),
                children: [
                    {
                        path: '/dialogs/chats',
                        name: 'dialogs-chats',
                        component: () => import('../components/dialogs/chats/index.vue'),
                    },
                    // {
                    //     path: '/dialogs/whatsapp',
                    //     name: 'dialogs-whatsapp',
                    //     component: () => import('../components/dialogs/whatsapp/index.vue'),
                    // },
                    // {
                    //     path: '/dialogs/telegram',
                    //        name: 'dialogs-telegram',
                    //     component: () => import('../components/dialogs/telegram/index.vue'),
                    //
                    // }
                ]
            },
            {
                path: '/users',
                name: 'users',
                component: () => import('../views/users/index.vue'),
            },
            {
                path: '/profile',
                name: 'profile',
                redirect: '/user-profile',
                component: () => import('../views/profile/ProfileView.vue'),
                children: [
                    {
                        path: '/user-profile',
                        name: 'user-profile',
                        component: () => import('../components/profile/Index.vue'),
                    },

                ]
            },
            {
                path: '/settings',
                name: 'settings',
                redirect: '/settings',
                component: () => import('../views/settings/SettingsView.vue'),
                children: [
                    {
                        path: '/settings',
                        name: 'settings-layout',
                        component: () => import('../components/settings/index.vue'),
                    },

                    {
                        path: '/settings/home-slider',
                        name: 'settings-home-slider',
                        component: () => import('../components/settings/home_slider/list/SliderList.vue'),
                    }
                ]
            },


            {
                path: '/settings/oto',
                name: 'settings-oto',
                redirect: '/settings/oto/list',
                children: [
                    {
                        path: 'list',
                        name: 'settings-oto-list',
                        component: () => import('@/features/oto-banner/components/list/index.vue'),
                        meta: {
                            title: 'OTO Баннеры',
                            requiresAuth: true,
                        }
                    },
                    {
                        path: ':id',
                        name: 'settings-oto-detail',
                        component: () => import('@/features/oto-banner/components/detail/index.vue'),
                        props: true,
                        meta: {
                            title: 'Детали OTO баннера',
                            requiresAuth: true,
                        }
                    },
                ]
            },


        ],

        beforeEnter: (to, from, next) => {
            if (!store.getters['auth/authenticated']) {
                return next({
                    path: '/auth'
                })
            }
            next()
        }
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router

import {Module} from 'vuex';

export interface Tab {
    title: string;
    tab: string;
    disabled?: boolean;
}

interface DynamicDataPayload {
    tabName: string;
    data: any;
}

interface TabsState {
    activeTab: string;
    tabs: Tab[];
    dynamicData: Record<string, any>;
}

interface RootState {
    // Определи здесь тип root state если нужно
}

const tabsModule: Module<TabsState, RootState> = {
    namespaced: true,

    state: (): TabsState => ({
        dynamicData: {},
        activeTab: 'discount',
        tabs: [],
    }),

    getters: {
        activeTab: (state: TabsState): string => state.activeTab,

        dynamicData: (state: TabsState): Record<string, any> => state.dynamicData,

        getDynamicData: (state: TabsState) => (tabName: string): any => {
            return state.dynamicData[tabName] || null;
        },

        tabs: (state: TabsState): Tab[] => state.tabs,

        isTabDisabled: (state: TabsState) => (tabName: string): boolean => {
            const tab = state.tabs.find(t => t.tab === tabName);
            return tab?.disabled || false;
        },

        getTabByName: (state: TabsState) => (tabName: string): Tab | undefined => {
            return state.tabs.find(t => t.tab === tabName);
        },
    },

    actions: {
        setActiveTab({commit}, tabName: string): void {
            commit('set_activeTab', tabName);
        },

        setDynamicData({commit}, payload: DynamicDataPayload): void {
            commit('set_dynamic_data', payload);
        },
        clearDynamicData({commit}, tabName: string): void {
            commit('clear_dynamic_data', tabName);
        },
        enableTab({commit}, tabName: string): void {
            commit('enable_tab', tabName);
        },

        disableTab({commit}, tabName: string): void {
            commit('disable_tab', tabName);
        },

        updateTabs({commit}, tabs: Tab[]): void {
            commit('set_tabs', tabs);
        },

        toggleTab({commit}, tabName: string): void {
            commit('toggle_tab', tabName);
        },

        initializeTabs({commit}, tabs: Tab[]): void {
            commit('set_tabs', tabs);
        },


    },

    mutations: {
        set_activeTab(state: TabsState, tabName: string): void {
            state.activeTab = tabName;
        },

        set_dynamic_data(state: TabsState, payload: DynamicDataPayload): void {
            state.dynamicData[payload.tabName] = payload.data;
        },

        clear_dynamic_data(state: TabsState, tabName: string): void {
            delete state.dynamicData[tabName];
        },

        set_tabs(state: TabsState, tabs: Tab[]): void {
            state.tabs = tabs;
        },

        enable_tab(state: TabsState, tabName: string): void {
            const tab = state.tabs.find(t => t.tab === tabName);
            if (tab) {
                tab.disabled = false;
            }
        },

        disable_tab(state: TabsState, tabName: string): void {
            const tab = state.tabs.find(t => t.tab === tabName);
            if (tab) {
                tab.disabled = true;
            }
        },

        toggle_tab(state: TabsState, tabName: string): void {
            const tab = state.tabs.find(t => t.tab === tabName);
            if (tab) {
                tab.disabled = !tab.disabled;
            }
        },
    },
};

export default tabsModule;
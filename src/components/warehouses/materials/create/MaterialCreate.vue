<template>
    <div>
        <PageHeading :title="pageTitle"/>
        <div class="mt-10 mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div class="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2">
                <form @submit.prevent="handleCreate">
                    <div class="mt-8">
                        <div class="">
                            <label for="title" class="block text-sm/6 font-medium text-gray-900">Наименование</label>
                            <div class="mt-2">
                                <input v-model="data.title" :disabled="isLoading" id="title" name="title" type="text" autocomplete="title" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 sm:text-sm/6" />
                            </div>
                        </div>
                    </div>
                    <div class="mt-8">
                        <label for="unit" class="block text-sm/6 font-medium text-gray-900">Мера измерения</label>
                            <div class="mt-2 grid grid-cols-1">
                            <select v-model="data.unit_id" id="unit" name="unit" autocomplete="unit" class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                                <option disabled value="">Выберите единицу измерения</option>
                                <option v-for="unit in units" :key="unit.id" :value="unit.id">
                                    {{ unit.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="mt-6 flex items-center justify-end gap-x-6">
                        <button type="submit" :disabled="isLoading" class="rounded-md bg-red-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                            <span v-if="!isLoading">Создать</span>
                            <span v-else>Создание...</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { PhCaretDown } from '@phosphor-icons/vue';

import PageHeading from '@/components/common/PageHeading.vue'

const store = useStore()
const router = useRouter()

const pageTitle = 'Добавить материал';

const data = reactive({
    title: '',
    unit_id: '',
})


const getUnits = () => store.dispatch('units/getUnits')
const units = computed(() => store.getters['units/units'])

const create = (data) => store.dispatch('materialActions/createMaterial', data)

const status = computed(() => store.getters['materialActions/status'])
const error = computed(() => store.getters['materialActions/error'])
const isLoading = computed(() => store.getters['materialActions/isLoading'])

onMounted(() => {
    getUnits();
});

const handleCreate = () => {
    create(data)
}

watch(status, (newValue) => {
    if (newValue) {
        router.push('/warehouses/materials/list')
    }
})

</script>
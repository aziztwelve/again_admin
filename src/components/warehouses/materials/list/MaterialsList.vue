<template>
    <section>
        <PageHeading :title="pageTitle" :create="createLink"/>
        <Loader v-if="isLoading"/>
        <div v-else class="px-4 sm:px-6 lg:px-8">
            <div class="mt-8 flow-root">
                <div v-if="materials && materials.length != 0" class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle">
                        <table class="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">ID</th>
                                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8">Название</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit Name</th>
                                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                                        <span class="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr v-for="material in materials" :key="material?.id">
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3  text-sm text-gray-500">{{ material?.id }}</td>
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">{{ material?.title }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ getUnitName(material?.unit_id) }}</td>
                                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                                        <Dropdown>
                                            <MenuItem v-slot="{ active }">
                                                <a href="#" disabled :class="[active ? 'bg-gray-100 text-gray-900 outline-none' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                    <PhNotePencil :class="[active ? 'text-gray-500' : '', 'mr-3 size-5 text-gray-400']" aria-hidden="true" />
                                                    Edit
                                                </a>
                                            </MenuItem>
                                            <MenuItem v-slot="{ active }">
                                                <a href="#" @click.prevent="toggleDeleteModal(material)" :class="[active ? 'bg-gray-100 text-gray-900 outline-none' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm']">
                                                    <PhTrash :class="[active ? 'text-gray-500' : '', 'mr-3 size-5 text-gray-400']" aria-hidden="true" />
                                                    Delete
                                                </a>
                                            </MenuItem>
                                        </Dropdown>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- <Pagination :currentPage="meta?.current_page" :perPage="meta?.per_page" :totalItems="meta?.total_count" :totalPages="meta?.total_pages" /> -->
                </div>
                <div v-else class="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h3 class="text-3xl font-extrabold text-gray-500 sm:text-4xl">Ничего не найдено</h3>
                </div>
            </div>
        </div>
    </section>
    <Delete :open="isDeleteModalOpen" :materialId="selectedMaterialId" @close="toggleDeleteModal" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

import { MenuItem } from '@headlessui/vue'
import { PhNotePencil, PhTrash } from '@phosphor-icons/vue'

import Delete from '../modals/Delete.vue'
import Loader from '@/components/common/Loader.vue'
import PageHeading from '@/components/common/PageHeading.vue'
import Dropdown from '@/components/common/Dropdown.vue'
import Pagination from '@/components/common/Pagination.vue'

const store = useStore()

const pageTitle = 'Материалы';
const createLink = {
    title: 'Добавить Материал',
    url: '/warehouses/materials/create'
}

const getMaterials = () => store.dispatch('materials/getMaterials')

const materials = computed(() => store.getters['materials/materials'])
const hasError = computed(() => store.getters['materials/hasError'])
const isLoading = computed(() => store.getters['materials/isLoading'])


const getUnits = () => store.dispatch('units/getUnits')

const units = computed(() => store.getters['units/units'])

onMounted(() => {
    getMaterials();
    getUnits();
});

const getUnitName = (unitId) => {
    if (!units.value || !Array.isArray(units.value)) return 'Неизвестная единица';
    
    const unit = units.value.find(unit => unit.id === unitId);
    return unit ? unit.name : 'Неизвестная единица'; // Fallback text
};


const selectedMaterialId = ref(null);
const isDeleteModalOpen = ref(false);

const toggleDeleteModal = (material) => {
    selectedMaterialId.value = material?.id;
    isDeleteModalOpen.value = !isDeleteModalOpen.value;
};

</script>
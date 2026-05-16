<template>
    <div class="flex items-center justify-between shadow ring-1 ring-black/5 bg-white px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-between sm:hidden">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
            </button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        </div>
  
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
                <p class="text-sm text-gray-700">
                    Showing
                    <span class="font-medium">{{ startItem }}</span>
                    to
                    <span class="font-medium">{{ endItem }}</span>
                    of
                    <span class="font-medium">{{ totalItems }}</span>
                    results
                </p>
            </div>
            <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span class="sr-only">Previous</span>
                        <ChevronLeftIcon class="size-5" aria-hidden="true" />
                    </button>
        
                    <button v-for="page in visiblePages" :key="page" @click="changePage(page)" :class="['relative inline-flex items-center px-4 py-2 text-sm font-semibold',page === currentPage? 'z-10 bg-red-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600': 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0']">
                        {{ page }}
                    </button>
        
                    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span class="sr-only">Next</span>
                        <ChevronRightIcon class="size-5" aria-hidden="true" />
                    </button>
                </nav>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { computed, watch } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid';
  
const props = defineProps({
    currentPage: {
        type: Number,
        required: true
    },
    perPage: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    totalPages: {
        type: Number,
        required: true
    },
});

const emit = defineEmits(['update:currentPage']);

const visiblePages = computed(() => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    const totalPages = props.totalPages;
    const currentPage = props.currentPage;

    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= half) {
        return Array.from({ length: maxVisible }, (_, i) => i + 1);
    }

    if (currentPage > totalPages - half) {
        return Array.from(
            { length: maxVisible },
            (_, i) => totalPages - maxVisible + i + 1
        );
    }

    return Array.from(
        { length: maxVisible },
        (_, i) => currentPage - half + i
    );
});

const startItem = computed(() => (props.currentPage - 1) * props.perPage + 1);
const endItem = computed(() => Math.min(props.currentPage * props.perPage, props.totalItems));

watch(() => props.currentPage, (newPage) => {
    if (newPage < 1) {
        emit('update:currentPage', 1);
    } else if (newPage > props.totalPages) {
        emit('update:currentPage', props.totalPages);
    }
});

const changePage = (page) => {
    if (page >= 1 && page <= props.totalPages) {
        emit('update:currentPage', page);
    }
};
</script>

  
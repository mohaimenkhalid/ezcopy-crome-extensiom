<script setup>
defineProps(['query']);
const emits = defineEmits(['clearFilter']);
</script>
<template>
  <div class="min-h-[300px] flex items-center justify-center bg-gray-50 p-4">
    <div class="max-w-md w-full text-center">
      <!-- Icon -->
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-2">
        <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <!-- Message -->
     <template v-if="query.length">
       <h3 class="text-lg font-medium text-gray-900 mb-1">No items found with "{{query}}"</h3>
       <p class="text-gray-500 mb-6">
         We couldn't find any items matching your search.
         Try adjusting your filters or check back later.
       </p>
     </template>
      <template v-else>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No items found</h3>
        <p class="text-gray-500 mb-6">
          Try to copy anything from any webpage, it will be saved here automatically.
        </p>
      </template>

      <!-- Action Buttons -->
      <div v-if="query.length" class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
            @click="emits('clearFilter')"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Clear Filters
        </button>
      </div>
    </div>
  </div>
</template>
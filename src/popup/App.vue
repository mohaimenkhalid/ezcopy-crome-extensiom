
<script setup>
import {ref, onMounted, computed, onUnmounted} from 'vue'
import Header from '../components/Header.vue'
import ListItem from "../components/ListItem.vue";
import FilterNotFound from "../components/notFound/FilterNotFound.vue";
const items = ref([])
const query = ref('')

const loadClipboardItems = () => {
  chrome.storage.local.get(['ezcopy_items'], (res) => {
    items.value = res.ezcopy_items || []
  })
}

const clearAll = () => {
  if (confirm('Sure to clear all clips?')) {
    chrome.storage.local.set({ezcopy_items: []}, () => {
      loadClipboardItems()
    })
  }
}

//get clipboard content from restricted pages
// const readClipboard = async () => {
//   try {
//     const text = await navigator?.clipboard?.readText()
//     if(!text) return
//
//     const clip = {
//       text,
//       url: '',
//       title: 'Clipboard Read',
//       time: Date.now(),
//       id: (Date.now().toString(36)+Math.random().toString(36).slice(2))
//     }
//
//     chrome.storage.local.get({ezcopy_items: []}, async (res) => {
//       const arr = res.ezcopy_items
//       const findText = arr.find((item) => item.text === text)
//       if (findText) return;
//       arr.push(clip)
//       while(arr.length > 500) arr.shift()
//       chrome.storage.local.set({ezcopy_items: arr}, () => loadClipboardItems())
//     })
//   } catch(e) {
//     alert('Clipboard read failed: ' + e)
//   }
// }

const listener = (changes, area) => {
  if (changes.ezcopy_items) {
    items.value = changes.ezcopy_items.newValue || []
  }
}


onMounted(() => {
  loadClipboardItems()
  //setTimeout(() => readClipboard(), 500)
  // listen to storage changes to update UI realtime
  // chrome.storage.onChanged.addListener((changes, area) => {
  //   if (changes.ezcopy_items) {
  //     items.value = changes.ezcopy_items.newValue || []
  //   }
  // })
  chrome.storage.onChanged.addListener(listener)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(listener)
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items.value.slice().reverse()
  return items.value.filter(i => i.text.toLowerCase().includes(q)).reverse()
})

const isNotFound = computed(() => !items.value.length || (query.value.length > 0 && !filtered.value.length))

</script>

<template>
  <div class="w-[600px] h-[550px] bg-white shadow-xl flex flex-col overflow-hidden">
    <Header :modelValue="query" @update:modelValue="query = $event" />

    <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      <div class="flex justify-between items-center mb-3">
        <div class="text-sm font-medium text-gray-700">Your Clipboard Items({{items.length}})</div>
        <div class="flex space-x-2">
          <button @click="clearAll" class="flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-all duration-200">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Clear all
          </button>
          <button class="flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-primary-600 border border-primary-200 hover:bg-primary-50 transition-all duration-200">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add new
          </button>
        </div>
      </div>
      <template v-for="(item, index) in filtered" :key="item.id">
        <ListItem
          :item="item"
        />
      </template>
      <FilterNotFound v-if="isNotFound" :query="query" @clearFilter="query = ''"/>
     </div>
  </div>
</template>

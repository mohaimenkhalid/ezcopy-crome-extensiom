<script setup>
  const props = defineProps(['item']);

  function formatTime(ts) {
    try {
      const d = new Date(ts);
      const now = Date.now();
      const diff = Math.floor((now - ts) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return d.toLocaleString();
    } catch {
      return "";
    }
  }


  const copyItem = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // msg.value = 'Copied to clipboard'
    } catch (e) {
      // fallback: send to background to copy via execScript if needed
      chrome.runtime.sendMessage({type:'COPY_TO_CLIPBOARD', text})
      // msg.value = 'Requested copy'
    }
    // setTimeout(()=> msg.value='',1000)
  }

  const deleteItem = (id) => {
    chrome.storage.local.get(['ezcopy_items'], (res) => {
      const arr = res.ezcopy_items || []
      const next = arr.filter(i => i.id !== id)
      chrome.storage.local.set({ezcopy_items: next}, () => {})
    })
  }

</script>

<template>
  <div class="no-select flex items-start p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200 group">
    <div class="flex-1 min-w-0">
      <p class="text-gray-900 text-sm font-medium text-truncate group-hover:text-primary-800 transition-colors duration-200">
        {{item.text}}
      </p>
      <div class="mt-2 flex items-center text-xs text-gray-500">
                        <span class="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {{formatTime(item.time)}}
                        </span>
        <a href="#" class="ml-3 flex items-center text-primary-600 hover:text-primary-800 hover:underline truncate max-w-[180px] transition-colors duration-200">
          <svg class="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
          <span class="truncate">{{item.url}}</span>
        </a>
      </div>
    </div>
    <div class="flex space-x-0.5 ml-3">
      <button class="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-500 hover:text-yellow-600 transition-all duration-200 group-hover:scale-105 transform" title="Bookmark">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
        </svg>
      </button>
      <button class="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200 group-hover:scale-105 transform" title="Edit">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      </button>
      <button @click="copyItem(item.text)" class="p-1.5 rounded-lg hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-all duration-200 group-hover:scale-105 transform" title="Copy">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      </button>
      <button @click="deleteItem(item.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-200 group-hover:scale-105 transform" title="Delete">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<style>
.text-truncate {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.gradient-text {
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
.no-select {
  user-select: none; /* modern browsers */
  -webkit-user-select: none; /* Chrome, Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE/Edge */
}
</style>
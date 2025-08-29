<template>
  <div style="font-family: Arial; padding: 12px; width: 360px;">
    <h3>EzCopy</h3>
    <input v-model="query" placeholder="Search..." style="width:100%; padding:6px; margin-bottom:8px;" />
    <div v-if="items.length === 0" style="color:#666; padding:8px;">No items yet. Copy text on any page to capture.</div>
    <ul style="list-style:none; padding:0; margin:0;">
      <li v-for="item in filtered" :key="item.id" style="padding:8px; border-bottom:1px solid #eee; display:flex; gap:8px; align-items:flex-start;">
        <div style="flex:1; word-break:break-word; max-height:64px; overflow:auto;">{{ JSON.stringify(item) }}</div>
       <div style="display:flex; flex-direction:column; gap:6px;">
          <button @click="copyItem(item.text)" title="Copy to clipboard">Copy</button>
          <button @click="deleteItem(item.id)" title="Delete">Del</button>
        </div>
      </li>
    </ul>
    <div style="margin-top:8px; display:flex; gap:8px;">
      <button @click="clearAll" :disabled="items.length===0">Clear All</button>
      <button @click="refresh">Refresh</button>
    </div>
    <p v-if="msg" style="margin-top:8px;">{{ msg }}</p>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  setup() {
    const items = ref([])
    const query = ref('')
    const msg = ref('')

    const load = () => {
      chrome.storage.local.get(['ezcopy_items'], (res) => {
        items.value = res.ezcopy_items || []
      })
    }

    const refresh = () => {
      load()
      msg.value = 'Refreshed'
      setTimeout(()=> msg.value='',800)
    }

    const copyItem = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        msg.value = 'Copied to clipboard'
      } catch (e) {
        // fallback: send to background to copy via execScript if needed
        chrome.runtime.sendMessage({type:'COPY_TO_CLIPBOARD', text})
        msg.value = 'Requested copy'
      }
      setTimeout(()=> msg.value='',1000)
    }

    const deleteItem = (id) => {
      chrome.storage.local.get(['ezcopy_items'], (res) => {
        const arr = res.ezcopy_items || []
        const next = arr.filter(i => i.id !== id)
        chrome.storage.local.set({ezcopy_items: next}, () => {
          load()
        })
      })
    }

    const clearAll = () => {
      chrome.storage.local.set({ezcopy_items: []}, () => {
        load()
      })
    }

    onMounted(() => {
      load()
      // listen to storage changes to update UI realtime
      chrome.storage.onChanged.addListener((changes, area) => {
        if (changes.ezcopy_items) {
          items.value = changes.ezcopy_items.newValue || []
        }
      })
    })

    const filtered = computed(() => {
      const q = query.value.trim().toLowerCase()
      if (!q) return items.value.slice().reverse()
      return items.value.filter(i => i.text.toLowerCase().includes(q)).reverse()
    })

    return { items, query, msg, copyItem, deleteItem, clearAll, refresh, filtered }
  }
}
</script>

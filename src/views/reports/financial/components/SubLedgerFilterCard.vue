<template>
  <AppCard class="relative z-20 border border-gray-800 bg-surface-section/60 p-5 rounded-none">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div class="relative col-span-1 md:col-span-2">
        <label class="block text-xs font-bold text-gray-400 uppercase mb-2">
          الكيان / الحساب المساعد المستهدف <span class="text-rose-500">*</span>
        </label>

        <div class="relative">
          <input
            type="text"
            readonly
            :value="selectedLedgerName"
            @click="toggleDropdown"
            placeholder="اضغط للبحث واختيار (عميل، مورد، بنك، خزنة، مصمم)..."
            class="w-full !bg-slate-950 border border-gray-700 rounded-none px-3 py-2 !text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm cursor-pointer text-right transition-colors"
            required
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span class="text-gray-500 text-xs">▼</span>
          </div>
        </div>

        <div
          v-if="isDropdownOpen"
          class="absolute left-0 right-0 z-50 mt-1 w-full bg-[#1e293b] border border-gray-700 rounded-none shadow-2xl p-3 space-y-3"
        >
          <div class="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-none">
            <button
              type="button"
              @click="activeTab = 'all'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-1.5 rounded-none font-medium transition-all text-center',
                activeTab === 'all'
                  ? 'bg-gray-700 text-white font-bold border border-gray-600'
                  : 'text-gray-400 hover:text-white',
              ]"
            >
              الكل
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\Customer'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-1 rounded-none font-medium transition-all text-center',
                activeTab === 'App\\Models\\Customer'
                  ? 'bg-blue-600 text-white font-bold border border-blue-500'
                  : 'text-gray-400 hover:text-blue-400',
              ]"
            >
              العملاء
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\Supplier'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-1 rounded-none font-medium transition-all text-center',
                activeTab === 'App\\Models\\Supplier'
                  ? 'bg-amber-600 text-white font-bold border border-amber-500'
                  : 'text-gray-400 hover:text-amber-400',
              ]"
            >
              الموردين
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\Bank'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-1 rounded-none font-medium transition-all text-center',
                activeTab === 'App\\Models\\Bank'
                  ? 'bg-indigo-600 text-white font-bold border border-indigo-500'
                  : 'text-gray-400 hover:text-indigo-400',
              ]"
            >
              البنوك
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\Treasury'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-1 rounded-none font-medium transition-all text-center',
                activeTab === 'App\\Models\\Treasury'
                  ? 'bg-emerald-600 text-white font-bold border border-emerald-500'
                  : 'text-gray-400 hover:text-emerald-400',
              ]"
            >
              الخزائن
            </button>
            <button
              type="button"
              @click="activeTab = 'App\\Models\\User'"
              :class="[
                'flex-1 text-[10px] py-1.5 px-1 rounded-none font-medium transition-all text-center',
                activeTab === 'App\\Models\\User'
                  ? 'bg-purple-600 text-white font-bold border border-purple-500'
                  : 'text-gray-400 hover:text-purple-400',
              ]"
            >
              المصممون
            </button>
          </div>

          <input
            type="text"
            v-model="searchQuery"
            ref="searchInputRef"
            placeholder="اكتب اسم الحساب أو الكيان للبحث الفوري..."
            class="block w-full px-3 py-1.5 border border-gray-700 rounded-none bg-slate-950 text-white focus:border-cyan-500 outline-none text-sm"
          />

          <div v-if="isDataLoading" class="text-center py-4 text-xs text-gray-500">
            جاري تحديث الحسابات المساعدة من الخادم...
          </div>

          <ul v-else class="max-h-48 overflow-y-auto divide-y divide-gray-800 text-sm text-right">
            <li v-for="item in filteredSubLedgers" :key="item.composite_key">
              <button
                type="button"
                @click="selectLedger(item)"
                class="w-full text-right px-3 py-2 hover:bg-gray-800 flex justify-between items-center transition-colors rounded-none"
              >
                <span class="font-medium text-gray-200">{{ item.name }}</span>
                <span
                  :class="['text-[10px] px-2 py-0.5 border font-bold font-sans', item.badgeClass]"
                >
                  {{ item.displayType }}
                </span>
              </button>
            </li>
            <li
              v-if="filteredSubLedgers.length === 0"
              class="text-center py-4 text-gray-500 text-xs"
            >
              لا توجد نتائج مطابقة للبحث أو التصنيف الحالي
            </li>
          </ul>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-400 uppercase mb-2">من تاريخ</label>
        <input
          type="date"
          v-model="localFilters.from_date"
          class="w-full bg-surface-background border border-gray-700 rounded-none px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
          style="color-scheme: dark"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-400 uppercase mb-2">إلى تاريخ</label>
        <input
          type="date"
          v-model="localFilters.to_date"
          class="w-full bg-surface-background border border-gray-700 rounded-none px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
          style="color-scheme: dark"
        />
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import AppCard from '@/components/ui/AppCard.vue'

const props = defineProps({
  subLedgersList: { type: Array, required: true },
  isDataLoading: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['fetch'])

const localFilters = ref({
  sub_ledger_type: '',
  sub_ledger_id: '',
  from_date: '',
  to_date: '',
})

const isDropdownOpen = ref(false)
const activeTab = ref('all')
const searchQuery = ref('')
const selectedLedgerName = ref('')
const searchInputRef = ref(null)

// الفلترة والبحث اللحظي بناءً على نوع التبويب المختار
const filteredSubLedgers = computed(() => {
  return props.subLedgersList.filter((item) => {
    const matchesTab = activeTab.value === 'all' || item.type === activeTab.value
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesTab && matchesSearch
  })
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const selectLedger = (item) => {
  localFilters.value.sub_ledger_type = item.type
  localFilters.value.sub_ledger_id = item.id
  selectedLedgerName.value = `${item.name} (${item.displayType})`
  isDropdownOpen.value = false
  searchQuery.value = ''
}

// دالة الصياغة النظيفة وإرسال الأحداث للأب
const emitFetch = () => {
  if (!localFilters.value.sub_ledger_type || !localFilters.value.sub_ledger_id) return

  const cleanFilters = {
    sub_ledger_type: localFilters.value.sub_ledger_type,
    sub_ledger_id: localFilters.value.sub_ledger_id,
  }
  if (localFilters.value.from_date) cleanFilters.from_date = localFilters.value.from_date
  if (localFilters.value.to_date) cleanFilters.to_date = localFilters.value.to_date

  emit('fetch', cleanFilters)
}

// مراقبة كائن الفلاتر بشكل عميق للتحديث التلقائي الفوري والذكي عند تغير أي قيمة
watch(
  localFilters,
  () => {
    emitFetch()
  },
  { deep: true },
)
</script>

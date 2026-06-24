<!--src\views\projects\ProjectsFilter.vue--->
<template>
  <AppCard class="mb-6">
    <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div class="w-full">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">الشركة</h3>
          <CompaniesDropdown
            id="project-company-filter"
            label=""
            :model-value="modelValue"
            @update:modelValue="$emit('update:modelValue', $event)"
            placeholder="الكل"
          />
        </div>

        <div class="w-full">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">نوع المشروع</h3>
          <ProjectTypesDropdown
            id="project-type-filter"
            label=""
            :model-value="projectTypeFilter"
            @update:modelValue="$emit('update:projectTypeFilter', $event)"
            placeholder="الكل"
          />
        </div>

        <div class="w-full">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">حالة الإنجاز</h3>
          <AppDropdown
            id="completion-status-filter"
            label=""
            :model-value="completionStatusFilter"
            @update:modelValue="$emit('update:completionStatusFilter', $event)"
            :options="completionOptions"
            placeholder="الكل"
          />
        </div>

        <div class="w-full">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">إذن التعاقد</h3>
          <div class="relative">
            <select
              :value="permissionFilter"
              @change="$emit('update:permissionFilter', $event.target.value)"
              class="block w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm appearance-none cursor-pointer"
            >
              <option value="">الكل</option>
              <option value="1">يوجد إذن</option>
              <option value="0">لا يوجد إذن</option>
            </select>
            <div class="absolute inset-y-0 left-0 flex items-center px-2 pointer-events-none">
              <svg
                class="w-4 h-4 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="w-full">
          <h3 class="font-semibold text-sm mb-2 text-text-secondary">بحث سريع</h3>
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              type="text"
              placeholder="اسم المشروع..."
              class="block w-full pl-10 pr-4 py-2 border border-surface-border rounded-lg bg-surface-ground text-text-primary focus:ring-2 focus:ring-primary outline-none transition-all sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/ui/AppCard.vue'
import CompaniesDropdown from '@/components/forms/CompaniesDropdown.vue'
import ProjectTypesDropdown from '@/components/forms/ProjectTypesDropdown.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  // فلتر الشركة
  modelValue: { type: [String, Number, null], default: null },

  // فلتر نوع المشروع (الجديد)
  projectTypeFilter: { type: [String, Number, null], default: null },

  // فلتر حالة الإنجاز (الجديد - اسم متغير معبر)
  completionStatusFilter: { type: String, default: '' },

  // فلتر البحث النصي
  searchQuery: { type: String, default: '' },

  // فلتر الإذن
  permissionFilter: { type: [String, Number, null], default: '' },
})

defineEmits([
  'update:modelValue',
  'update:projectTypeFilter',
  'update:completionStatusFilter',
  'update:searchQuery',
  'update:permissionFilter',
])

// خيارات الحالة (Smart Ranges) التي ستذهب للباك إند
const completionOptions = [
  { id: '', name: 'الكل' },
  { id: 'completed', name: 'مكتملة (100%)' },
  { id: 'in_progress', name: 'قيد التنفيذ (1% - 99%)' },
  { id: 'not_started', name: 'لم تبدأ (0%)' },
  { id: 'almost_done', name: 'على وشك الانتهاء (> 80%)' },
  { id: 'just_started', name: 'في البداية (< 20%)' },
]
</script>

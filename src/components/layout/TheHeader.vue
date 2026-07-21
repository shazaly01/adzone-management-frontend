<!-- src/components/layout/TheHeader.vue -->
<template>
  <header
    class="relative flex h-16 items-center justify-between bg-surface-section px-4 sm:px-6 lg:px-8 flex-shrink-0"
  >
    <!-- الطرف الأيمن: زر فتح القائمة للشاشات الصغيرة -->
    <div class="flex items-center">
      <button
        @click="$emit('open-sidebar')"
        class="lg:hidden text-text-muted hover:text-text-primary"
      >
        <Bars3Icon class="h-6 w-6" />
      </button>
    </div>

    <!-- منتصف الهيدر تماماً: شارة اسم الفرع برتقالية ناصعة وبخط واضح -->
    <div
      v-if="branchName"
      class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/25 border border-orange-400 tracking-wide z-10"
    >
      <span class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
      <span>{{ branchName }}</span>
    </div>

    <!-- الطرف الأيسر: معلومات المستخدم -->
    <div class="flex items-center gap-4">
      <span class="font-medium text-text-primary hidden sm:inline">
        {{ authStore.user?.full_name }}
      </span>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { Bars3Icon } from '@heroicons/vue/24/outline'

defineEmits(['open-sidebar'])
const authStore = useAuthStore()

// قراءة اسم الفرع من ملف .env عبر Vite
const branchName = import.meta.env.VITE_BRANCH_NAME || ''
</script>

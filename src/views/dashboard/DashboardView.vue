<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <div
      class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div
      class="relative z-10 space-y-6 max-w-2xl transform transition-all duration-500 hover:scale-[1.01]"
    >
      <div
        class="inline-flex p-5 bg-surface-section rounded-full shadow-lg border border-surface-border text-primary animate-pulse"
      >
        <svg
          class="w-16 h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          ></path>
        </svg>
      </div>

      <h1 class="text-4xl font-extrabold text-text-primary tracking-tight md:text-5xl">
        أهلاً بك في <span class="text-primary">لوحة التحكم الموحدة</span>
      </h1>

      <p class="text-lg text-text-muted max-w-md mx-auto leading-relaxed">
        النظام جاهز ومستقر تماماً. يمكنك الآن البدء في إدارة العمليات المالية والمحاسبية والوصول
        للشاشات عبر القائمة الجانبية.
      </p>

      <div class="pt-4 flex justify-center gap-4">
        <div
          class="px-4 py-2 bg-surface-section border border-surface-border rounded-lg text-sm font-semibold text-text-secondary shadow-sm"
        >
          المستخدم الحالي:
          <span class="text-text-primary font-bold">{{
            authStore.user?.name || 'مدير النظام'
          }}</span>
        </div>

        <div
          class="px-4 py-2 bg-surface-section border border-surface-border rounded-lg text-sm font-semibold text-text-secondary shadow-sm"
        >
          الحالة:
          <span class="text-emerald-500 font-bold flex inline-flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> متصل بنجاح
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

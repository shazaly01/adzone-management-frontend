<!--src\components\ui\LoadingProgress.vue--->
<template>
  <div class="flex flex-col items-center justify-center flex-1 no-print">
    <div class="relative w-16 h-16">
      <div
        class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"
      ></div>
      <div
        class="absolute top-1 left-1 animate-ping rounded-full h-14 w-14 border border-orange-200"
      ></div>
    </div>
    <p class="text-sm text-slate-600 mt-6 font-bold tracking-wide animate-pulse">
      {{ message }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'جاري التحميل...',
  },
})
</script>

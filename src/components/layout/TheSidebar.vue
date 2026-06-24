<template>
  <aside
    class="flex h-full flex-col bg-surface-section border-l border-surface-border lg:border-l-0 lg:border-r"
  >
    <div class="flex h-16 items-center justify-between px-5 flex-shrink-0">
      <RouterLink :to="{ name: 'Dashboard' }" class="flex items-center gap-2">
        <img :src="projectLogo" :alt="projectName" class="w-8 h-8 rounded-md" />
        <h1 class="text-xl font-bold text-text-primary">{{ projectName }}</h1>
      </RouterLink>
      <button
        @click="$emit('close-sidebar')"
        class="lg:hidden text-text-muted hover:text-text-primary"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>
    </div>

    <div class="flex flex-1 flex-col justify-between overflow-y-auto mt-4">
      <nav class="-mx-3 space-y-1 px-5">
        <template v-for="item in filteredNavLinks" :key="item.name">
          <RouterLink
            v-if="!item.children"
            :to="{ name: item.routeName }"
            class="nav-link"
            @click="$emit('close-sidebar')"
          >
            <component :is="item.icon" class="h-6 w-6" stroke-width="1.5" />
            <span class="mx-2 text-base font-medium">{{ item.name }}</span>
          </RouterLink>

          <div v-else>
            <button
              @click="toggleGroup(item.name)"
              class="nav-group-button"
              :class="{ 'text-primary': isGroupActive(item) }"
            >
              <div class="flex items-center">
                <component :is="item.icon" class="h-6 w-6" stroke-width="1.5" />
                <span class="mx-2 text-base font-medium">{{ item.name }}</span>
              </div>
              <ChevronDownIcon
                class="h-5 w-5 transform transition-transform duration-200"
                :class="{ 'rotate-180': isGroupOpen(item.name) }"
              />
            </button>

            <transition
              enter-active-class="transition-all ease-in-out duration-300"
              leave-active-class="transition-all ease-in-out duration-200"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-screen opacity-100"
              leave-from-class="max-h-screen opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div
                v-show="isGroupOpen(item.name)"
                class="mt-1 space-y-1 overflow-hidden bg-black/5 rounded-lg py-1"
              >
                <template v-for="(child, index) in item.children" :key="child.name || index">
                  <div
                    v-if="child.type === 'header'"
                    class="px-3 pt-3 pb-1 border-t border-surface-border/60 first:border-t-0 first:pt-1 mt-2 first:mt-0 select-none"
                  >
                    <span class="text-xs font-bold text-text-muted/80 tracking-wide block">
                      {{ child.name }}
                    </span>
                  </div>

                  <RouterLink
                    v-else
                    :to="{ name: child.routeName }"
                    class="nav-link nav-sub-link"
                    @click="$emit('close-sidebar')"
                  >
                    <span class="mx-2 text-sm font-medium">{{ child.name }}</span>
                  </RouterLink>
                </template>
              </div>
            </transition>
          </div>
        </template>
      </nav>

      <div class="mt-auto border-t border-surface-border px-2 pt-4">
        <a @click.prevent="handleLogout" href="#" class="nav-link text-danger hover:bg-danger/10">
          <ArrowLeftOnRectangleIcon class="h-6 w-6" stroke-width="1.5" />
          <span class="mx-2 text-base font-medium">تسجيل الخروج</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, shallowRef, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ArrowLeftOnRectangleIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

// استيراد مصفوفة الإعدادات المجرّدة
import { navigationConfig } from '@/config/navigation'

defineEmits(['close-sidebar'])

const authStore = useAuthStore()
const route = useRoute()

const projectName = ref(import.meta.env.VITE_APP_NAME || 'لوحة تحكم')
const projectLogo = ref(import.meta.env.VITE_APP_LOGO || '/MainLogo2.png')

const allNavLinks = shallowRef(navigationConfig)

const isGroupActive = (group) => {
  if (!group.children) return false
  return group.children.some((child) => child.routeName === route.name)
}

// الفلترة المتقدمة التي تدعم العناوين البينية (Headers) والصلاحيات بشكل متناسق
const filteredNavLinks = computed(() => {
  const filterChildren = (children) => {
    // خطوة 1: فلترة الروابط بناءً على الصلاحيات مع الإبقاء المؤقت على الـ headers
    const rawFiltered = children.filter((child) => {
      if (child.type === 'header') return true
      return authStore.can(child.permission)
    })

    // خطوة 2: تنظيف العناوين الفرعية التي فرغت من الروابط التابعة لها بصورة ديناميكية
    const cleanedChildren = []
    for (let i = 0; i < rawFiltered.length; i++) {
      if (rawFiltered[i].type === 'header') {
        let hasValidChildrenAhead = false
        // الفحص المسبق: هل يوجد رابط مسموح به قبل الوصول للـ header القادم أو نهاية المصفوفة؟
        for (let j = i + 1; j < rawFiltered.length; j++) {
          if (rawFiltered[j].type === 'header') break
          hasValidChildrenAhead = true
        }
        if (hasValidChildrenAhead) {
          cleanedChildren.push(rawFiltered[i])
        }
      } else {
        cleanedChildren.push(rawFiltered[i])
      }
    }
    return cleanedChildren
  }

  return allNavLinks.value
    .filter((item) => authStore.can(item.permission))
    .map((item) => {
      if (item.children) {
        const filteredChildren = filterChildren(item.children)
        // لا تظهر المجموعة الرئيسية إذا لم يتبقَ بها عناصر أو عناوين فرعية صالحة
        if (filteredChildren.length > 0 && filteredChildren.some((c) => c.type !== 'header')) {
          return { ...item, children: filteredChildren }
        }
        return null
      }
      return item
    })
    .filter(Boolean)
})

const openGroups = ref([])

const toggleGroup = (groupName) => {
  if (openGroups.value.includes(groupName)) {
    openGroups.value = openGroups.value.filter((g) => g !== groupName)
  } else {
    openGroups.value.push(groupName)
  }
}

const isGroupOpen = (groupName) => {
  return openGroups.value.includes(groupName)
}

const setActiveGroup = () => {
  const currentRouteName = route.name
  for (const group of filteredNavLinks.value) {
    if (group.children && group.children.some((child) => child.routeName === currentRouteName)) {
      if (!isGroupOpen(group.name)) {
        openGroups.value.push(group.name)
      }
      return
    }
  }
}

watch(route, setActiveGroup, { immediate: true })

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center rounded-lg px-3 py-2.5 text-text-secondary transition-colors duration-300 transform;
}
.nav-link:hover {
  @apply bg-surface-border text-text-primary;
}
.router-link-exact-active {
  @apply bg-gradient-to-b from-primary-light to-primary-dark text-white;
  --tw-shadow-color: theme('colors.primary.DEFAULT');
  --tw-shadow: 0 4px 14px 0 var(--tw-shadow-color);
  box-shadow:
    var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  --tw-shadow-opacity: 0.3;
  --tw-shadow-color: rgba(theme('colors.primary.DEFAULT'), var(--tw-shadow-opacity));
}
.nav-sub-link.router-link-exact-active {
  @apply bg-gradient-to-b from-primary-light to-primary-dark;
  @apply text-white;
  @apply border-r-4 border-primary-dark;
  box-shadow: none;
}
.nav-group-button {
  @apply flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-text-secondary transition-colors duration-300 transform;
}
.nav-group-button:hover {
  @apply bg-surface-border text-text-primary;
}
</style>

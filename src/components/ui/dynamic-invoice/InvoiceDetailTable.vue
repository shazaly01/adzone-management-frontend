<!--src\components\ui\dynamic-invoice\InvoiceDetailTable.vue--->
<template>
  <div class="space-y-3" ref="tableContainerRef">
    <div class="overflow-hidden rounded-xl border-2 border-[#5d6170] shadow-2xl">
      <table class="w-full text-xs text-right bg-[#2d303a]">
        <thead
          class="text-[11px] uppercase bg-[#16171b] border-b border-[#5d6170]/50 text-gray-300 font-sans"
        >
          <tr>
            <th
              v-for="col in schema"
              :key="`th-${col.key}`"
              scope="col"
              :class="[
                'px-2 py-2.5 font-black border-l border-[#e05e2b]/40 last:border-l-0',
                ['number', 'currency', 'calculated'].includes(col.type)
                  ? 'text-center'
                  : 'text-right',
                col.widthClass || '',
              ]"
            >
              {{ col.label }}
            </th>
            <th scope="col" class="px-1 py-2.5 font-black text-center w-10">إجراء</th>
          </tr>
        </thead>

        <TransitionGroup tag="tbody" name="list" class="divide-y divide-gray-700/20 bg-[#2d303a]">
          <tr
            v-for="(row, index) in items"
            :key="`row-${index}`"
            class="hover:bg-[#353945] transition-all duration-150 group"
            :class="{ 'animate-flash-merge': row._flashing }"
          >
            <td
              v-for="col in schema"
              :key="`td-${col.key}-${index}`"
              class="px-1.5 py-1.5 align-middle border-l border-[#e05e2b]/40 last:border-l-0"
            >
              <slot :name="`cell-${col.key}`" :row="row" :index="index" :col="col">
                <input
                  v-if="col.readonly"
                  type="text"
                  :value="row[col.key]"
                  readonly
                  disabled
                  placeholder="-"
                  :data-row="index"
                  :data-col="col.key"
                  class="w-full p-1 bg-transparent border-none text-xs font-bold outline-none shadow-none text-gray-300"
                  :class="[
                    ['number', 'currency', 'calculated'].includes(col.type)
                      ? 'text-center font-mono'
                      : 'text-right',
                    col.key === 'grand_total' ? 'text-[#e05e2b] font-black text-sm' : '',
                  ]"
                />

                <input
                  v-else
                  :type="col.type || 'text'"
                  v-model="row[col.key]"
                  :placeholder="col.placeholder || '-'"
                  :data-row="index"
                  :data-col="col.key"
                  @keydown="handleKeyboardNavigation($event, index, col.key)"
                  class="w-full p-1 bg-transparent border-none text-white font-bold text-xs focus:outline-none text-right transition-all focus:bg-[#16171b]/40 focus:rounded"
                  :class="[
                    ['number', 'currency', 'calculated'].includes(col.type)
                      ? 'text-center font-mono'
                      : 'text-right',
                  ]"
                />
              </slot>
            </td>

            <td class="px-1 py-1 align-middle text-center">
              <button
                type="button"
                @click="emit('remove-row', index)"
                class="p-1 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                :disabled="items.length === 1 && isRowEmpty(row)"
                :class="{ invisible: items.length === 1 && isRowEmpty(row) }"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  items: { type: Array, required: true },
  schema: { type: Array, required: true },
})

const emit = defineEmits(['remove-row', 'add-row-request'])

const tableContainerRef = ref(null)

const summaryColumns = computed(() => props.schema.filter((col) => col.summary === true))
const editableColumns = computed(() => props.schema.filter((col) => !col.readonly))

const calculateTotal = (columnKey) => {
  return props.items.reduce((sum, row) => sum + (parseFloat(row[columnKey]) || 0), 0)
}

const isRowEmpty = (row) => {
  if (!row) return true
  return !Object.keys(row).some((key) => {
    if (key === '_flashing' || key === 'available_units') return false
    const value = row[key]
    return value !== null && value !== '' && value !== 0 && value !== false
  })
}

const handleKeyboardNavigation = (event, rowIndex, colKey) => {
  const allowedKeys = ['Enter', 'ArrowUp', 'ArrowDown']
  if (!allowedKeys.includes(event.key)) return

  const currentColIndex = editableColumns.value.findIndex((c) => c.key === colKey)
  if (currentColIndex === -1) return

  let targetRowIndex = rowIndex
  let targetColKey = colKey

  if (event.key === 'Enter') {
    event.preventDefault()

    if (currentColIndex < editableColumns.value.length - 1) {
      targetColKey = editableColumns.value[currentColIndex + 1].key
    } else {
      if (rowIndex < props.items.length - 1) {
        targetRowIndex = rowIndex + 1
        targetColKey = editableColumns.value[0].key
      } else {
        const lastRow = props.items[props.items.length - 1]

        if (!isRowEmpty(lastRow)) {
          emit('add-row-request')
        } else {
          nextTick(() => {
            const selector = `[data-row="${props.items.length - 1}"][data-col="${editableColumns.value[0].key}"]`
            const targetInput = tableContainerRef.value?.querySelector(selector)
            targetInput?.focus()
            if (targetInput?.select) targetInput.select()
          })
        }
        return
      }
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (rowIndex < props.items.length - 1) targetRowIndex = rowIndex + 1
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (rowIndex > 0) targetRowIndex = rowIndex - 1
  }

  nextTick(() => {
    const selector = `[data-row="${targetRowIndex}"][data-col="${targetColKey}"]`
    const targetInput = tableContainerRef.value?.querySelector(selector)
    if (targetInput) {
      targetInput.focus()
      if (typeof targetInput.select === 'function') targetInput.select()
    }
  })
}
</script>

<style scoped>
/* التخلص من حدود ومربعات الـ inputs الافتراضية للمتصفحات */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

@keyframes flashMerge {
  0% {
    background-color: rgba(224, 94, 43, 0.15);
  }
  50% {
    background-color: rgba(224, 94, 43, 0.3);
  }
  100% {
    background-color: transparent;
  }
}

.animate-flash-merge {
  animation: flashMerge 0.8s ease-in-out;
}
</style>

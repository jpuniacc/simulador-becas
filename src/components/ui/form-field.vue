<script setup lang="ts">
import { computed } from 'vue'
import { LucideIcon } from 'lucide-vue-next'

// Props
interface Props {
  label: string
  icon?: LucideIcon
  required?: boolean
  error?: string
  hasError?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  hasError: false,
  class: ''
})

// Slots
const slots = defineSlots<{
  default: () => any
}>()

// Computed
const fieldClasses = computed(() => {
  const baseClasses = 'form-field group'
  const errorClasses = props.hasError ? 'error' : ''
  return `${baseClasses} ${errorClasses} ${props.class}`
})

const inputClasses = computed(() => {
  const baseClasses = 'w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-uniacc-blue focus:border-uniacc-blue transition-all duration-200 shadow-sm group-hover:border-gray-300'
  const errorClasses = props.hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
  return `${baseClasses} ${errorClasses}`
})
</script>

<template>
  <div :class="fieldClasses">
    <label class="form-label block text-sm font-medium text-gray-700 mb-3 flex items-center">
      <div v-if="icon" class="w-6 h-6 bg-uniacc-blue/8 rounded-md flex items-center justify-center mr-3">
        <component :is="icon" class="w-3.5 h-3.5 text-uniacc-blue" />
      </div>
      <span>{{ label }}<span v-if="required" class="text-red-500 ml-1">*</span></span>
    </label>

    <slot />

    <div v-if="error && hasError" class="mt-2 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.form-field.error .form-label {
  @apply text-red-700;
}
</style>

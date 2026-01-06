<script setup lang="ts">
import type { PropType } from 'vue';
import { Checkbox } from 'primevue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  variant: {
    type: String as PropType<'primary' | 'secondary' | 'tertiary'>,
    required: true,
    default: 'primary'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const emitUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}

</script>
<template>
  <div class="inline-suggestion" :class="`inline-suggestion--${variant}`">
    <div class="inline-suggestion-content">
      <div>
        <Checkbox :modelValue="modelValue" @update:modelValue="emitUpdate" :binary="true" />
      </div>
      <div>
        <h3 class="suggestion-title">{{ title }}</h3>
        <p class="suggestion-description">{{ description }}</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.inline-suggestion {
  border-left: 4px solid var(--p-primary-500);
  padding: 1rem;
  background-color: #FEFEFE;
  margin-left: 1.25rem;
}

.inline-suggestion--primary {
  border-left: 4px solid var(--p-primary-500);
}
.inline-suggestion--secondary {
  border-left: 4px solid var(--p-secondary-500);
}
.inline-suggestion--tertiary {
  border-left: 4px solid var(--p-tertiary-500);
}

.inline-suggestion-content {
  display: flex;
  gap: 1rem;
}
.suggestion-title {
  font-size: 0.875rem;
  font-weight: 700;
}
.suggestion-description {
  font-size: 0.875rem;
  @apply text-gray-500;
}
</style>

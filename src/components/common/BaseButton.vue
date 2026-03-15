<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary' // primary | secondary | danger | ghost
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['click']);

function handleClick(event) {
  if (props.disabled) return;
  emit('click', event);
}
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, { 'btn--disabled': disabled }]"
    :disabled="disabled"
    :aria-label="ariaLabel || undefined"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.12s ease,
    transform 0.1s ease;
}

.btn--primary {
  background: linear-gradient(180deg, var(--crm-blue) 0%, var(--crm-blue-mid) 100%);
  color: #ffffff;
  box-shadow: 0 6px 18px rgba(4, 119, 191, 0.18);
}

.btn--secondary {
  background-color: transparent;
  color: var(--crm-navy);
  border-color: rgba(16, 41, 64, 0.2);
}

.btn--ghost {
  background-color: transparent;
  color: var(--crm-text-body);
  border-color: transparent;
}

.btn--danger {
  background: var(--crm-orange);
  color: #ffffff;
}

.btn:hover:not(.btn--disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(4, 119, 191, 0.22);
}

.btn--disabled,
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
</style>


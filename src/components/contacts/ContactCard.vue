<script setup>
import BaseButton from '../common/BaseButton.vue';

const props = defineProps({
  contact: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);
</script>

<template>
  <article class="card crm-card">
    <header class="card__header">
      <h3 class="card__title">
        {{ contact.name }}
      </h3>
      <span class="card__company">
        {{ contact.company }}
      </span>
    </header>

    <section class="card__body">
      <p>
        <span class="label">Email:</span>
        <span>{{ contact.email }}</span>
      </p>
      <p v-if="contact.phone">
        <span class="label">Phone:</span>
        <span>{{ contact.phone }}</span>
      </p>
      <p>
        <span class="label">Created:</span>
        <span>{{ new Date(contact.createdAt).toLocaleDateString() }}</span>
      </p>
    </section>

    <footer class="card__footer">
      <BaseButton
        variant="secondary"
        @click="$emit('edit', contact)"
      >
        Edit
      </BaseButton>
      <BaseButton
        variant="danger"
        @click="$emit('delete', contact)"
      >
        Delete
      </BaseButton>
    </footer>
  </article>
</template>

<style scoped>
.card {
  padding: 0.9rem 0.9rem 0.75rem;
}

.card__header {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-bottom: 0.45rem;
}

.card__title {
  font-size: 1rem;
  font-weight: 600;
}

.card__company {
  font-size: 0.8rem;
  color: var(--crm-text-muted);
}

.card__body {
  font-size: 0.85rem;
  color: var(--crm-text-body);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.label {
  color: var(--crm-text-muted);
  margin-right: 0.25rem;
}

.card__footer {
  margin-top: 0.6rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
}
</style>


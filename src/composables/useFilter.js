import { ref, computed } from 'vue';

export function useFilter(listRef, predicate) {
  const query = ref('');

  const filtered = computed(() => {
    const value = query.value.toLowerCase().trim();
    if (!value) return listRef.value;
    return listRef.value.filter((item) => predicate(item, value));
  });

  return {
    query,
    filtered
  };
}


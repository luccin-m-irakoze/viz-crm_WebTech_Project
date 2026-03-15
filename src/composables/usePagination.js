import { computed, ref, watch } from 'vue';

export function usePagination(data, defaultPageSize = 10) {
  const currentPage = ref(1);
  const pageSize    = ref(defaultPageSize);

  const totalItems = computed(() => data.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)));

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return data.value.slice(start, start + pageSize.value);
  });

  const rangeStart = computed(() => {
    if (!totalItems.value) return 0;
    return (currentPage.value - 1) * pageSize.value + 1;
  });

  const rangeEnd = computed(() =>
    Math.min(currentPage.value * pageSize.value, totalItems.value)
  );

  function goToPage(n) {
    currentPage.value = Math.max(1, Math.min(n, totalPages.value));
  }

  function nextPage()  { goToPage(currentPage.value + 1); }
  function prevPage()  { goToPage(currentPage.value - 1); }

  // Reset to page 1 when the underlying data changes (search / filter)
  watch(data, () => { currentPage.value = 1; });
  // Also reset when page size changes
  watch(pageSize, () => { currentPage.value = 1; });

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    paginatedData,
    goToPage,
    nextPage,
    prevPage
  };
}

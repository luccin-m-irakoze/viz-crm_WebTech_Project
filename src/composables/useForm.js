import { reactive, computed } from 'vue';

export function useForm(initialValues) {
  const form = reactive({ ...initialValues });
  const errors = reactive({});

  const isValid = computed(() => Object.keys(errors).length === 0);

  function setErrors(newErrors) {
    Object.keys(errors).forEach((key) => {
      delete errors[key];
    });
    Object.entries(newErrors || {}).forEach(([key, value]) => {
      if (value) {
        errors[key] = value;
      }
    });
  }

  function reset() {
    Object.keys(form).forEach((key) => {
      form[key] = initialValues[key] ?? '';
    });
    setErrors({});
  }

  return {
    form,
    errors,
    isValid,
    setErrors,
    reset
  };
}


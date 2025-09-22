import { useEffect, useState } from 'react';

interface UseUrlParamOptions {
  paramName: string;
  defaultValue?: string;
  replaceState?: boolean;
}

export function useUrlParam({ paramName, defaultValue = '', replaceState = true }: UseUrlParamOptions) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const valueFromUrl = params.get(paramName);
    if (valueFromUrl) {
      setValue(valueFromUrl);
    }
  }, [paramName]);

  const updateValue = (newValue: string) => {
    setValue(newValue);
    const params = new URLSearchParams(window.location.search);

    if (newValue) {
      params.set(paramName, newValue);
    } else {
      params.delete(paramName);
    }

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;

    if (replaceState) {
      window.history.replaceState({}, '', newUrl);
    } else {
      window.history.pushState({}, '', newUrl);
    }
  };

  return [value, updateValue] as const;
}
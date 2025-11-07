import { useEffect, useState } from 'react';

const MAX_TRANSACTION_SIZE = 1048576;
const MAX_URL_LENGTH = 8192;

type UseUrlParamOptions = {
  paramName: string;
  defaultValue?: string;
  replaceState?: boolean;
};

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
    if (newValue.length > MAX_TRANSACTION_SIZE) {
      console.warn(
        `Transaction size (${newValue.length} bytes) exceeds maximum (${MAX_TRANSACTION_SIZE} bytes). Truncating URL.`,
      );
      setValue(newValue);
      return;
    }

    setValue(newValue);
    const params = new URLSearchParams(window.location.search);

    if (newValue) {
      params.set(paramName, newValue);
    } else {
      params.delete(paramName);
    }

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;

    if (newUrl.length > MAX_URL_LENGTH) {
      console.warn(
        `URL length (${newUrl.length} bytes) exceeds maximum (${MAX_URL_LENGTH} bytes). Transaction not added to URL.`,
      );
      return;
    }

    if (replaceState) {
      window.history.replaceState({}, '', newUrl);
    } else {
      window.history.pushState({}, '', newUrl);
    }
  };

  return [value, updateValue] as const;
}

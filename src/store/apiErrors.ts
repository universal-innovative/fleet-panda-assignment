import { useToastStore } from './toastStore';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function showApiErrorToast(title: string, fallbackMessage: string, error: unknown): void {
  useToastStore.getState().addToast({
    type: 'error',
    title,
    message: getApiErrorMessage(error, fallbackMessage),
  });
}


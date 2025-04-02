import { useState } from 'react';

export interface ModalState<T = any> {
  isOpen: boolean;
  data: T | null;
}

export function useModalState<T = any>(initialState: ModalState<T> = { isOpen: false, data: null }) {
  const [state, setState] = useState<ModalState<T>>(initialState);

  const open = (data: T | null = null) => {
    setState({ isOpen: true, data });
  };

  const close = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const setData = (data: T | null) => {
    setState(prev => ({ ...prev, data }));
  };

  return {
    isOpen: state.isOpen,
    data: state.data,
    open,
    close,
    setData
  };
}
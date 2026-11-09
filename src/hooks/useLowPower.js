import { useMemo } from 'react';

export default function useLowPower() {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = navigator.deviceMemory ?? 8;
    return cores <= 4 || memory <= 4;
  }, []);
}
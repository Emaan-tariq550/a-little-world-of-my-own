import { useSyncExternalStore } from 'react';
import { musicController } from '../utils/musicController.js';

export default function useMusic() {
  const snap = useSyncExternalStore(
    musicController.subscribe,
    musicController.getSnapshot
  );
  return { ...snap, controller: musicController };
}
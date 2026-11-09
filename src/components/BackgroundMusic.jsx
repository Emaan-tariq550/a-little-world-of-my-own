import { useEffect } from 'react';
import { musicController } from '../utils/musicController.js';

// Mounted once in App (outside every AnimatePresence) so the audio element
// is created once and survives all scene / chapter changes.
export default function BackgroundMusic({ config }) {
  useEffect(() => {
    musicController.init(config);
    return () => musicController.destroy();
  }, [config]);

  return null;
}
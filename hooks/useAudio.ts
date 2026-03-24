import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudio() {
  const bgmRef = useRef<Audio.Sound | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadBGM();
    return () => {
      unloadBGM();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBGM() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      // BGMファイルが配置されていない場合は無音で続行する（クラッシュしない）
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/bgm_normal.mp3'),
        { isLooping: true, volume: 0.4, shouldPlay: false },
      );
      bgmRef.current = sound;
      setIsLoaded(true);
    } catch {
      // BGMファイル未配置時はサイレントに続行（ゲームは動作する）
      console.warn('[Audio] BGM load skipped (file not yet placed in assets/audio/)');
    }
  }

  async function unloadBGM() {
    if (bgmRef.current) {
      try {
        await bgmRef.current.stopAsync();
        await bgmRef.current.unloadAsync();
      } catch { /* ignore */ }
      bgmRef.current = null;
    }
  }

  const playBGM = useCallback(async () => {
    if (!bgmRef.current || isMuted) return;
    try {
      const status = await bgmRef.current.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await bgmRef.current.playAsync();
      }
    } catch { /* ignore */ }
  }, [isMuted]);

  const stopBGM = useCallback(async () => {
    if (!bgmRef.current) return;
    try {
      await bgmRef.current.stopAsync();
    } catch { /* ignore */ }
  }, []);

  const toggleMute = useCallback(async () => {
    const next = !isMuted;
    setIsMuted(next);
    if (!bgmRef.current) return;
    try {
      await bgmRef.current.setVolumeAsync(next ? 0 : 0.4);
      if (next) {
        await bgmRef.current.pauseAsync();
      } else {
        await bgmRef.current.playAsync();
      }
    } catch { /* ignore */ }
  }, [isMuted]);

  /**
   * SE（効果音）を単発再生します。
   * ファイルが存在しない場合はサイレントに無視します。
   */
  const playSE = useCallback(async (type: 'tap' | 'send' | 'receive' | 'streak') => {
    if (isMuted) return;
    const seFiles: Record<string, () => Promise<{ sound: Audio.Sound }>> = {
      tap:    () => Audio.Sound.createAsync(require('../assets/audio/se_tap.mp3'),    { shouldPlay: true }),
      send:   () => Audio.Sound.createAsync(require('../assets/audio/se_send.mp3'),   { shouldPlay: true }),
      receive:() => Audio.Sound.createAsync(require('../assets/audio/se_receive.mp3'),{ shouldPlay: true }),
      streak: () => Audio.Sound.createAsync(require('../assets/audio/se_streak.mp3'), { shouldPlay: true }),
    };
    try {
      const { sound } = await seFiles[type]();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch { /* SE失敗はサイレント */ }
  }, [isMuted]);

  return { playBGM, stopBGM, toggleMute, playSE, isMuted, isLoaded };
}

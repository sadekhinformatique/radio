import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { RadioConfig } from '../types';
import AudioVisualizer from './AudioVisualizer';

interface ControlsProps {
  config: RadioConfig;
  isPlaying: boolean;
  setIsPlaying: (state: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({ config, isPlaying, setIsPlaying }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize audio object
    const audio = new Audio(config.streamUrl);
    audioRef.current = audio;
    audio.preload = 'none';

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
        setIsLoading(false);
        setIsPlaying(false);
        setError("Flux indisponible");
    };
    const handlePlaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setError(null);
    }

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, [config.streamUrl, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setError(null);
      try {
        await audioRef.current.play();
      } catch (err) {
        console.error("Playback failed", err);
        setIsLoading(false);
        setError("Erreur de lecture");
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-slate-700/50">
      
      {/* Visualizer Area */}
      <div className="h-16 mb-4 flex items-center justify-center">
        {error ? (
            <span className="text-red-400 font-medium text-sm bg-red-900/20 px-3 py-1 rounded-full">{error}</span>
        ) : (
            <AudioVisualizer isPlaying={isPlaying} />
        )}
      </div>

      {/* Main Play Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={togglePlay}
          className={`
            relative flex items-center justify-center w-20 h-20 rounded-full 
            bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl 
            transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/25 active:scale-95
            ${isPlaying ? 'ring-4 ring-emerald-500/30' : ''}
          `}
          aria-label={isPlaying ? "Pause Radio" : "Play Radio"}
        >
          {isLoading ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-10 h-10 fill-current" />
          ) : (
            <Play className="w-10 h-10 fill-current ml-1" />
          )}
        </button>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center space-x-4 px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
        <button 
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors"
        >
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
        />
      </div>
    </div>
  );
};

export default Controls;
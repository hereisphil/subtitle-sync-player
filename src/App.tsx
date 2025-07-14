import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Volume2, FileAudio, FileText, X, RotateCcw } from 'lucide-react';

interface SubtitleEntry {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

interface DragState {
  audio: boolean;
  srt: boolean;
}

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [srtFile, setSrtFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(-1);
  const [dragState, setDragState] = useState<DragState>({ audio: false, srt: false });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const subtitleContainerRef = useRef<HTMLDivElement>(null);
  const currentSubtitleRef = useRef<HTMLDivElement>(null);

  // Parse SRT file
  const parseSrt = (srtContent: string): SubtitleEntry[] => {
    const entries: SubtitleEntry[] = [];
    const blocks = srtContent.trim().split('\n\n');
    
    blocks.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const id = parseInt(lines[0]);
        const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        
        if (timeMatch) {
          const startTime = 
            parseInt(timeMatch[1]) * 3600 +
            parseInt(timeMatch[2]) * 60 +
            parseInt(timeMatch[3]) +
            parseInt(timeMatch[4]) / 1000;
          
          const endTime = 
            parseInt(timeMatch[5]) * 3600 +
            parseInt(timeMatch[6]) * 60 +
            parseInt(timeMatch[7]) +
            parseInt(timeMatch[8]) / 1000;
          
          const text = lines.slice(2).join('\n');
          
          entries.push({ id, startTime, endTime, text });
        }
      }
    });
    
    return entries;
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, type: 'audio' | 'srt') => {
    e.preventDefault();
    setDragState(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, type: 'audio' | 'srt') => {
    e.preventDefault();
    setDragState(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e: React.DragEvent, type: 'audio' | 'srt') => {
    e.preventDefault();
    setDragState(prev => ({ ...prev, [type]: false }));
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (type === 'audio' && file && file.type.startsWith('audio/')) {
      handleAudioFile(file);
    } else if (type === 'srt' && file && file.name.endsWith('.srt')) {
      handleSrtFile(file);
    }
  };

  // Handle audio file
  const handleAudioFile = (file: File) => {
    setAudioFile(file);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  // Handle SRT file
  const handleSrtFile = async (file: File) => {
    setSrtFile(file);
    const content = await file.text();
    const parsedSubtitles = parseSrt(content);
    setSubtitles(parsedSubtitles);
  };

  // Handle audio file upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      handleAudioFile(file);
    }
  };

  // Handle SRT file upload
  const handleSrtUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.srt')) {
      handleSrtFile(file);
    }
  };

  // Replace file handlers
  const replaceAudioFile = () => {
    setAudioFile(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl('');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const replaceSrtFile = () => {
    setSrtFile(null);
    setSubtitles([]);
    setCurrentSubtitleIndex(-1);
  };

  // Audio event handlers
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Find current subtitle
  useEffect(() => {
    const currentIndex = subtitles.findIndex(
      subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
    setCurrentSubtitleIndex(currentIndex);
  }, [currentTime, subtitles]);

  // Auto-scroll to current subtitle
  useEffect(() => {
    if (currentSubtitleRef.current && subtitleContainerRef.current) {
      const container = subtitleContainerRef.current;
      const currentElement = currentSubtitleRef.current;
      
      const containerHeight = container.clientHeight;
      const elementTop = currentElement.offsetTop;
      const elementHeight = currentElement.clientHeight;
      
      const scrollTop = elementTop - containerHeight / 2 + elementHeight / 2;
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [currentSubtitleIndex]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const bothFilesUploaded = audioFile && srtFile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Subtitle Sync Player
            </h1>
            <p className="text-slate-300">Upload your audio and subtitle files to get started</p>
          </div>

          {/* File Upload Section */}
          {!bothFilesUploaded ? (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Audio Upload */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center mb-4">
                  <FileAudio className="w-6 h-6 mr-2 text-purple-400" />
                  <h3 className="text-lg font-semibold">Audio File</h3>
                </div>
                <label className="relative block">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                      dragState.audio
                        ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                        : audioFile 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-slate-600 hover:border-purple-500 bg-slate-700/30'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'audio')}
                    onDragLeave={(e) => handleDragLeave(e, 'audio')}
                    onDrop={(e) => handleDrop(e, 'audio')}
                  >
                    <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                      dragState.audio ? 'text-purple-400' : 'text-slate-400'
                    }`} />
                    {dragState.audio ? (
                      <p className="text-purple-400 font-medium">Drop your audio file here</p>
                    ) : audioFile ? (
                      <p className="text-green-400 font-medium">{audioFile.name}</p>
                    ) : (
                      <p className="text-slate-300">Click or drag to upload MP3 file</p>
                    )}
                  </div>
                </label>
              </div>

              {/* SRT Upload */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 mr-2 text-purple-400" />
                  <h3 className="text-lg font-semibold">Subtitle File</h3>
                </div>
                <label className="relative block">
                  <input
                    type="file"
                    accept=".srt"
                    onChange={handleSrtUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                      dragState.srt
                        ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                        : srtFile 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-slate-600 hover:border-purple-500 bg-slate-700/30'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'srt')}
                    onDragLeave={(e) => handleDragLeave(e, 'srt')}
                    onDrop={(e) => handleDrop(e, 'srt')}
                  >
                    <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                      dragState.srt ? 'text-purple-400' : 'text-slate-400'
                    }`} />
                    {dragState.srt ? (
                      <p className="text-purple-400 font-medium">Drop your subtitle file here</p>
                    ) : srtFile ? (
                      <p className="text-green-400 font-medium">{srtFile.name}</p>
                    ) : (
                      <p className="text-slate-300">Click or drag to upload SRT file</p>
                    )}
                  </div>
                </label>
              </div>
            </div>
          ) : (
            /* Minimized File Display */
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <FileAudio className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-slate-300">{audioFile?.name}</span>
                    <button
                      onClick={replaceAudioFile}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Replace audio file"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-slate-300">{srtFile?.name}</span>
                    <button
                      onClick={replaceSrtFile}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Replace subtitle file"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {subtitles.length} subtitles loaded
                </div>
              </div>
            </div>
          )}

          {/* Audio Player */}
          {bothFilesUploaded && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-8">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />
              
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={handlePlayPause}
                  className="bg-purple-600 hover:bg-purple-700 rounded-full p-3 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-slate-500">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="w-full">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          )}

          {/* Subtitles */}
          {bothFilesUploaded && subtitles.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">Subtitles</h3>
              <div
                ref={subtitleContainerRef}
                className="h-96 overflow-y-auto space-y-2 custom-scrollbar"
              >
                {subtitles.map((subtitle, index) => (
                  <div
                    key={subtitle.id}
                    ref={index === currentSubtitleIndex ? currentSubtitleRef : null}
                    className={`p-4 rounded-lg transition-all duration-300 transform-gpu ${
                      index === currentSubtitleIndex
                        ? 'bg-purple-600/30 border-l-4 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                    }`}
                    style={{
                      transformOrigin: 'left center'
                    }}
                  >
                    <div className="text-xs text-slate-400 mb-2">
                      {formatTime(subtitle.startTime)} → {formatTime(subtitle.endTime)}
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {subtitle.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
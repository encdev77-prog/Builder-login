/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, Volume2, Sparkles, CheckCircle2, Shield, Flame, Play } from 'lucide-react';

interface SuccessViewProps {
  userEmail: string;
  onLogout: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ userEmail, onLogout }) => {
  const [whistlePlaying, setWhistlePlaying] = useState(false);

  // Play procedural success chime on load
  useEffect(() => {
    triggerWhistle();
  }, []);

  const triggerWhistle = () => {
    setWhistlePlaying(true);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Fun, upbeat Pixar chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45); // C6

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    } catch (e) {
      console.log('AudioContext blocked or unsupported', e);
    }
    setTimeout(() => setWhistlePlaying(false), 900);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-6 bg-[#06070c] overflow-hidden select-none pointer-events-auto">
      
      {/* Decorative Ultra-vibrant Neon Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-pink-500/25 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/25 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#151720_1px,transparent_1px),linear-gradient(to_bottom,#151720_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-20" />

      {/* Main Success Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="relative w-full max-w-[480px] p-[1.5px] rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-2xl shadow-purple-500/10"
      >
        {/* Inner Card */}
        <div className="w-full h-full bg-[#0d0e15]/95 backdrop-blur-2xl rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Celebrating Sparks overlay */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          {/* Glowing animated halo */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 opacity-20 blur-xl pointer-events-none"
          />

          {/* Big Celebratory Check Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
            className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-pink-500/20 mb-6"
          >
            <div className="absolute inset-1 rounded-full bg-[#0d0e15] flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400" />
            </div>
            {/* Dynamic rings */}
            <span className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-40" />
          </motion.div>

          {/* Welcome Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-[10px] uppercase font-black tracking-[0.25em] text-cyan-400 font-mono bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-full">
              Access Granted
            </span>
            <h1 className="text-4xl font-light tracking-tight text-white font-sans mt-4">
              Login Successful
            </h1>
          </motion.div>

          {/* Authorized email card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 px-4 mt-6 flex items-center justify-between shadow-inner"
          >
            <div className="text-left">
              <div className="text-[8px] uppercase tracking-widest font-mono text-slate-400">Authorized Operator</div>
              <div className="text-sm font-bold font-mono text-pink-400 truncate max-w-[240px]">{userEmail}</div>
            </div>
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white">
              <Shield className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Description text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-slate-400 leading-relaxed font-sans mt-5"
          >
            "Yippee!" Billy has successfully hauled the giant gateway, unlatched the heavy rope, and swung open the doors for you. All site credentials have been approved!
          </motion.p>

          {/* Fun statistics / celebratory cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 gap-3 w-full mt-6"
          >
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-left">
              <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-mono uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                Celebration
              </div>
              <div className="text-lg font-bold text-white mt-1">100% Ready</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-left">
              <div className="flex items-center gap-1.5 text-pink-400 text-[10px] font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Gate State
              </div>
              <div className="text-lg font-bold text-white mt-1">Wide Open</div>
            </div>
          </motion.div>

          {/* Bottom Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full space-y-3 mt-8"
          >
            {/* Whistle sound button */}
            <button
              onClick={triggerWhistle}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 hover:border-pink-500/40 text-pink-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className={`w-4 h-4 ${whistlePlaying ? 'animate-bounce' : ''}`} />
              <span className="font-sans text-xs uppercase tracking-widest font-extrabold">
                {whistlePlaying ? 'TWEET!!! 🥳' : 'Blow Celebration Whistle'}
              </span>
            </button>

            {/* Logout/Reset button */}
            <button
              onClick={onLogout}
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white font-extrabold rounded-xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-sans text-xs uppercase tracking-widest">
                Log Out / Exit Gate
              </span>
            </button>
          </motion.div>

          {/* Footer badge */}
          <div className="mt-6 text-[9px] uppercase tracking-widest text-white/20 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-pink-500/50" />
            <span>Billy's Block approved blueprints</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ThreeScene } from './components/ThreeScene';
import { LoginForm } from './components/LoginForm';
import { SuccessView } from './components/SuccessView';
import { BuilderState, InputFocus, MousePosition, LoginState } from './types';
import { HardHat, Info, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [builderState, setBuilderState] = useState<BuilderState>('loading');
  const [inputFocus, setInputFocus] = useState<InputFocus>('none');
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [loginState, setLoginState] = useState<LoginState>({
    isLoggedIn: false,
    userEmail: '',
  });
  
  // High-fidelity state that controls whether the heavy dashboard DOM is displayed
  const [showDashboard, setShowDashboard] = useState<boolean>(false);

  // Mouse move listener to update coordinates for 3D character head/eye tracking
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize to range -1 to 1
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Handle successful login sequence from HTML Form
  const handleLoginSuccess = (email: string) => {
    setLoginState({
      isLoggedIn: true,
      userEmail: email,
    });
  };

  // Listen to specific signals coming out of the 3D Canvas timeline
  const handleTimelineTrigger = (triggerName: string) => {
    if (triggerName === 'transition-to-dashboard') {
      // The camera has flown fully past the doors, show the gorgeous dashboard!
      setShowDashboard(true);
    }
  };

  // Handle log out & reset everything to starting sequence
  const handleLogout = () => {
    setShowDashboard(false);
    setLoginState({ isLoggedIn: false, userEmail: '' });
    // This will force the 3D Canvas to re-mount and run the walk/pull intro again!
    setBuilderState('loading');
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#0A0B10] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Sophisticated background ambient spotlight and watermark */}
      <div className="sophisticated-spotlight" />
      <div className="absolute bottom-6 right-8 text-right select-none pointer-events-none z-0">
        <div className="text-6xl font-black text-white/[0.03] uppercase italic tracking-wider font-sans leading-none">
          BUILDER
        </div>
        <div className="text-xl font-light text-white/[0.01] uppercase tracking-[0.8em] font-sans leading-none mt-1 pl-3">
          Workspace
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showDashboard ? (
          // --- LOGIN MODE WITH 3D CANVAS & WORKER ---
          <motion.div
            key="login-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-full flex-1 flex flex-col justify-between"
          >
            {/* Header branding overlay (fades in slightly after loading) */}
            <header className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-10 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-slate-950 text-sm select-none">
                  🚧
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">
                    Pixar Interactive Short
                  </span>
                  <h1 className="text-xs font-semibold tracking-wider text-white/70 uppercase font-display">
                    The Helpful Little Builder
                  </h1>
                </div>
              </motion.div>

              {/* Status info indicator */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full flex items-center gap-2 text-[10px] text-slate-400 font-mono shadow-md shadow-black/30"
              >
                <Info className="w-3.5 h-3.5 text-yellow-500/80 shrink-0" />
                <span>Status: </span>
                <span className="text-yellow-400/90 font-bold uppercase tracking-wider">
                  {builderState === 'loading' && 'Booting Engine...'}
                  {builderState === 'walk' && 'Builder Entering Site...'}
                  {builderState === 'pulling' && 'Dragging Gateway (Struggling!)'}
                  {builderState === 'settle' && 'Slab Settled!'}
                  {builderState === 'wipe' && 'Wiping Sweat...'}
                  {builderState === 'lean' && 'Idle (Leaning on Gate)'}
                  {builderState === 'point' && 'Pointing at Blueprints'}
                  {builderState === 'lookAway' && 'Politely Looking Away'}
                  {builderState === 'thumbsUp' && 'Approving Credentials 👍'}
                  {builderState === 'excited' && 'Excited Jump! 🌟'}
                  {builderState === 'successDoorOpen' && 'Opening Gateway Door'}
                  {builderState === 'successEnter' && 'Running Inside!'}
                </span>
              </motion.div>
            </header>

            {/* The absolute 3D WebGL Scene */}
            <ThreeScene
              builderState={builderState}
              inputFocus={inputFocus}
              mousePosition={mousePosition}
              isTyping={isTyping}
              onStateChange={setBuilderState}
              onTimelineTrigger={handleTimelineTrigger}
            />

            {/* The interactive glassmorphic login card */}
            <LoginForm
              builderState={builderState}
              onFocusChange={setInputFocus}
              onLoginSuccess={handleLoginSuccess}
              onStateChange={setBuilderState}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
            />

            {/* Prompt helper overlay during walk / pulling */}
            {(builderState === 'walk' || builderState === 'pulling') && (
              <div className="absolute inset-x-0 bottom-12 flex items-center justify-center z-10 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: [0.4, 0.9, 0.4], scale: 1 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl px-5 py-3 text-center text-xs text-yellow-500/90 max-w-xs flex flex-col items-center gap-2 shadow-lg shadow-black/40"
                >
                  <div className="animate-bounce">🚧</div>
                  <span className="font-bold uppercase tracking-wider font-display">
                    Construction In Progress
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    Hold tight, Billy is dragging the gateway into place...
                  </span>
                </motion.div>
              </div>
            )}
          </motion.div>
        ) : (
          // --- COMPLETED SUCCESS CELEBRATION SCENE ---
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="w-full h-full min-h-screen bg-[#06070c]"
          >
            <SuccessView userEmail={loginState.userEmail} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

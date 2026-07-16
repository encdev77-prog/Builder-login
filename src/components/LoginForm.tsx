/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import { BuilderState, InputFocus } from '../types';

interface LoginFormProps {
  builderState: BuilderState;
  onFocusChange: (focus: InputFocus) => void;
  onLoginSuccess: (email: string) => void;
  onStateChange: (state: BuilderState) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  builderState,
  onFocusChange,
  onLoginSuccess,
  onStateChange,
  isTyping,
  setIsTyping,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form is visible when the builder is ready
  const isFormVisible =
    builderState !== 'loading' &&
    builderState !== 'walk' &&
    builderState !== 'pulling' &&
    builderState !== 'successDoorOpen' &&
    builderState !== 'successEnter';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your Email ID.');
      onStateChange('lean');
      return;
    }

    if (!password) {
      setError('A secure Password is required.');
      onStateChange('lean');
      return;
    }

    // Success Sequence!
    setIsSubmitting(true);
    onStateChange('excited');

    setTimeout(() => {
      onStateChange('successDoorOpen');
      onLoginSuccess(email);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 flex items-end md:items-center justify-center md:justify-end z-10 p-4 pb-6 md:pb-4 md:pr-24 lg:pr-36 pointer-events-none">
      {/* Container aligned exactly with the 3D wall coordinates, shifted to the right */}
      <div className="relative w-full max-w-[400px] h-[400px] md:h-[460px] flex flex-col justify-between select-none pointer-events-auto">
        
        {/* Animated Card wrapper */}
        {isFormVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="w-full h-full glass-slab rounded-3xl p-5 md:p-8 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Soft inner glow gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Title / Header */}
            <div className="text-left mt-2 relative z-10">
              <div className="label-micro block mb-1 text-pink-400">System Access</div>
              <h1 className="text-3xl font-light tracking-tight text-white font-sans">
                Welcome Back
              </h1>
              <p className="text-sm text-white/40 mt-1 italic font-sans">
                "Let's get to work!"
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/40 border border-red-500/30 text-red-300 text-xs py-2 px-3 rounded-lg flex items-center gap-2 mt-2"
              >
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10 flex-1 flex flex-col justify-center mt-2">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="label-micro block pl-1 text-white/50">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsTyping(true);
                      onStateChange('lean'); // Reset states if typing
                    }}
                    onFocus={() => {
                      onFocusChange('email');
                      onStateChange('point');
                    }}
                    onBlur={() => {
                      onFocusChange('none');
                      onStateChange('lean');
                      setIsTyping(false);
                    }}
                    placeholder="builder@helper.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="label-micro block pl-1 text-white/50">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIsTyping(true);
                    }}
                    onFocus={() => {
                      onFocusChange('password');
                      onStateChange('point'); // Focus password points or leans instead of looking away!
                    }}
                    onBlur={() => {
                      onFocusChange('none');
                      onStateChange('lean');
                      setIsTyping(false);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Login Button with Vibrant colors */}
              <button
                type="submit"
                disabled={isSubmitting}
                onMouseEnter={() => {
                  onFocusChange('button');
                  onStateChange('thumbsUp');
                }}
                onMouseLeave={() => {
                  onFocusChange('none');
                  onStateChange('lean');
                }}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 active:from-pink-600 active:to-indigo-600 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 active:shadow-none transition-all flex items-center justify-center gap-2 mt-4 text-sm cursor-pointer select-none"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="font-sans font-extrabold tracking-wider uppercase">LOGIN</span>
                    <span className="text-xs opacity-75 font-sans">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
              <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">V. 2.1.0 - VIBRANT</span>
              <div className="flex gap-4">
                <span className="text-[10px] text-white/40 cursor-pointer hover:text-white font-mono" onClick={() => { setEmail(''); setPassword(''); setError(''); }}>Reset</span>
                <span className="text-[10px] text-white/40 cursor-pointer hover:text-white font-mono" onClick={() => alert('Credentials: builder@helper.com / passcode 1234')}>Credentials</span>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, EyeOff, Eye, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-surface-lowest">
      {/* Left Side: Editorial Image */}
      <section className="hidden lg:block lg:w-7/12 relative bg-surface-highest overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2 }}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcegLlyoo66wH7KDnZ5t2JI3V5zc5OAp29s6PJ24M5kU5arqpRg3bBSU4wSTK_q9IAg5ik1PWNal59rd0CoZ7ov9JdAhJlYsev4gHJWoFU-YUPBISRxEFlLmEBAsMznJ2S83tWVh1OIq96Opqfb0i1YrsHRzsdozPDJAMplvsZTQOKmgFfIvL4MhJ8IsOsrjIl5p9UfSehqQGI4XfbRT29thTknXv-HOySWd2WLOQ4phdldJnfK5JoGxG0PK2lY6xc0rUVavpFDJA"
          alt="Editorial"
          className="w-full h-full object-cover grayscale opacity-90"
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
      </section>

      {/* Right Side: Form */}
      <section className="w-full lg:w-5/12 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="w-full max-w-md mx-auto">
          <header className="mb-16">
            <button
              onClick={onBack}
              className="mb-8 uppercase-label text-[10px] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
            >
              ← Back to store
            </button>
            <h1 className="text-4xl font-bold tracking-[0.2em] text-primary mb-4">ELÉGANCE</h1>
            <p className="uppercase-label text-on-surface-variant">Admin Portal</p>
          </header>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 relative group">
              <label className="uppercase-label text-[10px] text-on-surface-variant group-focus-within:text-primary transition-colors">
                Username / ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-outline-variant py-2 px-0 text-sm focus:ring-0 focus:border-primary transition-colors outline-none"
                required
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-2 relative group">
              <div className="flex justify-between items-center">
                <label className="uppercase-label text-[10px] text-on-surface-variant group-focus-within:text-primary transition-colors">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-2 px-0 pr-8 text-sm focus:ring-0 focus:border-primary transition-colors outline-none"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3"
              >
                {error}
              </motion.div>
            )}

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary uppercase-label text-sm hover:bg-accent transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Secure Login
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-16 border-t border-surface-high pt-8 text-center">
            <p className="uppercase-label text-[10px] text-on-surface-variant/50">
              Restricted Access. Authorized Personnel Only.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const data = await api.login(username, password);
      localStorage.setItem("token", data.token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f1ef] flex items-center justify-center pt-28 px-4 pb-16">
      <div className="bg-white p-12 max-w-md w-full animate-reveal">
        <div className="text-center mb-12">
          <h1 className="font-serif text-[clamp(1.4rem,3vw,1.8rem)] text-black mb-3">Admin Portal</h1>
          <div className="w-8 h-px bg-stone-300 mx-auto mb-4"></div>
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone-400">Abayakuy.Official</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 mb-8 text-[13px] font-sans animate-fade-in">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col space-y-8">
          <div>
            <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 block mb-3">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border-b border-stone-200 bg-transparent py-2.5 font-sans text-[15px] text-black focus:outline-none focus:border-black transition-colors duration-300"
            />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 block mb-3">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-b border-stone-200 bg-transparent py-2.5 font-sans text-[15px] text-black focus:outline-none focus:border-black transition-colors duration-300"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-black text-white font-sans text-[11px] tracking-[0.25em] uppercase py-4 hover:bg-stone-800 transition-all duration-500 disabled:opacity-40 mt-4"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}

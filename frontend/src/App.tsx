import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopNavBar from './components/TopNavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Collections from './pages/Collections';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';

// Placeholder for other pages to avoid errors
function Placeholder({ title }: { title: string }) {
  return <div className="pt-32 min-h-screen flex items-center justify-center"><h1 className="text-2xl">{title}</h1></div>;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background text-on-background">
        <TopNavBar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trending" element={<Placeholder title="Trending Now" />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/sale" element={<Placeholder title="Sale" />} />
            <Route path="/about" element={<Placeholder title="About Us" />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

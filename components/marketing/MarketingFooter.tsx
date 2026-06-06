import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

const MarketingFooter: React.FC = () => {
  const nav = useNavigate();
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Heart className="text-white w-4 h-4 fill-current" />
              </div>
              <span className="text-xl font-black text-slate-900">PawPortal</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
              Making pet ownership easier, one paw at a time. Connect, shop, and care with the world's most trusted pet platform.
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link to="/features" className="hover:text-teal-600 transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-teal-600 transition-colors">How it Works</Link></li>
              <li><Link to="/community" className="hover:text-teal-600 transition-colors">Community</Link></li>
              <li><Link to="/signup" className="hover:text-teal-600 transition-colors">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-teal-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="flex items-center gap-3"><Mail size={16} /> support@pawportal.com</li>
              <li className="flex items-center gap-3"><Phone size={16} /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-3"><MapPin size={16} /> 123 Puppy Lane, SF, CA</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <p>&copy; 2024 PawPortal Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
            <button onClick={() => nav('/admin')} className="hover:text-slate-600 uppercase">Admin Portal</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;

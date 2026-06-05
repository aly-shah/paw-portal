
import React from 'react';
import { Heart, Shield, Users, ShoppingBag, ArrowRight, Star, CheckCircle, Calendar, Phone, Mail, Instagram, Facebook, Twitter, MapPin, Clock, Zap, Award, Globe, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
  onQuickNav: (destination: 'Services' | 'Marketplace' | 'Community') => void;
  onAdminLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onQuickNav, onAdminLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-teal-200 selection:text-teal-900">
      
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-rose-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-4 z-50 max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-full px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-200/50">
              <Heart className="text-white w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">PawPortal</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-500">
            <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How it Works</a>
            <a href="#community" className="hover:text-teal-600 transition-colors">Community</a>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onLogin}
              className="text-slate-700 font-bold hover:text-teal-600 transition-colors px-3 text-sm"
            >
              Log In
            </button>
            <button 
              onClick={onSignup}
              className="bg-slate-900 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-white/60 text-teal-700 text-xs font-bold uppercase tracking-widest shadow-sm mb-2">
              <Sparkles size={12} className="fill-current animate-pulse" /> The Super-App for Pets
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight">
              Care that <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-400">Feels Magic.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
              Veterinarians, groomers, sitters, and a thriving community. Everything your furry friend needs, elegantly organized in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onSignup}
                className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 transform hover:-translate-y-1 hover:scale-105"
              >
                Get Started <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => onQuickNav('Marketplace')}
                className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md"
              >
                <ShoppingBag size={20} /> Marketplace
              </button>
            </div>
            
            <div className="pt-8 flex items-center gap-4">
               <div className="flex -space-x-3">
                   {[101,102,103,104].map(i => (
                       <img key={i} src={`https://picsum.photos/id/${i}/100/100`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                   ))}
               </div>
               <div className="text-sm font-bold text-slate-500">
                   Joined by <span className="text-slate-900">10,000+</span> pet parents
               </div>
            </div>
          </div>
          
          <div className="relative animate-fade-in perspective-1000">
             {/* Floating Cards */}
             <div className="absolute top-0 right-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white z-20 animate-bounce-slow">
                 <div className="flex items-center gap-3">
                     <img src="https://picsum.photos/id/237/100/100" className="w-12 h-12 rounded-xl object-cover" />
                     <div>
                         <p className="font-black text-slate-800 text-sm">Barnaby</p>
                         <p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={10} /> Health Check: 100%</p>
                     </div>
                 </div>
             </div>

             <div className="absolute bottom-20 -left-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white z-20 animate-bounce-delayed max-w-[200px]">
                 <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Heart size={16} fill="currentColor" /></div>
                     <p className="font-bold text-slate-800 text-xs uppercase">Upcoming</p>
                 </div>
                 <p className="text-sm font-bold text-slate-700 leading-tight">Vaccination with Dr. Sarah at 2:00 PM</p>
             </div>

             <img 
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Hero" 
                className="rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-white transform rotate-2 hover:rotate-1 transition-transform duration-700"
             />
          </div>
        </div>
      </header>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Everything, Connected.</h2>
                  <p className="text-lg text-slate-500">We've dismantled the fragmented pet care industry and rebuilt it into a cohesive, intelligent ecosystem.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                  {/* Feature 1: Vet */}
                  <div className="md:col-span-2 bg-slate-50 rounded-3xl p-8 relative overflow-hidden group hover:bg-slate-100 transition-colors border border-slate-100">
                      <div className="absolute top-8 left-8 z-10 max-w-xs">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-teal-600"><Shield size={24} /></div>
                          <h3 className="text-3xl font-black text-slate-900 mb-2">Vet-on-Demand</h3>
                          <p className="text-slate-500 font-medium">Book home visits or telehealth consults instantly. No more waiting rooms.</p>
                          <button onClick={() => onQuickNav('Services')} className="mt-6 px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Book Now</button>
                      </div>
                      <img src="https://images.unsplash.com/photo-1623366302587-bdb1b1f86aec?auto=format&fit=crop&w=800&q=80" className="absolute -right-20 -bottom-20 w-[400px] h-[400px] object-cover rounded-full border-8 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  {/* Feature 2: Marketplace */}
                  <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden text-white group">
                       <div className="relative z-10">
                           <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-4"><ShoppingBag size={24} /></div>
                           <h3 className="text-2xl font-black mb-2">Quick Market</h3>
                           <p className="text-slate-400 text-sm">1-hour delivery for food & essentials.</p>
                       </div>
                       <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent z-0"></div>
                       <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=80" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity -z-10" />
                  </div>

                  {/* Feature 3: Community */}
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-3xl p-8 relative overflow-hidden border border-rose-100 group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-rose-500"><Users size={24} /></div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">Community Hub</h3>
                      <p className="text-slate-600 text-sm mb-4">Join breed meetups and local events.</p>
                      <div className="flex -space-x-2">
                          {[1,2,3].map(i => <img key={i} src={`https://picsum.photos/id/${100+i}/50/50`} className="w-8 h-8 rounded-full border-2 border-white" />)}
                      </div>
                  </div>

                  {/* Feature 4: AI */}
                  <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 relative overflow-hidden group hover:shadow-xl transition-all">
                       <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                           <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider border border-purple-100 mb-4">
                                    <Zap size={12} fill="currentColor" /> Powered by Gemini
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-3">PawPal AI Assistant</h3>
                                <p className="text-slate-500 font-medium mb-6">Get instant answers about symptoms, nutrition, and training from our medically-tuned AI.</p>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3 items-center max-w-md">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0"><Zap size={16} /></div>
                                    <div className="flex-1">
                                        <div className="h-2 bg-slate-200 rounded-full w-3/4 mb-2"></div>
                                        <div className="h-2 bg-slate-200 rounded-full w-1/2"></div>
                                    </div>
                                </div>
                           </div>
                           <div className="w-full md:w-1/3 h-full bg-purple-50 rounded-2xl border-4 border-purple-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif')] bg-cover opacity-50 mix-blend-multiply"></div>
                           </div>
                       </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Statistics Strip */}
      <div className="bg-slate-900 py-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            {[
              { label: "Happy Pets", value: "15k+" },
              { label: "Vet Specialists", value: "500+" },
              { label: "Monthly Events", value: "120+" },
              { label: "Support", value: "24/7" }
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
              </div>
            ))}
         </div>
      </div>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10">
         <div className="max-w-7xl mx-auto px-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                 <div className="col-span-1 md:col-span-1">
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
                     <h4 className="font-bold text-slate-900 mb-6">Services</h4>
                     <ul className="space-y-4 text-sm text-slate-500 font-medium">
                         <li><a href="#" className="hover:text-teal-600 transition-colors">Veterinary Care</a></li>
                         <li><a href="#" className="hover:text-teal-600 transition-colors">Dog Walking</a></li>
                         <li><a href="#" className="hover:text-teal-600 transition-colors">Pet Grooming</a></li>
                         <li><a href="#" className="hover:text-teal-600 transition-colors">Pet Insurance</a></li>
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
                     <button onClick={onAdminLogin} className="hover:text-slate-600">Admin Portal</button>
                 </div>
             </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;

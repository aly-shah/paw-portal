
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { Product, CartItem } from '../types';
import { ShoppingCart, Heart, Plus, Search, X, Star, CheckCircle, Trash2, Minus, ShoppingBag, CreditCard, ArrowRight, Filter, Tag, Truck, RotateCcw, Banknote, MapPin, Pencil, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePawData } from '../contexts/PawDataContext';
import { api } from '../services/api';

const DELIVERY_FEE = 250;          // flat COD delivery fee (PKR)
const FREE_DELIVERY_OVER = 5000;   // free delivery above this subtotal
const addrInput = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500';

interface MarketplaceProps {
    initialCategory?: string;
}

const Marketplace: React.FC<MarketplaceProps> = ({ initialCategory }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [checkoutStep, setCheckoutStep] = useState<'CART' | 'CHECKOUT' | 'SUCCESS'>('CART');
  const [sortOption, setSortOption] = useState('POPULAR');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [modalQty, setModalQty] = useState(1);
  const [subscribe, setSubscribe] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { user } = useAuth();
  const { earnPoints } = usePawData();
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [address, setAddress] = useState({ name: '', phone: '', line: '', city: '' });
  const [editingAddress, setEditingAddress] = useState(false);
  const cartLoaded = useRef(false);

  // Load the persisted cart + saved delivery address for this user.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [carts, addrs] = await Promise.all([
          api.list<any>('user', 'cart'),
          api.list<any>('user', 'shippingAddress'),
        ]);
        if (cancelled) return;
        if (Array.isArray(carts[0]?.items)) setCart(carts[0].items);
        const a = addrs[0];
        setAddress({
          name: a?.name || user.name || '',
          phone: a?.phone || '',
          line: a?.line || '',
          city: a?.city || '',
        });
        if (!a || !a.line) setEditingAddress(true);
      } catch { /* keep empty cart/address */ } finally {
        cartLoaded.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Persist the cart whenever it changes (after the initial load).
  useEffect(() => {
    if (!cartLoaded.current) return;
    api.create('user', 'cart', { id: 'active', items: cart }).catch(() => {});
  }, [cart]);

  const showToast = (msg: string) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2500);
  };

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setWishlist(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  // Reset quick-view modal controls whenever a new product is opened
  useEffect(() => {
      setModalQty(1);
      setSubscribe(false);
  }, [selectedProduct]);

  const HERO_SLIDES = [
      { title: "Premium Nutrition", subtitle: "Get 20% off your first Royal Canin order.", color: "from-indigo-900 to-purple-900", tag: "Top Deal" },
      { title: "Summer Essentials", subtitle: "Cooling mats and hydration toys for hot days.", color: "from-teal-600 to-emerald-600", tag: "Seasonal" },
      { title: "Durable Toys", subtitle: "Indestructible chews for power chewers.", color: "from-rose-600 to-orange-600", tag: "New Arrival" },
  ];

  // Hero Carousel
  useEffect(() => {
      const interval = setInterval(() => {
          setHeroIndex(prev => (prev + 1) % HERO_SLIDES.length);
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (initialCategory) setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Filter & Sort Logic
  const filteredProducts = MOCK_PRODUCTS.filter(p => {
      const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
  }).sort((a, b) => {
      if (sortOption === 'PRICE_LOW') return a.price - b.price;
      if (sortOption === 'PRICE_HIGH') return b.price - a.price;
      if (sortOption === 'RATING') return b.rating - a.rating;
      return 0; // Popular / Default
  });

  // Cart Actions
  const addToCart = (product: Product, qty: number = 1) => {
      setCart(prev => {
          const existing = prev.find(item => item.id === product.id);
          if (existing) {
              return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
          }
          return [...prev, { ...product, quantity: qty }];
      });
      setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) {
              const newQty = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQty };
          }
          return item;
      }));
  };

  const removeFromCart = (id: string) => {
      setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = cart.length === 0 || cartTotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  const orderTotal = cartTotal + deliveryFee;

  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
  };

  // Place a real, persisted order. Cash on Delivery is the live payment method.
  const placeOrder = async () => {
      if (cart.length === 0) return;
      if (paymentMethod === 'CARD') {
          showToast('Card payments are coming soon — please choose Cash on Delivery.');
          return;
      }
      if (!address.name.trim() || !address.phone.trim() || !address.line.trim()) {
          showToast('Please complete your delivery address first.');
          setEditingAddress(true);
          return;
      }
      setPlacing(true);
      const order = {
          id: `ord-${Date.now()}`,
          items: cart,
          subtotal: cartTotal,
          deliveryFee,
          total: orderTotal,
          paymentMethod, // 'COD'
          address,
          status: 'PENDING',
          placedAt: new Date().toISOString(),
      };
      try {
          await api.create('user', 'orders', order);
          await api.create('user', 'shippingAddress', { id: 'me', ...address }); // remember for next time
          await api.create('user', 'cart', { id: 'active', items: [] });          // clear persisted cart
          // Reward the purchase: 1 Paw Point per PKR 100 spent.
          const earned = Math.floor(orderTotal / 100);
          if (earned > 0) earnPoints('PURCHASE', `Order ${order.id}`, earned);
          setLastOrder({ ...order, earnedPoints: earned });
          setCart([]);
          setCheckoutStep('SUCCESS');
      } catch {
          showToast('Could not place your order. Please try again.');
      } finally {
          setPlacing(false);
      }
  };

  return (
    <div className="relative min-h-screen pb-20">
      
      {/* Hero Section */}
       <div className={`relative rounded-3xl overflow-hidden shadow-xl mb-6 transition-colors duration-700 bg-gradient-to-r ${HERO_SLIDES[heroIndex].color} text-white h-64 flex items-center`}>
          <div className="relative z-10 px-10 max-w-2xl animate-fade-in">
             <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/30 inline-block mb-4">
                 {HERO_SLIDES[heroIndex].tag}
             </span>
             <h2 className="text-4xl font-black mb-3 leading-tight">{HERO_SLIDES[heroIndex].title}</h2>
             <p className="text-lg text-white/80 mb-6">{HERO_SLIDES[heroIndex].subtitle}</p>
             <button
                 onClick={() => {
                     setActiveCategory('ALL');
                     setSearchQuery('');
                     document.getElementById('marketplace-grid')?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-transform hover:scale-105 shadow-lg">
                 Shop Now
             </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          
          {/* Dots */}
          <div className="absolute bottom-6 right-10 flex gap-2">
              {HERO_SLIDES.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setHeroIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === heroIndex ? 'bg-white w-6' : 'bg-white/40'}`} 
                  />
              ))}
          </div>
      </div>

      {/* Controls Bar - Now Below Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm">
         <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
             {/* Search */}
             <div className="relative w-full md:w-96">
                 <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                 <input 
                    type="text" 
                    placeholder="Search for food, toys, brands..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl outline-none transition-all font-medium"
                 />
             </div>

             {/* Filters */}
             <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                 {['ALL', 'Food', 'Toy', 'Accessory', 'Health', 'Grooming'].map(cat => (
                     <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                            activeCategory === cat 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                     >
                         {cat === 'ALL' ? 'All Items' : cat}
                     </button>
                 ))}
             </div>

             {/* Sort & Cart Trigger */}
             <div className="flex items-center gap-3 w-full md:w-auto">
                 <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                 >
                     <option value="POPULAR">Popular</option>
                     <option value="PRICE_LOW">Price: Low to High</option>
                     <option value="PRICE_HIGH">Price: High to Low</option>
                     <option value="RATING">Top Rated</option>
                 </select>
                 
                 <button 
                    onClick={() => { setIsCartOpen(true); setCheckoutStep('CART'); }}
                    className="relative p-2.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                 >
                     <ShoppingBag size={20} />
                     {cart.length > 0 && (
                         <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                             {cart.reduce((a,b) => a + b.quantity, 0)}
                         </span>
                     )}
                 </button>
             </div>
         </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
          <div id="marketplace-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                  <div key={product.id} className="group bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-4 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                          <img 
                             src={product.image} 
                             alt={product.name} 
                             className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                          />
                          {product.originalPrice && (
                              <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </div>
                          )}
                          <button
                            onClick={(e) => toggleWishlist(product.id, e)}
                            className={`absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 ${wishlist.includes(product.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}>
                              <Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                          </button>
                          {product.stock < 10 && (
                              <div className="absolute bottom-2 left-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-200">
                                  Low Stock: {product.stock}
                              </div>
                          )}
                      </div>
                      
                      <div className="flex-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{product.brand}</div>
                          <h3 
                            className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 hover:text-teal-600 cursor-pointer"
                            onClick={() => setSelectedProduct(product)}
                          >
                              {product.name}
                          </h3>
                          
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 mb-3">
                              <Star size={12} fill="currentColor" /> {product.rating} <span className="text-slate-300 font-medium ml-1">({product.reviews})</span>
                          </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                          <div className="flex flex-col">
                              <span className="text-lg font-black text-slate-900">{formatCurrency(product.price)}</span>
                              {product.originalPrice && <span className="text-xs text-slate-400 line-through font-medium">{formatCurrency(product.originalPrice)}</span>}
                          </div>
                          <button 
                            onClick={() => addToCart(product)}
                            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-slate-200 hover:shadow-teal-200"
                          >
                              <Plus size={18} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="font-bold">No products found matching your search.</p>
              <button onClick={() => {setSearchQuery(''); setActiveCategory('ALL')}} className="mt-2 text-teal-600 font-bold hover:underline">Clear Filters</button>
          </div>
      )}

      {/* --- CART DRAWER --- */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Cart Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                  <ShoppingBag size={20} /> Your Cart <span className="text-sm font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">{cart.length}</span>
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={20} /></button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 relative">
              {checkoutStep === 'SUCCESS' ? (
                  <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">Order Confirmed!</h3>
                      <p className="text-slate-500 mb-6">Your order <span className="font-mono font-bold text-slate-700">#{(lastOrder?.id || '').toUpperCase()}</span> has been placed.</p>
                      {lastOrder && (
                          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
                              <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                                  <Banknote size={18} /> Cash on Delivery
                              </div>
                              <p className="text-sm text-amber-700">Please keep <span className="font-black">{formatCurrency(lastOrder.total)}</span> ready to pay the rider on delivery.</p>
                              <p className="text-xs text-amber-600 mt-2">Delivering to {lastOrder.address?.line}, {lastOrder.address?.city || ''}</p>
                          </div>
                      )}
                      {lastOrder?.earnedPoints > 0 && (
                          <p className="text-sm font-bold text-teal-600 mb-6">🐾 You earned {lastOrder.earnedPoints} Paw Points!</p>
                      )}
                      <button onClick={() => { setIsCartOpen(false); setCheckoutStep('CART'); setLastOrder(null); }} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Continue Shopping</button>
                  </div>
              ) : checkoutStep === 'CHECKOUT' ? (
                  <div className="space-y-6 animate-in slide-in-from-right">
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                          <Truck className="text-amber-600 mt-1" size={20} />
                          <div>
                              <h4 className="font-bold text-amber-800">Fast Delivery</h4>
                              <p className="text-xs text-amber-700">Est. Delivery: Tomorrow, 2:00 PM</p>
                          </div>
                      </div>
                      
                      <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5"><MapPin size={14} /> Delivery Address</h4>
                              {!editingAddress && (
                                  <button onClick={() => setEditingAddress(true)} className="text-teal-600 font-bold text-xs hover:underline flex items-center gap-1"><Pencil size={12} /> Edit</button>
                              )}
                          </div>
                          {editingAddress ? (
                              <div className="space-y-2">
                                  <input value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} placeholder="Full name" className={addrInput} />
                                  <div className="relative">
                                      <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                                      <input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="Phone number" className={`${addrInput} pl-8`} />
                                  </div>
                                  <input value={address.line} onChange={e => setAddress({ ...address, line: e.target.value })} placeholder="House / street / area" className={addrInput} />
                                  <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" className={addrInput} />
                                  <button onClick={() => setEditingAddress(false)} className="text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-700">Save address</button>
                              </div>
                          ) : (
                              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-600">
                                  <p className="font-bold text-slate-800">{address.name || 'Add your name'}</p>
                                  {address.phone && <p>{address.phone}</p>}
                                  <p>{address.line || 'Add your delivery address'}</p>
                                  {address.city && <p>{address.city}</p>}
                              </div>
                          )}
                      </div>

                      <div className="space-y-3">
                          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Payment Method</h4>
                          <button
                              onClick={() => setPaymentMethod('COD')}
                              className={`w-full p-3 border-2 rounded-xl flex items-center gap-3 text-left transition-colors ${paymentMethod === 'COD' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}
                          >
                              <Banknote className={paymentMethod === 'COD' ? 'text-teal-700' : 'text-slate-400'} />
                              <div className="flex-1">
                                  <p className={`font-bold ${paymentMethod === 'COD' ? 'text-teal-900' : 'text-slate-700'}`}>Cash on Delivery</p>
                                  <p className="text-xs text-slate-500">Pay with cash when your order arrives</p>
                              </div>
                              {paymentMethod === 'COD' && <CheckCircle size={16} className="text-teal-600" />}
                          </button>
                          <button
                              onClick={() => { setPaymentMethod('CARD'); showToast('Card payments are coming soon — Cash on Delivery is available now.'); }}
                              className={`w-full p-3 border-2 rounded-xl flex items-center gap-3 text-left transition-colors opacity-70 ${paymentMethod === 'CARD' ? 'border-slate-300 bg-slate-50' : 'border-slate-200'}`}
                          >
                              <CreditCard className="text-slate-400" />
                              <div className="flex-1">
                                  <p className="font-bold text-slate-700">Card / Online</p>
                                  <p className="text-xs text-slate-400">Coming soon</p>
                              </div>
                          </button>
                      </div>
                  </div>
              ) : (
                  // Cart Items List
                  cart.length > 0 ? (
                      <div className="space-y-4">
                          {cart.map(item => (
                              <div key={item.id} className="flex gap-4 bg-white p-2 rounded-xl border border-slate-100">
                                  <img src={item.image} className="w-20 h-20 rounded-lg object-cover bg-slate-50" />
                                  <div className="flex-1 flex flex-col justify-between">
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                                          <p className="text-xs text-slate-500">{item.brand}</p>
                                      </div>
                                      <div className="flex justify-between items-end">
                                          <div className="font-bold text-teal-600 text-sm">{formatCurrency(item.price)}</div>
                                          <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                              <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, -1) : removeFromCart(item.id)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600"><Minus size={12} /></button>
                                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm text-slate-600"><Plus size={12} /></button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                          <ShoppingBag size={48} className="mb-4 opacity-20" />
                          <p className="font-medium">Your cart is empty.</p>
                          <button onClick={() => setIsCartOpen(false)} className="mt-4 text-teal-600 font-bold text-sm hover:underline">Start Shopping</button>
                      </div>
                  )
              )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && checkoutStep !== 'SUCCESS' && (
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium">Subtotal</span>
                          <span className="font-bold text-slate-700">{formatCurrency(cartTotal)}</span>
                      </div>
                      {checkoutStep === 'CHECKOUT' && (
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-medium">Delivery</span>
                              <span className="font-bold text-slate-700">{deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}</span>
                          </div>
                      )}
                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                          <span className="text-slate-700 font-bold">Total</span>
                          <span className="text-xl font-black text-slate-800">{formatCurrency(checkoutStep === 'CHECKOUT' ? orderTotal : cartTotal)}</span>
                      </div>
                  </div>

                  {checkoutStep === 'CART' ? (
                      <button
                        onClick={() => setCheckoutStep('CHECKOUT')}
                        className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                          Proceed to Checkout <ArrowRight size={18} />
                      </button>
                  ) : (
                       <div className="flex gap-3">
                           <button onClick={() => setCheckoutStep('CART')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-white">Back</button>
                           <button onClick={placeOrder} disabled={placing} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 disabled:opacity-60 flex items-center justify-center gap-2"><Banknote size={18} /> {placing ? 'Placing…' : 'Place Order'}</button>
                       </div>
                  )}
              </div>
          )}
      </div>

      {/* --- PRODUCT QUICK VIEW MODAL --- */}
      {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 relative max-h-[90vh]">
                  <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white text-slate-500 z-10"><X size={20}/></button>
                  
                  {/* Image Side */}
                  <div className="w-full md:w-1/2 bg-slate-100 relative p-8 flex items-center justify-center">
                       <img src={selectedProduct.image} className="w-full object-contain max-h-80 mix-blend-multiply" />
                       {selectedProduct.tags && (
                           <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                               {selectedProduct.tags.map(tag => (
                                   <span key={tag} className="px-2 py-1 bg-white/80 backdrop-blur text-[10px] font-bold rounded text-slate-600 uppercase border border-white/50">{tag}</span>
                               ))}
                           </div>
                       )}
                  </div>

                  {/* Info Side */}
                  <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                      <div className="mb-1 text-xs font-bold text-teal-600 uppercase tracking-wider">{selectedProduct.brand}</div>
                      <h2 className="text-2xl font-black text-slate-800 mb-2">{selectedProduct.name}</h2>
                      
                      <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                              <Star fill="currentColor" size={16} /> {selectedProduct.rating}
                          </div>
                          <span className="text-slate-300 text-sm">|</span>
                          <span className="text-sm text-slate-500 font-medium">{selectedProduct.reviews} Reviews</span>
                      </div>

                      <div className="flex items-end gap-3 mb-6">
                          <span className="text-3xl font-black text-slate-900">{formatCurrency(selectedProduct.price)}</span>
                          {selectedProduct.originalPrice && (
                              <span className="text-lg text-slate-400 line-through mb-1 font-medium">{formatCurrency(selectedProduct.originalPrice)}</span>
                          )}
                      </div>

                      <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                          {selectedProduct.description}
                      </p>

                      {/* Subscribe Toggle */}
                      <div onClick={() => setSubscribe(s => !s)} className="mb-8 p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/50 flex items-start gap-3 cursor-pointer hover:bg-indigo-50 transition-colors">
                          <div className="mt-1"><RotateCcw className="text-indigo-600" size={20} /></div>
                          <div>
                              <h4 className="font-bold text-indigo-900 text-sm">Subscribe & Save 10%</h4>
                              <p className="text-xs text-indigo-600 mt-1">Get this delivered every 4 weeks. Cancel anytime.</p>
                          </div>
                          <div className="ml-auto">
                               <input type="checkbox" checked={subscribe} onChange={() => setSubscribe(s => !s)} onClick={(e) => e.stopPropagation()} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-indigo-300" />
                          </div>
                      </div>

                      <div className="mt-auto flex gap-3">
                          <div className="flex items-center border border-slate-200 rounded-xl">
                              <button onClick={() => setModalQty(q => Math.max(1, q - 1))} className="px-3 py-3 text-slate-500 hover:bg-slate-50 rounded-l-xl"><Minus size={18} /></button>
                              <span className="px-2 font-bold text-slate-800">{modalQty}</span>
                              <button onClick={() => setModalQty(q => q + 1)} className="px-3 py-3 text-slate-500 hover:bg-slate-50 rounded-r-xl"><Plus size={18} /></button>
                          </div>
                          <button
                            onClick={() => { addToCart(selectedProduct, modalQty); setSelectedProduct(null); }}
                            className="flex-1 bg-slate-900 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-lg"
                          >
                              Add to Cart
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Overlay for cart drawer */}
      {isCartOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsCartOpen(false)} />}

      {/* Toast Notification */}
      {toast && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-[60] animate-in slide-in-from-bottom-5 fade-in flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400" />
              <p className="text-sm font-bold">{toast}</p>
          </div>
      )}
    </div>
  );
};

export default Marketplace;

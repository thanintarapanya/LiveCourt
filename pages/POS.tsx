import React, { useState } from 'react';
import { GlassCard, NeonButton } from '../components/UI';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Coffee, Package, Tag, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Drinks' | 'Snacks' | 'Accessories';
  stock: number;
  imageColor: string;
}

interface CartItem extends Product {
  quantity: number;
}

// --- Mock Data ---
const products: Product[] = [
  { id: '1', name: 'Gatorade Blue', price: 40, category: 'Drinks', stock: 50, imageColor: 'bg-blue-100 text-blue-500' },
  { id: '2', name: 'Water Bottle', price: 15, category: 'Drinks', stock: 100, imageColor: 'bg-cyan-100 text-cyan-500' },
  { id: '3', name: 'Coke Zero', price: 25, category: 'Drinks', stock: 40, imageColor: 'bg-red-100 text-red-500' },
  { id: '4', name: 'Protein Bar', price: 60, category: 'Snacks', stock: 30, imageColor: 'bg-orange-100 text-orange-500' },
  { id: '5', name: 'Lay\'s Chips', price: 30, category: 'Snacks', stock: 25, imageColor: 'bg-yellow-100 text-yellow-600' },
  { id: '6', name: 'Yonex Grip', price: 120, category: 'Accessories', stock: 15, imageColor: 'bg-purple-100 text-purple-500' },
  { id: '7', name: 'Wristband', price: 150, category: 'Accessories', stock: 10, imageColor: 'bg-indigo-100 text-indigo-500' },
  { id: '8', name: 'Socks', price: 100, category: 'Accessories', stock: 20, imageColor: 'bg-gray-100 text-gray-500' },
];

const POS: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const filteredProducts = products.filter(p => {
    return (activeCategory === 'All' || p.category === activeCategory) && 
           p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = subtotal * 0.07;
  const total = subtotal + vat;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Left Side: Product Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div>
            <h2 className="text-2xl font-light text-gray-900">Point of Sale</h2>
            <p className="text-gray-500 text-sm">Select items to add to the current order.</p>
          </div>
          <div className="relative group w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 shrink-0">
          {['All', 'Drinks', 'Snacks', 'Accessories'].map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                 activeCategory === cat 
                   ? 'bg-brand-black text-white' 
                   : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
               }`}
             >
               {cat}
             </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-2">
           {filteredProducts.map(product => (
             <GlassCard 
               key={product.id} 
               className="p-4 cursor-pointer hover:border-brand-orange/50 group active:scale-95 transition-all"
               onClick={() => addToCart(product)}
             >
               <div className={`h-24 rounded-lg mb-3 flex items-center justify-center ${product.imageColor}`}>
                 {product.category === 'Drinks' ? <Coffee size={32} /> : 
                  product.category === 'Snacks' ? <Package size={32} /> : <Tag size={32} />}
               </div>
               <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
               <div className="flex justify-between items-center mt-1">
                 <span className="text-sm font-bold text-gray-900">฿{product.price}</span>
                 <span className="text-xs text-gray-400">{product.stock} in stock</span>
               </div>
             </GlassCard>
           ))}
        </div>
      </div>

      {/* Right Side: Cart */}
      <GlassCard className="w-full lg:w-[400px] flex flex-col shrink-0 !p-0 overflow-hidden bg-white">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={18} className="text-brand-orange"/> Current Order
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-60">
              <ShoppingCart size={48} />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                 <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs ${item.imageColor}`}>
                      {item.name.substring(0,2).toUpperCase()}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-900 truncate w-24">{item.name}</p>
                     <p className="text-xs text-gray-500">฿{item.price * item.quantity}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                      <button onClick={(e) => {e.stopPropagation(); updateQuantity(item.id, -1)}} className="p-1 hover:bg-white rounded-md transition-colors"><Minus size={12} /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={(e) => {e.stopPropagation(); updateQuantity(item.id, 1)}} className="p-1 hover:bg-white rounded-md transition-colors"><Plus size={12} /></button>
                    </div>
                    <button onClick={(e) => {e.stopPropagation(); removeFromCart(item.id)}} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
           <div className="space-y-1 text-sm">
             <div className="flex justify-between text-gray-500">
               <span>Subtotal</span>
               <span>฿{subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-gray-500">
               <span>VAT (7%)</span>
               <span>฿{vat.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
               <span>Total</span>
               <span>฿{total.toFixed(0)}</span>
             </div>
           </div>

           <NeonButton className="w-full justify-center" icon={<CreditCard size={18} />} disabled={cart.length === 0}>
             Proceed to Payment
           </NeonButton>
        </div>
      </GlassCard>
    </div>
  );
};

export default POS;
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import Button from './Button';
import Input from './Input';
import { 
  PieChart, Sparkles, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2, 
  DollarSign, Zap, Activity, CreditCard, Plus, ArrowUpRight, ArrowDownLeft,
  Users, BarChart3, Smartphone, Lock, Star, Menu, X, ChevronDown 
} from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'landing' | 'login' | 'register';

// --- Helper Components ---

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ children, delay = 0, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const CountUp = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasStarted) {
        setHasStarted(true);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// Extracted to prevent state reset on parent re-render
const InteractiveDemoWidget = ({ mousePos }: { mousePos: { x: number, y: number } }) => {
  const [balance, setBalance] = useState(2450.00);
  const [demoInput, setDemoInput] = useState('');
  const [transactions, setTransactions] = useState([
    { id: 1, label: 'Freelance', amount: 850, type: 'income', date: 'Just now' },
    { id: 2, label: 'Grocery Store', amount: -120, type: 'expense', date: '2h ago' },
    { id: 3, label: 'Coffee Shop', amount: -5.50, type: 'expense', date: '5h ago' },
  ]);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput) return;

    const amountMatch = demoInput.match(/(\d+(\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : 10;
    const isExpense = !demoInput.toLowerCase().includes('income') && !demoInput.toLowerCase().includes('deposit');
    
    const newTransaction = {
      id: Date.now(),
      label: demoInput.replace(/(\d+(\.\d+)?)/, '').replace('$','').trim() || 'New Item',
      amount: isExpense ? -amount : amount,
      type: isExpense ? 'expense' : 'income',
      date: 'Just now'
    };

    setTransactions([newTransaction, ...transactions.slice(0, 3)]);
    setBalance(prev => prev + newTransaction.amount);
    setDemoInput('');
  };

  return (
    <div 
      className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 p-8 transform transition-transform duration-100 ease-out preserve-3d"
      style={{
          transform: `rotateY(${mousePos.x * 15}deg) rotateX(${mousePos.y * -15}deg)`,
      }}
    >
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-10"></div>
      <div className="relative z-20 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Current Balance</div>
              <div className="text-4xl font-extrabold text-gray-900 tracking-tight transition-all duration-300">
                  ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="h-24 flex items-end justify-between gap-2 mb-8 px-1">
              <AnimatePresence>
                {transactions.map((t, i) => {
                    const height = Math.min(100, Math.abs(t.amount) / 10);
                    return (
                        <motion.div 
                          key={t.id} 
                          layout
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0 }}
                          transition={{ duration: 0.4 }}
                          className="w-full bg-gray-100 rounded-t-lg relative group overflow-hidden h-full flex items-end origin-bottom"
                        >
                             <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                                className={`w-full rounded-t-lg ${t.type === 'income' ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                             ></motion.div>
                        </motion.div>
                    )
                })}
              </AnimatePresence>
              {[...Array(Math.max(0, 7 - transactions.length))].map((_, i) => (
                <motion.div key={`empty-${i}`} layout className="w-full bg-gray-100 rounded-t-lg h-8"></motion.div>
              ))}
          </div>

          <div className="space-y-3 mb-6">
              <AnimatePresence>
                {transactions.slice(0, 3).map((t) => (
                    <motion.div 
                      key={t.id} 
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{t.label}</p>
                                <p className="text-xs text-gray-400">{t.date}</p>
                            </div>
                        </div>
                        <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                            {t.amount > 0 ? '+' : ''}{t.amount}
                        </span>
                    </motion.div>
                ))}
              </AnimatePresence>
          </div>

          <form onSubmit={handleDemoSubmit} className="mt-auto relative">
              <input 
                  type="text" 
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Try it: 'Lunch $25'..." 
                  className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow shadow-inner"
              />
              <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                  <Plus size={18} />
              </button>
          </form>
      </div>
    </div>
  );
};

// --- Main Component ---

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Animation States
  const [heroText, setHeroText] = useState('');
  const fullHeroText = "Master Your Money with SmartSpend";
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setHeroText(fullHeroText.slice(0, index + 1));
      index++;
      if (index === fullHeroText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (mode === 'login') {
        response = await StorageService.login(email, password);
      } else {
        if (!username) throw new Error("Username is required");
        response = await StorageService.register(username, email, password);
      }
      onLogin(response.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Render functions instead of components to avoid unmounting on parent re-render
  const renderLandingView = () => (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-deep-indigo via-indigo-900 to-black text-white" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} ref={containerRef}>
      {/* Moving Grid Background & Stars */}
      <div className="absolute inset-0 bg-grid z-0 opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 stars opacity-40 pointer-events-none"></div>

      {/* Floating Currency Icons (Parallax) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-electric-blue/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 40 + 20}px`,
            }}
            animate={{
              y: [0, -30, 0],
              x: mousePos.x * (Math.random() * 50 + 20),
              rotate: mousePos.y * (Math.random() * 50 + 20) + (Math.random() * 360),
            }}
            transition={{
              y: { repeat: Infinity, duration: Math.random() * 5 + 5, ease: "easeInOut" },
              x: { type: "spring", stiffness: 20 },
              rotate: { type: "spring", stiffness: 20 }
            }}
          >
            {i % 2 === 0 ? <DollarSign /> : '🪙'}
          </motion.div>
        ))}
      </div>

      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-electric-blue rounded-xl flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(0,191,255,0.5)] group-hover:rotate-12 transition-transform duration-300">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">SmartSpend</span>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgb(255,255,255)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('login')}
              className="text-gray-300 font-bold hover:text-white transition-all hidden sm:block px-4 py-2"
            >
              Log In
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 191, 255, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('register')}
              className="bg-electric-blue text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-400 transition-all shadow-[0_0_10px_rgba(0,191,255,0.3)]"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-grow flex items-center">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl max-h-[600px] pointer-events-none z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-electric-blue rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
          <div className="space-y-8 relative z-10">
            <ScrollReveal>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                className="inline-flex items-center px-4 py-2 rounded-full glass border border-electric-blue/30 text-electric-blue text-sm font-semibold shadow-[0_0_10px_rgba(0,191,255,0.2)] mb-4 cursor-default"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <Sparkles className="w-4 h-4 mr-2 text-electric-blue" />
                </motion.div>
                <span>Experimental AI Finance</span>
              </motion.div>
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight min-h-[160px]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-purple-400 to-pink-400">
                  {heroText}
                  <span className="animate-pulse text-electric-blue">|</span>
                </span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal delay={400}>
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Experience the future of financial tracking. Real-time analytics, automated categorization, and personalized insights powered by Gemini AI.
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={600}>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('register')}
                  className="group relative px-8 py-4 bg-electric-blue text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(0,191,255,0.5)] hover:shadow-[0_0_30px_rgba(0,191,255,0.8)] transition-all overflow-hidden animate-pulse-glow"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                  <span className="flex items-center justify-center relative z-10">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('login')}
                  className="px-8 py-4 glass text-white border border-white/20 rounded-xl font-bold text-lg transition-all flex items-center justify-center hover:border-white/40"
                >
                  Sign In
                </motion.button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={800}>
              <div className="pt-8 flex items-center gap-6 text-sm text-gray-400 font-medium">
                <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-electric-blue" /> No credit card required</div>
                <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-electric-blue" /> Local-first Encryption</div>
              </div>
            </ScrollReveal>
          </div>

          <div className="relative hidden lg:block perspective-1000 h-[600px] flex items-center justify-center">
             <motion.div 
                className="absolute top-10 right-10 p-4 glass-card rounded-2xl z-20"
                animate={{ 
                  y: [0, -15, 0],
                  x: mousePos.x * 20,
                  rotate: mousePos.x * 10
                }}
                transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut" }, x: { type: "spring", stiffness: 50 }, rotate: { type: "spring", stiffness: 50 } }}
             >
                <Activity className="w-8 h-8 text-electric-blue" />
             </motion.div>
             <motion.div 
                className="absolute bottom-20 left-10 p-4 glass-card rounded-2xl z-20"
                animate={{ 
                  y: [0, 15, 0],
                  x: mousePos.y * 20,
                  rotate: mousePos.y * -10
                }}
                transition={{ y: { repeat: Infinity, duration: 5, ease: "easeInOut" }, x: { type: "spring", stiffness: 50 }, rotate: { type: "spring", stiffness: 50 } }}
             >
                <CreditCard className="w-8 h-8 text-purple-400" />
             </motion.div>
             <InteractiveDemoWidget mousePos={mousePos} />
          </div>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="w-full overflow-hidden bg-white/40 backdrop-blur-sm border-y border-gray-200 py-8 relative z-20 group">
          <div className="flex w-[200%] animate-marquee group-hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex justify-around w-full">
                       {['Secure', 'Private', 'Intelligent', 'Fast', 'Mobile-First', 'Analytics', 'Automated', 'Real-time'].map((text, i) => (
                           <motion.div 
                             key={i} 
                             whileHover={{ scale: 1.1, color: '#4f46e5' }}
                             className="flex items-center text-gray-400 font-bold uppercase tracking-widest text-sm px-8 cursor-default transition-colors"
                           >
                               <Sparkles className="w-4 h-4 mr-2 text-indigo-400" />
                               {text}
                           </motion.div>
                       ))}
                  </div>
              ))}
          </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Everything you need to <br/>take control</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">SmartSpend brings together powerful tracking, intelligent insights, and effortless management in one beautiful interface.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={100}>
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group p-8 glass-card rounded-2xl h-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <motion.div 
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 bg-electric-blue/20 rounded-2xl flex items-center justify-center text-electric-blue mb-6 transition-colors group-hover:bg-electric-blue group-hover:text-white border border-electric-blue/30"
                  >
                    <TrendingUp className="w-7 h-7" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3">Smart Tracking</h3>
                  <p className="text-gray-400 leading-relaxed">Effortlessly log daily spending. Our system learns your habits to categorize transactions automatically.</p>
                </div>
              </motion.div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group p-8 glass-card rounded-2xl h-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <motion.div 
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6 transition-colors group-hover:bg-purple-500 group-hover:text-white border border-purple-500/30"
                  >
                    <Sparkles className="w-7 h-7" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3">Gemini AI Insights</h3>
                  <p className="text-gray-400 leading-relaxed">Get personalized financial advice. Our AI analyzes your spending DNA to find savings opportunities.</p>
                </div>
              </motion.div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group p-8 glass-card rounded-2xl h-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <motion.div 
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 transition-colors group-hover:bg-emerald-500 group-hover:text-white border border-emerald-500/30"
                  >
                    <ShieldCheck className="w-7 h-7" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3">Bank-Grade Security</h3>
                  <p className="text-gray-400 leading-relaxed">Your data is encrypted locally. We prioritize your privacy with a local-first architecture.</p>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <ScrollReveal>
             <div className="text-center mb-16">
               <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">How it works</h2>
               <p className="text-lg text-gray-400">Start your journey to financial freedom in three simple steps.</p>
             </div>
           </ScrollReveal>

           <div className="relative">
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-electric-blue/20 via-purple-500/50 to-electric-blue/20 -translate-y-1/2 z-0"></div>

             <div className="grid md:grid-cols-3 gap-12 relative z-10">
                {[
                  { icon: <Users />, title: "Create Account", desc: "Sign up in seconds. No credit card required.", step: 1 },
                  { icon: <Plus />, title: "Add Transactions", desc: "Log your income and expenses manually or via AI voice.", step: 2 },
                  { icon: <BarChart3 />, title: "Get Insights", desc: "Visualize your spending and get AI recommendations.", step: 3 }
                ].map((item, idx) => (
                  <ScrollReveal key={idx} delay={idx * 200}>
                    <motion.div 
                      whileHover={{ y: -10 }}
                      className="group flex flex-col items-center text-center glass-card p-8 rounded-3xl transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-electric-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <motion.div 
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 bg-deep-indigo text-electric-blue border border-electric-blue/50 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(0,191,255,0.3)] relative z-10 group-hover:bg-electric-blue group-hover:text-white transition-colors"
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { className: "w-8 h-8" })}
                        <motion.div 
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          className="absolute -top-4 -right-4 w-10 h-10 bg-[#0f0c29] border-2 border-electric-blue rounded-full flex items-center justify-center text-electric-blue font-extrabold text-base shadow-lg"
                        >
                          {item.step}
                        </motion.div>
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-3 relative z-10 group-hover:text-electric-blue transition-colors">{item.title}</h3>
                      <p className="text-gray-400 leading-relaxed relative z-10">{item.desc}</p>
                    </motion.div>
                  </ScrollReveal>
                ))}
             </div>
           </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-20 relative overflow-hidden text-white border-y border-white/10 glass">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-white">By the Numbers</h2>
                <p className="text-gray-400 mt-2">Join a growing community of smart spenders.</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
               <ScrollReveal>
                 <div className="p-4">
                    <div className="text-4xl lg:text-5xl font-extrabold mb-2 text-electric-blue drop-shadow-[0_0_10px_rgba(0,191,255,0.5)]">
                      <CountUp end={50} suffix="K+" />
                    </div>
                    <div className="text-gray-300 font-medium">Active Users</div>
                 </div>
               </ScrollReveal>
               <ScrollReveal delay={100}>
                 <div className="p-4">
                    <div className="text-4xl lg:text-5xl font-extrabold mb-2 text-electric-blue drop-shadow-[0_0_10px_rgba(0,191,255,0.5)]">
                      <CountUp end={2} suffix="M+" />
                    </div>
                    <div className="text-gray-300 font-medium">Transactions Tracked</div>
                 </div>
               </ScrollReveal>
               <ScrollReveal delay={200}>
                 <div className="p-4">
                    <div className="text-4xl lg:text-5xl font-extrabold mb-2 text-electric-blue drop-shadow-[0_0_10px_rgba(0,191,255,0.5)]">
                      <CountUp end={98} suffix="%" />
                    </div>
                    <div className="text-gray-300 font-medium">Customer Satisfaction</div>
                 </div>
               </ScrollReveal>
               <ScrollReveal delay={300}>
                 <div className="p-4">
                    <div className="text-4xl lg:text-5xl font-extrabold mb-2 text-electric-blue drop-shadow-[0_0_10px_rgba(0,191,255,0.5)]">
                      <CountUp end={24} suffix="/7" />
                    </div>
                    <div className="text-gray-300 font-medium">AI Availability</div>
                 </div>
               </ScrollReveal>
            </div>
         </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <ScrollReveal>
             <div className="text-center mb-16">
               <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Loved by thousands</h2>
               <p className="text-lg text-gray-400">See what our community has to say about SmartSpend.</p>
             </div>
           </ScrollReveal>

           <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Sarah J.", role: "Freelancer", text: "The AI categorization is a game changer. I used to spend hours sorting receipts, now it happens instantly." },
                { name: "Michael T.", role: "Small Business Owner", text: "I love the privacy focus. Knowing my financial data stays local gives me peace of mind." },
                { name: "Elena R.", role: "Student", text: "SmartSpend helped me save for my first car. The visual insights made me realize where my money was going." }
              ].map((t, i) => (
                <ScrollReveal key={i} delay={i * 150}>
                   <motion.div 
                     whileHover={{ y: -5, scale: 1.02 }}
                     className="glass-card p-8 rounded-2xl relative hover:shadow-[0_0_20px_rgba(0,191,255,0.2)] transition-shadow"
                   >
                      <div className="flex text-yellow-400 mb-4 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                         {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                      </div>
                      <p className="text-gray-300 mb-6 italic">"{t.text}"</p>
                      <div className="flex items-center">
                         <div className="w-10 h-10 bg-electric-blue/20 rounded-full flex items-center justify-center font-bold text-electric-blue mr-3 border border-electric-blue/50">
                            {t.name.charAt(0)}
                         </div>
                         <div>
                            <div className="font-bold text-white">{t.name}</div>
                            <div className="text-sm text-gray-400">{t.role}</div>
                         </div>
                      </div>
                   </motion.div>
                </ScrollReveal>
              ))}
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 glass z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div 
              className="flex items-center mb-4 md:mb-0 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <PieChart className="w-6 h-6 text-electric-blue mr-2" />
              <span className="text-xl font-bold text-white">SmartSpend</span>
            </div>
            <div className="flex space-x-6">
              {['Twitter', 'GitHub', 'Discord'].map((social) => (
                <motion.a 
                  key={social}
                  href="#" 
                  whileHover={{ y: -2, color: '#00BFFF' }}
                  className="text-gray-400 transition-colors"
                >
                  {social}
                </motion.a>
              ))}
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SmartSpend. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );

  const renderAuthForm = () => (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-20 py-20 bg-gradient-to-br from-deep-indigo via-indigo-900 to-black overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-blue rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
      </div>
      <div className="absolute inset-0 bg-grid z-0 opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 stars opacity-40 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="max-w-md w-full glass-card p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden z-10"
      >
        <button 
          onClick={() => setMode('landing')}
          className="absolute top-6 left-6 text-gray-400 hover:text-electric-blue transition-colors flex items-center text-sm font-medium"
        >
           <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back
        </button>
        
        <div className="text-center mb-8 mt-6">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            onClick={() => setMode('landing')}
            className="mx-auto h-16 w-16 bg-electric-blue/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,191,255,0.3)] border border-electric-blue/50 cursor-pointer"
          >
             <PieChart className="w-8 h-8 text-electric-blue" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Join SmartSpend'}
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-medium">
            {mode === 'login' ? 'Sign in to access your dashboard' : 'Start your journey to financial freedom'}
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'register' && (
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="John Doe"
              />
            )}
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-900/50 p-4 rounded-xl border border-red-500/50 flex items-center animate-shake">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(0, 191, 255, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full py-3.5 text-lg shadow-[0_0_10px_rgba(0,191,255,0.3)] bg-electric-blue text-white rounded-xl font-bold hover:bg-blue-400 transition-all"
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </motion.button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/10">
          <p className="text-sm text-gray-400">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              className="font-bold text-electric-blue hover:text-blue-300 ml-1 transition-colors"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? "Sign up now" : "Sign in here"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0c29] relative overflow-x-hidden selection:bg-electric-blue/30 selection:text-white">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-blue rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {renderLandingView()}
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {renderAuthForm()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      {mode === 'landing' && (
        <footer className="relative z-10 bg-white border-t border-gray-200 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
               <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center mb-6">
                     <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3">
                        <PieChart className="w-5 h-5 text-white" />
                     </div>
                     <span className="text-2xl font-bold text-gray-900">SmartSpend</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
                     The intelligent way to track, manage, and grow your personal wealth using the power of Gemini AI. Join the financial revolution today.
                  </p>
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 mb-6 text-lg">Product</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                     <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                     <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                     <li><a href="#" className="hover:text-indigo-600 transition-colors">Security</a></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 mb-6 text-lg">Company</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                     <li><a href="#" className="hover:text-indigo-600 transition-colors">About Us</a></li>
                     <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                     <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
                  </ul>
               </div>
            </div>
            <div className="text-center text-gray-400 text-sm pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
              <p>© {new Date().getFullYear()} SmartSpend Inc. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
                  <a href="#" className="hover:text-indigo-600">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Auth;
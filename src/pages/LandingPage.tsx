import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  MapPin, 
  BarChart3, 
  Award, 
  ArrowRight,
  ShieldCheck,
  Upload,
  Cpu,
  LineChart,
  Recycle,
  Globe,
  Leaf,
  Menu,
  X
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden selection:bg-emerald-500/20 font-sans text-gray-900 relative">
      
      {/* Global Fixed Background Image & Fade Overlay */}
      <div 
        className="fixed inset-0 w-full h-full -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80")' }} 
      />
      <div className="fixed inset-0 w-full h-full -z-10 bg-white/85 backdrop-blur-[1px]" />

      {/* 1. Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight text-gray-900">WasteWise+</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it Works</a>
            <a href="#impact" className="hover:text-emerald-600 transition-colors">Impact</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
              Log in
            </Link>
            <Link to="/login" className="text-sm font-medium bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition-all">
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu drop down */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 px-6 py-4 flex flex-col gap-4 overflow-hidden"
            >
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 font-medium py-2">Features</a>
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 font-medium py-2">How it Works</a>
              <a href="#impact" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 font-medium py-2">Impact</a>
              <div className="h-px bg-gray-100 my-2" />
              <Link to="/login" className="text-gray-600 font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
              <Link to="/login" className="text-center font-medium bg-emerald-600 text-white px-5 py-3 rounded-xl mt-2" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32 overflow-hidden flex flex-col items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 w-full h-full -z-10">
          <div className="absolute top-0 right-[10%] w-[600px] h-[600px] bg-emerald-100/50 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
          <div className="absolute -top-20 -left-[10%] w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-[100px] mix-blend-multiply opacity-70" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-[900px] mx-auto">
            
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mb-8 text-sm font-semibold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              v2.0 Live
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight text-slate-900 mb-8 leading-[1.1] pb-2">
              Smart Waste Governance <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform public sanitation through AI-based waste detection, real-time compliance tracking, and highly engaging gamified citizen participation.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <button className="h-14 px-8 text-lg rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 font-semibold flex items-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <a href="#how-it-works">
                <button className="h-14 px-8 text-lg rounded-full bg-white border border-gray-200 text-slate-700 shadow-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-300 font-medium">
                  Learn More
                </button>
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Preview Image */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 mx-auto max-w-5xl rounded-[2rem] border border-gray-200/50 bg-white/40 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-3 relative overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=2000&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="rounded-3xl object-cover h-[500px] w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* 3. Features Grid Section */}
      <section id="features" className="py-32 bg-white/40 backdrop-blur-3xl border-t border-white/50 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6 text-slate-900 tracking-tight">Intelligent Platform Features</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">Everything you need to monitor, manage, and profoundly optimize your municipal waste infrastructure.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { title: "AI Waste Detection", icon: Bot, desc: "Computer vision algorithms detect specific waste types and anomalies instantly with 98% accuracy." },
              { title: "Complaint Reporting", icon: MapPin, desc: "Easy geo-tagged citizen reporting with automated routing to the exact right local authorities." },
              { title: "Waste Tracking System", icon: TruckIcon, desc: "Real-time municipal fleet workflow tracking and critical bin fill-level monitoring." },
              { title: "Compliance & Rewards", icon: Award, desc: "Gamified civic engagement that incentivizes and rewards responsible community ecological habits." },
              { title: "Analytics Dashboard", icon: BarChart3, desc: "High-level macro insights to dynamically optimize collection routes and profoundly improve budgeting." },
              { title: "Secure Governance", icon: ShieldCheck, desc: "Enterprise-grade scalable auditing and transparent role-based access controls across the board." }
            ].map((Feature, i) => (
              <motion.div 
                variants={fadeIn}
                key={i} 
                className="group p-10 rounded-[2rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-8 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Feature.icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 tracking-tight">{Feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{Feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-32 bg-transparent relative">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6 text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-lg text-slate-600 leading-relaxed">A seamless pipeline from citizen interaction to significantly improved civic governance.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-[50px] left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-100 z-0" />
            <div className="flex flex-col md:flex-row items-start justify-between gap-12 md:gap-4 relative z-10">
              {[
                { step: 1, icon: Upload, title: "Citizen Interaction", desc: "Users snap photos or report community issues" },
                { step: 2, icon: Cpu, title: "AI Processing", desc: "Models classify waste structure and assess urgency" },
                { step: 3, icon: LineChart, title: "Scoring & Routing", desc: "System assigns civic rewards and dispatches teams" },
                { step: 4, icon: Recycle, title: "Cleaner Environment", desc: "Transparent robust tracking ensures swift resolution" }
              ].map((item, index) => (
                <div key={index} className="flex-1 w-full text-center relative group">
                  <div className="w-[100px] h-[100px] mx-auto rounded-full bg-white border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mb-6 relative z-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:border-emerald-100 group-hover:scale-105 transition-all duration-300">
                    <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shadow-lg border-2 border-white">
                      {item.step}
                    </span>
                    <item.icon className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-slate-900 tracking-tight">{item.title}</h4>
                  <p className="text-slate-600 px-4 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Impact Section */}
      <section id="impact" className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-[800px] h-full bg-emerald-500/10 blur-[150px] -z-10 rounded-full" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <h2 className="text-4xl lg:text-6xl font-display font-bold mb-8 leading-tight tracking-tight">
                Empowering the <span className="text-emerald-400">Green Transition</span>
              </h2>
              <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
                By radically bridging the gap between local authorities and residents, WasteWise+ ensures that urban sanitation is transparent, incredibly efficient, and collectively upheld. 
              </p>
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/5 flex items-center justify-center backdrop-blur-sm"><Globe className="w-6 h-6 text-emerald-400" /></div>
                  <span className="text-lg font-medium tracking-tight">Global sustainability standards</span>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/5 flex items-center justify-center backdrop-blur-sm"><Award className="w-6 h-6 text-emerald-400" /></div>
                  <span className="text-lg font-medium tracking-tight">Incentivized civic compliance</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative group">
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1500&auto=format&fit=crop" 
                alt="Environmental sustainability" 
                className="w-full h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex items-end p-12">
                <div>
                  <div className="text-6xl font-bold font-display text-white mb-3 tracking-tight">40%</div>
                  <p className="text-xl text-slate-200 font-light">Average reduction in illegal community dumping within 6 months of platform deployment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="py-40 relative overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/80 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl lg:text-6xl font-display font-bold mb-8 tracking-tight text-slate-900">Ready to transform your community?</h2>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the WasteWise+ platform today and seamlessly take the first step towards data-driven, massively scalable ecological governance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/login">
              <button className="h-16 px-12 text-lg rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.25)] bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgb(16,185,129,0.35)] transition-all duration-300 font-semibold tracking-wide">
                Get Started Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white/60 backdrop-blur-3xl border-t border-white/50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold font-display tracking-tight text-slate-900">WasteWise+</span>
              </div>
              <p className="text-slate-600 max-w-sm leading-relaxed">
                Empowering municipalities and citizens to collaboratively build cleaner, greener, and more dynamically sustainable urban environments through AI-driven governance.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6 tracking-tight">Platform</h4>
              <ul className="space-y-4 text-slate-600 font-medium">
                <li><a href="#features" className="hover:text-emerald-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it Works</a></li>
                <li><a href="#impact" className="hover:text-emerald-600 transition-colors">Impact & Analytics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6 tracking-tight">Legal & Connect</h4>
              <ul className="space-y-4 text-slate-600 font-medium">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200/60 flex flex-col-reverse md:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} WasteWise+ Governance. All rights strictly reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-emerald-600 transition-colors">Twitter</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Custom Truck icon component
function TruckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
      <path d="M14 17h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

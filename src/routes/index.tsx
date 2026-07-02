import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Search, Heart, MapPin, Calendar, Building2, X, ChevronLeft, ChevronRight,
  Instagram, Facebook, Youtube, Twitter, Music2, Lock, ShieldCheck, Zap, Trophy,
  LogOut, Settings, Crosshair, Globe, PartyPopper, Mic2, Wine, Volleyball, Drama,
  Mic, Laugh, Ticket, Palette, Image as ImageIcon, Baby, Flower2, TrendingUp,
  Apple, Music, ChevronDown, Sun, Moon, Check, Languages, DollarSign, Play, Phone,
} from "lucide-react";
import imgBadBunny from "@/assets/event-badbunny.webp";
import imgMetallica from "@/assets/event-metallica.webp";
import imgChivasAmerica from "@/assets/event-chivas-america.jpg";
import imgNodal from "@/assets/event-nodal.avif";
import imgSasha from "@/assets/event-sasha.jpg";
import imgTameImpala from "@/assets/event-tame-impala.jpg";
import bsKarolG from "@/assets/bs-karolg.jpg";
import bsTaylor from "@/assets/bs-taylor.jpg";
import bsColdplay from "@/assets/bs-coldplay.webp";
import bsPesoPluma from "@/assets/bs-pesopluma.jpg";
import bsImagineDragons from "@/assets/bs-imaginedragons.jpg";
import nbViveLatino from "@/assets/nearby-vivelatino.jpg";
import nbCaifanes from "@/assets/nearby-caifanes.webp";
import nbPumas from "@/assets/nearby-pumas.jpg";
import nbCafeTacuba from "@/assets/nearby-cafetacuba.png";
import badgeAppleBlack from "@/assets/badge-apple-black.png";
import badgeGoogleBlack from "@/assets/badge-google-black.png";
import badgeAppleWhite from "@/assets/badge-apple-white.png";
import badgeGoogleWhite from "@/assets/badge-google-white.png";
import { useAuth, type AuthUser } from "@/lib/auth";


export const Route = createFileRoute("/")({
  component: Index,
});

// ---------- TYPES & DATA ----------
type Category = "concierto" | "deporte" | "cultura" | "festival";
type Event = {
  id: string;
  artist: string;
  subtitle?: string;
  emoji: string;
  image?: string;
  date: string;
  venue: string;
  city: string;
  price: number;
  category: Category;
  badge: string;
};

const initialEvents: Event[] = [
  { id: "1", artist: "Bad Bunny", subtitle: "DeBÍ TiRAR MáS FOToS Tour", emoji: "\n", image: imgBadBunny, date: "14 Jun 2026", venue: "Foro Sol", city: "CDMX", price: 1850, category: "concierto", badge: "Concierto" },
  { id: "2", artist: "Metallica", subtitle: "M72 World Tour", emoji: "\n", image: imgMetallica, date: "5 Jul 2026", venue: "Estadio GNP", city: "CDMX", price: 2100, category: "concierto", badge: "Concierto" },
  { id: "3", artist: "Chivas vs América", subtitle: "Liga MX — Clásico Nacional", emoji: "\n", image: imgChivasAmerica, date: "25 May 2026", venue: "Estadio Akron", city: "Guadalajara", price: 580, category: "deporte", badge: "Deporte" },
  { id: "4", artist: "Christian Nodal", subtitle: "Pa'l Cora Tour", emoji: "\n", image: imgNodal, date: "28 Jun 2026", venue: "Arena Monterrey", city: "Monterrey", price: 950, category: "concierto", badge: "Concierto" },
  { id: "5", artist: "Sasha Velour", subtitle: "Drag Extravaganza", emoji: "\n", image: imgSasha, date: "12 Jul 2026", venue: "Teatro Metropólitan", city: "CDMX", price: 720, category: "cultura", badge: "Cultura" },
  { id: "6", artist: "Tame Impala", subtitle: "The Slow Rush Live", emoji: "\n", image: imgTameImpala, date: "3 Ago 2026", venue: "Pepsi Center", city: "CDMX", price: 1350, category: "concierto", badge: "Concierto" },
];

const bestsellers = [
  { id: "b1", artist: "Karol G", emoji: "\n", image: bsKarolG, date: "22 Jun · 8:30 pm", venue: "Foro Sol, CDMX" },
  { id: "b2", artist: "Taylor Swift", emoji: "\n", image: bsTaylor, date: "10 Ago · 8:00 pm", venue: "Estadio Azteca, CDMX" },
  { id: "b3", artist: "Coldplay", emoji: "\n", image: bsColdplay, date: "5 Sep · 8:30 pm", venue: "Foro Sol, CDMX" },
  { id: "b4", artist: "Peso Pluma", emoji: "\n", image: bsPesoPluma, date: "18 Jul · 9:00 pm", venue: "Arena Monterrey" },
  { id: "b5", artist: "Imagine Dragons", emoji: "\n", image: bsImagineDragons, date: "29 Sep · 8:00 pm", venue: "Pepsi Center, CDMX" },
];

const nearby = [
  { id: "n1", name: "Festival Vive Latino", emoji: "\n", image: nbViveLatino, venue: "Foro Sol, CDMX", distance: "2 km", price: 1200, day: "21", month: "Mar" },
  { id: "n2", name: "Caifanes — Reunión", emoji: "\n", image: nbCaifanes, venue: "Auditorio Nacional", distance: "4 km", price: 950, day: "08", month: "Jun" },
  { id: "n3", name: "Pumas vs Cruz Azul", emoji: "\n", image: nbPumas, venue: "Estadio Olímpico", distance: "6 km", price: 480, day: "12", month: "May" },
  { id: "n4", name: "Café Tacvba", emoji: "\n", image: nbCafeTacuba, venue: "Pepsi Center, CDMX", distance: "8 km", price: 780, day: "19", month: "Jul" },
];

const categoryColors: Record<Category, string> = {
  concierto: "bg-pink text-white",
  deporte: "bg-purple text-white",
  cultura: "bg-blue-500 text-white",
  festival: "bg-orange-500 text-white",
};

const filterTabs = [
  { id: "todos", label: "Todos" },
  { id: "concierto", label: "Conciertos" },
  { id: "deporte", label: "Deportes" },
  { id: "cultura", label: "Cultura" },
  { id: "festival", label: "Festivales" },
  { id: "usa", label: "EE.UU." },
];

const categoryIcons: { label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Festivales", Icon: PartyPopper },
  { label: "Conciertos", Icon: Mic2 },
  { label: "Comida y Bebida", Icon: Wine },
  { label: "Deportes", Icon: Volleyball },
  { label: "Cultura", Icon: Drama },
  { label: "Conferencias", Icon: Mic },
  { label: "Stand-up Comedy", Icon: Laugh },
  { label: "Teatro", Icon: Ticket },
  { label: "Arte", Icon: Palette },
  { label: "Exposiciones", Icon: ImageIcon },
  { label: "Infantil", Icon: Baby },
  { label: "Bienestar", Icon: Flower2 },
];

const trendingEvents = [
  "Bad Bunny — Foro Sol",
  "Taylor Swift — Estadio Azteca",
  "Coldplay — Foro Sol",
  "Karol G — Foro Sol",
  "Metallica — Estadio GNP",
  "Caifanes — Auditorio Nacional",
];

const citiesList = ["Todas las ciudades", "CDMX", "Guadalajara", "Monterrey", "Puebla", "Cancún", "Tijuana"];
const eventTypesList = ["Todos los tipos", "Concierto", "Deporte", "Cultura", "Festival", "Teatro"];

const countries = [
  { code: "MX", name: "México", flag: "🇲🇽", states: ["CDMX", "Jalisco", "Nuevo León", "Sonora", "Yucatán", "Puebla"] },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", states: ["California", "Texas", "Florida", "New York"] },
  { code: "CO", name: "Colombia", flag: "🇨🇴", states: ["Bogotá", "Medellín", "Cali"] },
  { code: "AR", name: "Argentina", flag: "🇦🇷", states: ["Buenos Aires", "Córdoba"] },
  { code: "ES", name: "España", flag: "🇪🇸", states: ["Madrid", "Barcelona"] },
];

// ---------- MAIN ----------
function Index() {
  const auth = useAuth();
  const user = auth.user;
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showLocPicker, setShowLocPicker] = useState(false);
  const [location, setLocation] = useState({ flag: "🇲🇽", name: "Todo México" });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("todos");
  const [activeCat, setActiveCat] = useState("Conciertos");
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [stats, setStats] = useState({ tickets: "+2M", countries: "160+", guarantee: "100%", commission: "15%" });

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.success("Eliminado de favoritos"); }
      else { next.add(id); toast.success("Agregado a favoritos ❤️"); }
      return next;
    });
  };

  const detectLocation = () => {
    toast.success("📍 Detectando tu ubicación...");
    setTimeout(() => {
      setLocation({ flag: "📍", name: "Mi ubicación (CDMX)" });
      toast.success("Ubicación detectada: CDMX");
    }, 600);
  };

  const filteredEvents = useMemo(() => {
    if (filter === "todos") return events;
    if (filter === "usa") return events.filter((e) => e.city.toLowerCase().includes("usa") || e.city === "New York");
    return events.filter((e) => e.category === filter);
  }, [events, filter]);

  return (
    <div className="min-h-screen bg-app text-foreground">
      <Nav user={user} onLogin={() => setShowLogin(true)} onLogout={() => { auth.logout(); toast.success("Sesión cerrada"); }} />
      <LocationBar location={location} onPick={() => setShowLocPicker(true)} onDetect={detectLocation} />
      {user?.isAdmin && <AdminPanel stats={stats} setStats={setStats} events={events} setEvents={setEvents} />}
      <Hero />
      <NearbyEvents location={location} favorites={favorites} toggleFav={toggleFav} onDetect={detectLocation} />
      <CategoryScroll active={activeCat} setActive={setActiveCat} />
      <EventsSection events={filteredEvents} filter={filter} setFilter={setFilter} favorites={favorites} toggleFav={toggleFav} />
      <HowItWorks />
      <Bestsellers favorites={favorites} toggleFav={toggleFav} />
      <SellBanner />
      <TrustSection />
      <SpotifyBanner />
      <AppDownloadBanner />
      <SocialFooter />
      <MainFooter />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={(u) => { setShowLogin(false); toast.success(`¡Bienvenido ${u.name}!`); }} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSuccess={(u) => { setShowRegister(false); toast.success(`¡Bienvenido ${u.name}!`); }} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />}
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onPublish={(e) => { setEvents((prev) => [e, ...prev]); setShowCreate(false); toast.success("¡Evento publicado!"); }} />}
      {showLocPicker && <LocationPicker current={location} onClose={() => setShowLocPicker(false)} onPick={(l) => { setLocation(l); setShowLocPicker(false); toast.success(`Ubicación: ${l.name}`); }} />}
    </div>
  );
}

// ---------- NAV ----------
function Nav({ user, onLogin, onLogout }: { user: { name: string; isAdmin: boolean } | null; onLogin: () => void; onLogout: () => void }) {
  const languages = [
    { code: "ES", flag: "🇪🇸", label: "Español" },
    { code: "EN", flag: "🇺🇸", label: "English" },
    { code: "PT", flag: "🇧🇷", label: "Português" },
  ];
  const [lang, setLang] = useState(languages[0]);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    if (typeof window !== "undefined") localStorage.setItem("theme", next);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#" className="flex items-center">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-white">FastTicket</span>
            <span className="text-pink">.com</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setOpen(!open)} className="px-3 py-2 text-sm rounded-lg border border-white/15 hover:border-white/40 text-white transition flex items-center gap-1.5">
              <span>{lang.flag}</span> {lang.code} <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg bg-card-purple border border-white/10 shadow-xl overflow-hidden z-50">
                {languages.map((l) => (
                  <button key={l.code} onClick={() => { setLang(l); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 flex items-center gap-2">
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {user ? (
            <>
              <div className="flex items-center gap-2 pr-2">
                <div className="w-9 h-9 rounded-full gradient-pink-purple flex items-center justify-center font-bold text-white text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm text-white font-medium">{user.name}</span>
              </div>
              <button onClick={onLogout} className="px-3 py-2 text-sm rounded-lg border border-white/15 hover:border-white/40 text-white flex items-center gap-1.5 transition">
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </>
          ) : (
            <button onClick={onLogin} className="px-3 py-2 text-sm rounded-lg border border-white/15 hover:border-white/40 text-white transition">
              Ingresar
            </button>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            className="px-3 py-2 text-sm rounded-lg border border-white/15 hover:border-white/40 text-white transition flex items-center justify-center"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------- LOCATION BAR ----------
function LocationBar({ location, onPick, onDetect }: { location: { flag: string; name: string }; onPick: () => void; onDetect: () => void }) {
  return (
    <div className="border-b border-white/10 bg-black/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap text-sm">
        <span className="text-[#aaaaaa] flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /> Ver eventos en:
          <button onClick={onDetect} title="Detectar mi ubicación" className="ml-1 w-7 h-7 rounded-full border border-white/15 hover:border-pink hover:text-pink text-white flex items-center justify-center transition">
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </span>
        <button onClick={onPick} className="px-3 py-1.5 rounded-full bg-pink text-white font-medium flex items-center gap-1.5">
          <span>{location.flag}</span> {location.name}
        </button>
        <button onClick={onDetect} className="px-3 py-1.5 rounded-full border border-pink text-pink hover:bg-pink hover:text-white transition flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5" /> Ver eventos en mi ubicación
        </button>
        <button onClick={onPick} className="px-3 py-1.5 rounded-full border border-white/15 hover:border-white/40 text-[#aaaaaa] hover:text-white transition flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> Internacional
        </button>
      </div>
    </div>
  );
}

// ---------- HERO ----------
function Hero() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState(citiesList[0]);
  const [type, setType] = useState(eventTypesList[0]);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const chips = ["Bad Bunny", "Metallica", "Chivas vs América", "Christian Nodal", "Conciertos CDMX", "Liga MX"];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <section className="gradient-radial-hero">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple/20 border border-purple/40 text-sm text-white/90 mb-6">
          <Ticket className="w-4 h-4" /> El mercado global de boletos #1
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white">
          Consigue boletos para lo que <span className="text-pink">amas</span>
        </h1>
        <p className="mt-6 text-lg text-[#aaaaaa] max-w-2xl mx-auto">
          Compra y vende boletos para conciertos, deportes, teatro y más. Garantía total en cada compra.
        </p>

        <div ref={ref} className="relative mt-8 max-w-3xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); setFocused(false); if (q) toast.success(`Buscando "${q}" en ${city} (${type})`); }}
            className="flex flex-col md:flex-row gap-2 p-2 bg-black/60 border border-white/10 rounded-2xl backdrop-blur"
          >
            <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
              <Search className="w-5 h-5 text-[#aaaaaa] shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                type="text"
                placeholder="Busca artista, equipo, evento..."
                className="w-full bg-transparent outline-none text-white placeholder:text-[#777]"
              />
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onFocus={() => setFocused(true)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-pink"
            >
              {citiesList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              onFocus={() => setFocused(true)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-pink"
            >
              {eventTypesList.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button type="submit" className="px-5 py-3 rounded-xl bg-pink text-white font-semibold hover:opacity-90 transition">Buscar</button>
          </form>

          {focused && (
            <div className="absolute left-0 right-0 mt-2 bg-card-purple border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 text-left">
              <div className="px-4 py-2 text-xs uppercase tracking-wider text-[#aaaaaa] flex items-center gap-2 border-b border-white/10">
                <TrendingUp className="w-3.5 h-3.5 text-pink" /> Trending ahora
              </div>
              {trendingEvents.map((t) => (
                <button
                  key={t}
                  onClick={() => { setQ(t); setFocused(false); toast.success(`Buscando "${t}"`); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/5 flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5 text-[#777]" /> {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <button key={c} onClick={() => setQ(c)} className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-[#ccc] hover:border-pink hover:text-white transition">
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- CATEGORIES ----------
function CategoryScroll({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
          {categoryIcons.map((c) => {
            const isActive = active === c.label;
            return (
              <button key={c.label} onClick={() => setActive(c.label)} className="flex flex-col items-center gap-2 min-w-[88px]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-card-purple border-2 transition ${isActive ? "border-pink text-pink" : "border-white/10 text-white hover:border-white/30"}`}>
                  <c.Icon className="w-6 h-6" />
                </div>
                <span className={`text-xs ${isActive ? "text-white font-semibold" : "text-[#aaaaaa]"}`}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------- EVENT CARD ----------
function EventCard({ event, fav, onFav }: { event: Event; fav: boolean; onFav: () => void }) {
  return (
    <article className="bg-card-purple rounded-2xl overflow-hidden border border-white/5 hover:border-pink/40 transition group">
      <div className="relative h-48 flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)" }}>
        {event.image ? (
          <img src={event.image} alt={event.artist} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        ) : (
          <span className="text-6xl">{event.emoji}</span>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[event.category]}`}>{event.badge}</span>
        <button onClick={onFav} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition">
          <Heart className={`w-5 h-5 ${fav ? "fill-pink text-pink" : "text-white"}`} strokeWidth={1.5} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[17px] text-white truncate">{event.artist}</h3>
        {event.subtitle && <p className="text-xs mb-3 truncate text-[#aaaaaa]">{event.subtitle}</p>}
        <div className="space-y-1.5 text-xs text-[#aaaaaa] mt-2">
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" strokeWidth={1.5} /> {event.date}</div>
          <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5" strokeWidth={1.5} /> {event.venue}</div>
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" strokeWidth={1.5} /> {event.city}</div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-[#888] uppercase">Desde</div>
            <div className="text-lg font-bold text-white">${String(event.price)}</div>
          </div>
          <button className="px-3 py-2 text-sm rounded-lg bg-pink text-white font-semibold hover:opacity-90 transition">Ver boletos</button>
        </div>
      </div>
    </article>
  );
}

function EventsSection({ events, filter, setFilter, favorites, toggleFav }: { events: Event[]; filter: string; setFilter: (s: string) => void; favorites: Set<string>; toggleFav: (id: string) => void }) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <h2 className="text-3xl font-extrabold text-white">Eventos Destacados</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
          {filterTabs.map((t) => (
            <button key={t.id} onClick={() => setFilter(t.id)} className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition ${filter === t.id ? "bg-pink text-white" : "bg-white/5 text-[#aaaaaa] hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {events.length === 0 ? (
            <p className="text-[#aaaaaa] col-span-full text-center py-10">No hay eventos en esta categoría.</p>
          ) : events.map((e) => (
            <EventCard key={e.id} event={e} fav={favorites.has(e.id)} onFav={() => toggleFav(e.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- HOW IT WORKS ----------
function HowItWorks() {
  const steps = [
    { Icon: Search, t: "Encuentra tu evento", d: "Busca por artista, venue o ciudad" },
    { Icon: Ticket, t: "Elige tus boletos", d: "Selecciona la sección y cantidad" },
    { Icon: Lock, t: "Paga seguro", d: "Múltiples métodos de pago con encriptación" },
    { Icon: Zap, t: "Recibe al instante", d: "QR en tu email y app al momento" },
  ];
  return (
    <section className="py-16 bg-black border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-extrabold text-center text-white mb-12">¿Cómo funciona?</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(233,30,140,0.35) 0%, transparent 70%)",
                  }}
                />
                <s.Icon
                  className="relative z-10 w-10 h-10"
                  style={{
                    color: "#E91E8C",
                    filter: "drop-shadow(0 0 6px rgba(233,30,140,0.8)) drop-shadow(0 0 14px rgba(233,30,140,0.5))",
                  }}
                  strokeWidth={1.2}
                />
              </div>
              <h3 className="font-bold text-white mb-1.5">{s.t}</h3>
              <p className="text-sm text-[#aaaaaa] max-w-[220px] mx-auto">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- BESTSELLERS ----------
function Bestsellers({ favorites, toggleFav }: { favorites: Set<string>; toggleFav: (id: string) => void }) {
  const scroll = (dir: number) => {
    const el = document.getElementById("bestsellers-row");
    if (el) el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-white">Más Vendidos Esta Semana</h2>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full bg-card-purple border border-white/10 flex items-center justify-center hover:border-pink transition"><ChevronLeft className="w-5 h-5 text-white" strokeWidth={1.5} /></button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full bg-card-purple border border-white/10 flex items-center justify-center hover:border-pink transition"><ChevronRight className="w-5 h-5 text-white" strokeWidth={1.5} /></button>
          </div>
        </div>
        <div id="bestsellers-row" className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 snap-x">
          {bestsellers.map((b) => (
            <article key={b.id} className="snap-start min-w-[240px] max-w-[240px] bg-card-purple rounded-xl overflow-hidden border border-white/5">
              <div className="relative h-28 overflow-hidden flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)" }}>
                {"image" in b && b.image ? (
                  <img src={b.image} alt={b.artist} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span>{b.emoji}</span>
                )}
                <button onClick={() => toggleFav(b.id)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                  <Heart className={`w-4 h-4 ${favorites.has(b.id) ? "fill-pink text-pink" : "text-white"}`} strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-white truncate">{b.artist}</h3>
                <div className="text-xs text-[#aaaaaa] mt-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" strokeWidth={1.5} /> {b.date}</div>
                <div className="text-xs text-[#aaaaaa] mt-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" strokeWidth={1.5} /> {b.venue}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- NEARBY ----------
function NearbyEvents({ location, favorites, toggleFav, onDetect }: { location: { flag: string; name: string }; favorites: Set<string>; toggleFav: (id: string) => void; onDetect: () => void }) {
  return (
    <section className="py-12 border-y border-white/10 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
          <h2 className="text-3xl font-extrabold text-white">Eventos Cerca de Ti</h2>
          <button onClick={onDetect} className="px-3 py-2 text-sm rounded-lg border border-pink text-pink hover:bg-pink hover:text-white transition flex items-center gap-1.5">
            <Crosshair className="w-4 h-4" strokeWidth={1.5} /> Usar mi ubicación
          </button>
        </div>
        <p className="text-[#aaaaaa] text-sm mb-6">Basado en tu ubicación: <span className="text-white">{location.flag} {location.name}</span></p>
        <div className="grid md:grid-cols-2 gap-4">
          {nearby.map((n) => (
            <article key={n.id} className="bg-card-purple rounded-xl border border-white/5 hover:border-pink/40 transition flex items-center gap-4 p-3">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center text-3xl shrink-0" style={{ background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)" }}>
                {(n as any).image ? (
                  <img src={(n as any).image} alt={n.name} className="w-full h-full object-cover" />
                ) : (
                  n.emoji
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  {n.id === "n2" ? (
                    <Link to="/evento/caifanes-reunion" className="font-bold text-white truncate flex-1 hover:text-pink transition">{n.name}</Link>
                  ) : (
                    <h3 className="font-bold text-white truncate flex-1">{n.name}</h3>
                  )}
                  <button onClick={() => toggleFav(n.id)} className="shrink-0">
                    <Heart className={`w-5 h-5 ${favorites.has(n.id) ? "fill-pink text-pink" : "text-[#aaaaaa] hover:text-white"}`} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="text-xs text-[#aaaaaa] mt-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" strokeWidth={1.5} /> {n.venue}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple/30 text-white">{n.distance}</span>
                  <span className="text-sm font-bold text-pink">Desde ${n.price}</span>
                  {n.id === "n2" && (
                    <Link to="/evento/caifanes-reunion" className="ml-auto text-[10px] bg-pink px-2 py-1 rounded-full font-bold hover:opacity-90">Comprar</Link>
                  )}
                </div>
              </div>
              <div className="text-center bg-black/40 rounded-lg px-3 py-2 shrink-0">
                <div className="text-xl font-extrabold text-white leading-none">{n.day}</div>
                <div className="text-[10px] uppercase text-[#aaaaaa] mt-0.5">{n.month}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- SELL BANNER ----------
function SellBanner() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="gradient-pink-purple rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">¿Tienes boletos que no puedes usar?</h2>
            <p className="text-white/90 mt-2">Vende de forma segura a millones de compradores. Sin complicaciones.</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:scale-105 transition shrink-0">
            Vender mis boletos
          </button>
        </div>
      </div>
    </section>
  );
}

// ---------- TRUST ----------
function TrustSection() {
  const items = [
    { Icon: Lock, t: "Compra 100% Segura", d: "Garantía de devolución si el evento se cancela" },
    { Icon: ShieldCheck, t: "Boletos Verificados", d: "Cada boleto pasa por verificación anti-fraude" },
    { Icon: Zap, t: "Entrega Inmediata", d: "Recibe tus boletos al instante por email y app" },
    { Icon: Trophy, t: "Por qué somos ALL IN ONE", d: "Conciertos, deportes, teatro, festivales y más en una sola plataforma" },
  ];
  return (
    <section className="py-16 bg-black/40 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-extrabold text-center text-white mb-12">Por qué somos ALL IN ONE</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((i) => (
            <div key={i.t} className="bg-card-purple rounded-2xl p-6 border border-white/5">
              <div className="w-12 h-12 rounded-xl gradient-pink-purple flex items-center justify-center text-white mb-4">
                <i.Icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-white mb-1">{i.t}</h3>
              <p className="text-sm text-[#aaaaaa]">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- SPOTIFY BANNER ----------
function SpotifyBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="bg-black border border-white/10 rounded-2xl px-6 py-5 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <svg viewBox="0 0 24 24" className="w-10 h-10" fill="#1DB954" aria-hidden>
            <path d="M12 0a12 12 0 100 24 12 12 0 000-24zm5.5 17.3a.75.75 0 01-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 11-.33-1.46c4.57-1.04 8.5-.59 11.66 1.34.36.22.47.69.25 1.03zm1.47-3.28a.94.94 0 01-1.29.31c-3.23-1.98-8.15-2.56-11.97-1.4a.94.94 0 11-.55-1.8c4.37-1.33 9.8-.69 13.5 1.6a.94.94 0 01.31 1.29zm.13-3.42c-3.87-2.3-10.27-2.51-13.97-1.39a1.13 1.13 0 11-.66-2.16c4.25-1.29 11.31-1.04 15.78 1.6a1.13 1.13 0 01-1.15 1.95z"/>
          </svg>
          <span className="text-white text-xl font-bold">Spotify</span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-white font-bold text-base md:text-lg leading-tight">Conecta tu cuenta de Spotify y sincroniza tus artistas favoritos</p>
          <p className="text-white/70 text-sm mt-1">Descubre eventos de los artistas a los que escuchas</p>
        </div>
        <button
          onClick={() => toast.success("Conectando con Spotify 🎧")}
          className="shrink-0 px-6 h-11 rounded-full border-2 font-semibold text-sm transition hover:opacity-90"
          style={{ borderColor: "#1DB954", color: "#1DB954" }}
        >
          Conectar Spotify
        </button>
      </div>
    </section>
  );
}

// ---------- APP DOWNLOAD BANNER ----------
function AppDownloadBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
      <div className="rounded-2xl px-6 md:px-10 py-8 flex flex-col md:flex-row items-center gap-6" style={{ background: "linear-gradient(135deg, rgba(233,30,140,0.12), rgba(233,30,140,0.04))", border: "1px solid rgba(233,30,140,0.2)" }}>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-baseline gap-0.5 font-extrabold text-2xl md:text-3xl mb-2 justify-center md:justify-start">
            <span className="text-white">Descarga la app de </span>
            <span className="text-white">Fast</span><span className="text-pink">Ticket</span>
          </div>
          <p className="text-white/70 text-sm md:text-base">Descubre fácilmente tus eventos favoritos</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="#" className="hover:opacity-90 transition">
            <img src={badgeAppleWhite} alt="Descargar en App Store" className="h-11 w-auto rounded-xl badge-dark-theme" />
            <img src={badgeAppleBlack} alt="Descargar en App Store" className="h-11 w-auto rounded-xl badge-light-theme" />
          </a>
          <a href="#" className="hover:opacity-90 transition">
            <img src={badgeGoogleWhite} alt="Disponible en Google Play" className="h-11 w-auto rounded-xl badge-dark-theme" />
            <img src={badgeGoogleBlack} alt="Disponible en Google Play" className="h-11 w-auto rounded-xl badge-light-theme" />
          </a>
          <div className="bg-white p-1.5 rounded-lg">
            <div className="w-16 h-16 grid grid-cols-8 grid-rows-8 gap-0">
              {Array.from({ length: 64 }).map((_, i) => {
                const on = [0,1,2,3,4,5,6,8,14,16,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,49,50,51,55,57,58,59,60,61,62,63].includes(i % 64) || (i * 7) % 5 === 0;
                return <div key={i} style={{ background: on ? "#000" : "#fff" }} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function SocialFooter() {
  const socials = [
    { i: <Instagram className="w-5 h-5" strokeWidth={1.5} />, l: "Instagram" },
    { i: <Music2 className="w-5 h-5" strokeWidth={1.5} />, l: "TikTok" },
    { i: <Facebook className="w-5 h-5" strokeWidth={1.5} />, l: "Facebook" },
    { i: <Twitter className="w-5 h-5" strokeWidth={1.5} />, l: "X" },
    { i: <Youtube className="w-5 h-5" strokeWidth={1.5} />, l: "YouTube" },
  ];
  return (
    <section className="py-12 text-center">
      <p className="text-white text-lg font-semibold mb-5">Síguenos y sé el primero en enterarte</p>
      <div className="flex justify-center gap-3 flex-wrap">
        {socials.map((s) => (
          <a key={s.l} href="#" aria-label={s.l} className="w-11 h-11 rounded-full bg-card-purple border border-white/10 flex items-center justify-center text-white hover:border-pink hover:text-pink transition">
            {s.i}
          </a>
        ))}
        <a href="#" className="px-5 h-11 rounded-full bg-card-purple border border-white/10 flex items-center text-white hover:border-pink hover:text-pink transition text-sm font-medium">Blog</a>
      </div>
    </section>
  );
}

// ---------- MAIN FOOTER ----------
function MainFooter() {
  const guarantees = [
    "Controles de seguridad de clase mundial",
    "Precios transparentes",
    "Compras con garantía al 100%",
    "Equipo de Atención al Cliente que te acompaña en todo el proceso",
  ];
  const empresa = ["Sobre nosotros", "Distribución abierta", "Programa de Afiliados", "Inversionistas", "Sala de prensa", "Empleos"];
  const ayudarte = ["Centro de Ayuda / Contacto", "Mi cuenta", "Política de reembolso y cancelación", "Facturación"];
  
  const bottomLinks = ["SuperFan", "Términos y condiciones", "Acerca de nosotros", "Legales y Seguridad", "Preguntas frecuentes", "Tu evento en FastTicket", "Envíos por enviatodo.com"];

  return (
    <footer className="bg-black border-t border-white/10 pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Brand + Guarantee */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10 mb-10">
          <div>
            <div className="flex items-baseline gap-0.5 font-extrabold text-xl mb-3">
              <span className="text-white">Fast</span><span className="text-pink">Ticket</span><span className="text-muted-foreground font-medium">.com</span>
            </div>
            <p className="text-sm text-[#aaaaaa] mb-5">El marketplace de boletos más confiable de México y Latinoamérica.</p>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-card-purple border border-pink/30 mb-4">
              <ShieldCheck className="w-5 h-5 text-pink" strokeWidth={1.5} />
              <span className="text-sm font-bold text-white">FastTicket <span className="text-pink">guarantee</span></span>
            </div>
            <ul className="space-y-2">
              {guarantees.map((g) => (
                <li key={g} className="flex items-start gap-2 text-xs text-[#cfcfcf]">
                  <Check className="w-4 h-4 text-pink shrink-0 mt-0.5" strokeWidth={2} />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Nuestra empresa</h4>
            <ul className="space-y-2">
              {empresa.map((x) => <li key={x}><a href="#" className="text-sm text-[#aaaaaa] hover:text-pink transition">{x}</a></li>)}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">¿Tiene preguntas?</h4>
            <ul className="space-y-2 mb-6">
              {ayudarte.map((x) => <li key={x}><a href="#" className="text-sm text-[#aaaaaa] hover:text-pink transition">{x}</a></li>)}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Eventos en vivo en todo el mundo</h4>
            <div className="space-y-2 mb-6">
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-card-purple border border-white/10 rounded-lg text-sm text-white hover:border-pink transition">
                <Globe className="w-4 h-4" strokeWidth={1.5} /> Todo el Mundo
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-card-purple border border-white/10 rounded-lg text-sm text-white hover:border-pink transition">
                <Languages className="w-4 h-4" strokeWidth={1.5} /> Español (MX)
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-3 bg-card-purple border border-white/10 rounded-lg text-sm text-white hover:border-pink transition">
                <DollarSign className="w-4 h-4" strokeWidth={1.5} /> MX$ Peso Mexicano
              </button>
            </div>

            <h4 className="font-bold text-white mb-3">Descarga nuestras apps</h4>
            <div className="flex gap-2">
              <a href="#" className="hover:opacity-90 transition flex-1">
                <img src={badgeAppleWhite} alt="Descargar en App Store" className="h-10 w-auto rounded-lg badge-dark-theme" />
                <img src={badgeAppleBlack} alt="Descargar en App Store" className="h-10 w-auto rounded-lg badge-light-theme" />
              </a>
              <a href="#" className="hover:opacity-90 transition flex-1">
                <img src={badgeGoogleWhite} alt="Disponible en Google Play" className="h-10 w-auto rounded-lg badge-dark-theme" />
                <img src={badgeGoogleBlack} alt="Disponible en Google Play" className="h-10 w-auto rounded-lg badge-light-theme" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="grid md:grid-cols-2 gap-8 py-8 border-t border-white/10">
          <div>
            <h4 className="font-extrabold text-white text-lg mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pink" strokeWidth={1.5} /> Oficinas
            </h4>
            <p className="text-sm text-[#cfcfcf] leading-relaxed">
              Blvd Morelos 254, Constitución,<br />
              83150, Hermosillo, Sonora
            </p>
          </div>
          <div>
            <h4 className="font-extrabold text-white text-lg mb-3 flex items-center gap-2">
              <Phone className="w-5 h-5 text-pink" strokeWidth={1.5} /> Teléfono
            </h4>
            <p className="text-sm text-[#cfcfcf] leading-relaxed">
              +52 66 22 8169 94 y +52 66 2348 9566<br />
              <a href="mailto:boletos@fastticket.com.mx" className="text-pink hover:underline">boletos@fastticket.com.mx</a>
            </p>
          </div>
        </div>

        {/* Secondary link row */}
        <div className="py-6 border-t border-white/10 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {bottomLinks.map((x) => (
            <a key={x} href="#" className="text-xs text-pink hover:text-white transition">{x}</a>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#888]">
          <p>Derechos reservados © FastTicket 2026 — <a href="#" className="hover:text-pink underline">Datos de la Empresa</a></p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">ES</a>
            <a href="#" className="hover:text-white">EN</a>
            <a href="#" className="hover:text-white">PT</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------- MODALS ----------
function ModalShell({ onClose, children, maxWidth = "max-w-md" }: { onClose: () => void; children: React.ReactNode; maxWidth?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`relative w-full ${maxWidth} bg-card-purple border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95`}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white">
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}


function RememberMe({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded-sm border flex items-center justify-center transition ${checked ? "bg-pink border-pink" : "bg-black/40 border-white/20"}`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className="text-sm text-[#aaaaaa]">Recuérdame</span>
    </label>
  );
}

function LoginModal({ onClose, onSuccess, onSwitchToRegister }: { onClose: () => void; onSuccess: (u: AuthUser) => void; onSwitchToRegister: () => void }) {
  const auth = useAuth();
  const [tab, setTab] = useState<"buyer" | "admin">("buyer");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    const u = auth.login(email, pass, remember);
    if (!u) {
      toast.error("Correo o contraseña incorrectos");
      return;
    }
    onSuccess(u);
  };
  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-2xl font-extrabold text-white mb-1">Inicia sesión</h2>
      <p className="text-sm text-[#aaaaaa] mb-5">Bienvenido de vuelta a FastTicket</p>
      <div className="flex bg-black/40 rounded-lg p-1 mb-5">
        <button onClick={() => setTab("buyer")} className={`flex-1 py-2 text-sm rounded-md transition ${tab === "buyer" ? "bg-pink text-white" : "text-[#aaaaaa]"}`}>Comprador</button>
        <button onClick={() => setTab("admin")} className={`flex-1 py-2 text-sm rounded-md transition ${tab === "admin" ? "bg-pink text-white" : "text-[#aaaaaa]"}`}>Organizador / Admin</button>
      </div>

      <button
        onClick={() => { const u = auth.register("Apple User", `apple_${Date.now()}@fastticket.com`, "apple", "", remember); onSuccess(u); }}
        className="w-full mb-3 py-3 bg-white text-black rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition"
      >
        <Apple className="w-5 h-5 fill-black" /> Sign in with Apple
      </button>

      {tab === "admin" && (
        <div className="text-xs bg-pink/10 border border-pink/30 rounded-lg p-3 mb-4 text-white/80">
          Acceso exclusivo para promotores y administradores de FastTicket
        </div>
      )}
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-[#777] outline-none focus:border-pink" />
        <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="Contraseña" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-[#777] outline-none focus:border-pink" />
        <div className="flex items-center justify-between pt-1">
          <RememberMe checked={remember} onChange={setRemember} />
        </div>
        <button type="submit" className="w-full py-3 bg-pink text-white rounded-lg font-semibold hover:opacity-90 transition">Iniciar sesión</button>
      </form>

      <p className="text-sm text-[#aaaaaa] mt-4 text-center">
        ¿No tienes cuenta?{" "}
        <button onClick={onSwitchToRegister} className="text-pink font-semibold hover:underline">Regístrate</button>
      </p>

      <div className="flex items-center gap-3 my-5 text-xs text-[#aaaaaa]">
        <div className="flex-1 h-px bg-white/10" />o continúa con<div className="flex-1 h-px bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => { const u = auth.register("Google User", `google_${Date.now()}@fastticket.com`, "google", "", remember); onSuccess(u); }} className="py-2.5 border border-white/10 rounded-lg text-sm text-white hover:border-white/30 transition">Google</button>
        <button onClick={() => { const u = auth.register("FB User", `fb_${Date.now()}@fastticket.com`, "fb", "", remember); onSuccess(u); }} className="py-2.5 border border-white/10 rounded-lg text-sm text-white hover:border-white/30 transition">Facebook</button>
      </div>

      <button
        onClick={() => { setSpotifyConnected(true); toast.success("Conectado a Spotify 🎧"); }}
        disabled={spotifyConnected}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${spotifyConnected ? "bg-[#1DB954]/30 text-white/70" : "bg-[#1DB954] text-black hover:opacity-90"}`}
      >
        <Music className="w-4 h-4" strokeWidth={2} />
        {spotifyConnected ? "Spotify conectado" : "Conectar con Spotify"}
      </button>

      <p className="text-[10px] text-[#777] mt-4 text-center">Demo: ana@example.com / demo123 · admin@fastticket.com / admin123</p>
    </ModalShell>
  );
}

function RegisterModal({ onClose, onSuccess, onSwitchToLogin }: { onClose: () => void; onSuccess: (u: AuthUser) => void; onSwitchToLogin: () => void }) {
  const auth = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !pass) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    if (pass.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (pass !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    const u = auth.register(name, email, pass, phone, remember);
    onSuccess(u);
  };

  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-2xl font-extrabold text-white mb-1">Crea tu cuenta</h2>
      <p className="text-sm text-[#aaaaaa] mb-5">Únete a FastTicket en segundos</p>
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-[#777] outline-none focus:border-pink" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-[#777] outline-none focus:border-pink" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Teléfono" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-[#777] outline-none focus:border-pink" />
        <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="Contraseña" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-[#777] outline-none focus:border-pink" />
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Confirmar contraseña" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-[#777] outline-none focus:border-pink" />
        <div className="pt-1">
          <RememberMe checked={remember} onChange={setRemember} />
        </div>
        <button type="submit" className="w-full py-3 bg-pink text-white rounded-lg font-semibold hover:opacity-90 transition">Crear cuenta</button>
      </form>
      <p className="text-sm text-[#aaaaaa] mt-4 text-center">
        ¿Ya tienes cuenta?{" "}
        <button onClick={onSwitchToLogin} className="text-pink font-semibold hover:underline">Inicia sesión</button>
      </p>
    </ModalShell>
  );
}


function CreateEventModal({ onClose, onPublish }: { onClose: () => void; onPublish: (e: Event) => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: "", category: "concierto" as Category, date: "", venue: "", city: "", price: "", quantity: "" });
  const update = (k: string, v: string) => setData((p) => ({ ...p, [k]: v }));
  const publish = () => onPublish({
    id: Math.random().toString(36).slice(2),
    artist: data.name || "Mi evento",
    subtitle: "",
    emoji: "🎉",
    date: data.date || "Próximamente",
    venue: data.venue || "Por confirmar",
    city: data.city || "—",
    price: Number(data.price) || 500,
    category: data.category,
    badge: data.category.charAt(0).toUpperCase() + data.category.slice(1),
  });
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-lg">
      <h2 className="text-2xl font-extrabold text-white mb-2">Crear evento</h2>
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-pink text-white" : "bg-white/10 text-[#aaaaaa]"}`}>{s}</div>
            {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? "bg-pink" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>
      {step === 1 && (
        <div className="space-y-3">
          <input placeholder="Nombre del evento" value={data.name} onChange={(e) => update("name", e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink" />
          <select value={data.category} onChange={(e) => update("category", e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink">
            <option value="concierto">Concierto</option>
            <option value="deporte">Deporte</option>
            <option value="cultura">Cultura</option>
            <option value="festival">Festival</option>
          </select>
          <input type="datetime-local" value={data.date} onChange={(e) => update("date", e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink" />
          <input placeholder="Venue" value={data.venue} onChange={(e) => update("venue", e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink" />
          <input placeholder="Ciudad" value={data.city} onChange={(e) => update("city", e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink" />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <input placeholder="Precio (MXN)" value={data.price} onChange={(e) => update("price", e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink" />
          <input placeholder="Cantidad de boletos" value={data.quantity} onChange={(e) => update("quantity", e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink" />
          <div className="border-2 border-dashed border-white/15 rounded-lg p-8 text-center text-[#aaaaaa] text-sm">
            <ImageIcon className="w-6 h-6 mx-auto mb-2" strokeWidth={1.5} /> Sube una imagen del evento
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <p className="text-sm text-[#aaaaaa] mb-3">Vista previa:</p>
          <div className="bg-black/40 border border-white/10 rounded-xl p-4">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-bold text-white">{data.name || "Mi evento"}</h3>
            <p className="text-xs text-[#aaaaaa] mt-1">{data.venue} · {data.city}</p>
            <p className="text-pink font-bold mt-2">Desde ${data.price || "0"}</p>
          </div>
        </div>
      )}
      <div className="flex justify-between gap-2 mt-6">
        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="px-4 py-2 rounded-lg border border-white/15 text-white disabled:opacity-30">Atrás</button>
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} className="px-4 py-2 rounded-lg bg-pink text-white font-semibold">Siguiente</button>
        ) : (
          <button onClick={publish} className="px-4 py-2 rounded-lg bg-pink text-white font-semibold">Publicar evento</button>
        )}
      </div>
    </ModalShell>
  );
}

function LocationPicker({ onClose, onPick }: { current?: { flag: string; name: string }; onClose: () => void; onPick: (l: { flag: string; name: string }) => void }) {
  const [country, setCountry] = useState("MX");
  const c = countries.find((x) => x.code === country)!;
  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-xl font-extrabold text-white mb-4">Elige tu ubicación</h2>
      <button onClick={() => onPick({ flag: "📍", name: "Ubicación detectada" })} className="w-full text-left px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white hover:border-pink transition mb-4 flex items-center gap-2">
        <Crosshair className="w-4 h-4 text-pink" strokeWidth={1.5} /> Detectar ubicación automáticamente
      </button>
      <div className="space-y-2 mb-4">
        {countries.map((x) => (
          <button key={x.code} onClick={() => setCountry(x.code)} className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition ${country === x.code ? "bg-pink text-white" : "bg-black/30 text-white hover:bg-black/50"}`}>
            <span>{x.flag}</span> {x.name}
          </button>
        ))}
      </div>
      {c.states.length > 0 && (
        <>
          <p className="text-xs text-[#aaaaaa] mb-2">Estados / Ciudades</p>
          <div className="grid grid-cols-2 gap-2">
            {c.states.map((s) => (
              <button key={s} onClick={() => onPick({ flag: c.flag, name: s })} className="px-3 py-2 text-sm bg-black/30 border border-white/10 rounded-lg text-white hover:border-pink transition">
                {s}
              </button>
            ))}
            <button onClick={() => onPick({ flag: c.flag, name: `Todo ${c.name}` })} className="col-span-2 px-3 py-2 text-sm border border-pink text-pink rounded-lg hover:bg-pink hover:text-white transition">
              Todo {c.name}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

// ---------- ADMIN ----------
function AdminPanel({ stats, setStats, events, setEvents }: { stats: any; setStats: any; events: Event[]; setEvents: any }) {
  const [open, setOpen] = useState(true);
  const [edit, setEdit] = useState(events[0]);
  const apply = () => {
    setEvents((prev: Event[]) => prev.map((e) => (e.id === edit.id ? edit : e)));
    toast.success("Cambios aplicados ✨");
  };
  return (
    <section className="border-b border-white/10 bg-purple/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-white font-semibold">
          <Settings className="w-4 h-4" strokeWidth={1.5} /> Panel de Administrador {open ? "▾" : "▸"}
        </button>
        {open && (
          <div className="mt-4 grid lg:grid-cols-2 gap-4">
            <div className="bg-card-purple p-4 rounded-xl border border-white/10">
              <h3 className="font-bold text-white mb-3">Editar evento destacado</h3>
              <select value={edit.id} onChange={(e) => setEdit(events.find((x) => x.id === e.target.value)!)} className="w-full mb-2 px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm">
                {events.map((e) => <option key={e.id} value={e.id}>{e.artist}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input value={edit.artist} onChange={(e) => setEdit({ ...edit, artist: e.target.value })} placeholder="Artista" className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm" />
                <input value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} placeholder="Fecha" className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm" />
                <input value={edit.venue} onChange={(e) => setEdit({ ...edit, venue: e.target.value })} placeholder="Venue" className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm" />
                <input type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} placeholder="Precio" className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm" />
                <select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value as Category })} className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm">
                  <option value="concierto">Concierto</option>
                  <option value="deporte">Deporte</option>
                  <option value="cultura">Cultura</option>
                  <option value="festival">Festival</option>
                </select>
                <input value={edit.badge} onChange={(e) => setEdit({ ...edit, badge: e.target.value })} placeholder="Badge" className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm" />
              </div>
              <button onClick={apply} className="mt-3 px-4 py-2 bg-purple text-white rounded-lg font-semibold w-full">Aplicar cambios</button>
            </div>
            <div className="bg-card-purple p-4 rounded-xl border border-white/10">
              <h3 className="font-bold text-white mb-3">Editar estadísticas</h3>
              <div className="grid grid-cols-2 gap-2">
                <input value={stats.tickets} onChange={(e) => setStats({ ...stats, tickets: e.target.value })} placeholder="Boletos" className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm" />
                <input value={stats.countries} onChange={(e) => setStats({ ...stats, countries: e.target.value })} placeholder="Países" className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm" />
                <input value={stats.guarantee} onChange={(e) => setStats({ ...stats, guarantee: e.target.value })} placeholder="Garantía" className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm" />
                <input value={stats.commission} onChange={(e) => setStats({ ...stats, commission: e.target.value })} placeholder="Comisión" className="px-3 py-2 bg-black/40 border border-white/10 rounded text-white text-sm" />
              </div>
              <button onClick={() => toast.success("Estadísticas actualizadas")} className="mt-3 px-4 py-2 bg-purple text-white rounded-lg font-semibold w-full">Aplicar cambios</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

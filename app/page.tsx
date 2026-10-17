'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

// Pembersihan URL Backend agar aman dari double protocol & trailing slash
const getCleanBackendUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  let clean = rawUrl.trim().replace(/\/$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean;
};

const BACKEND_URL = getCleanBackendUrl();

const STICKER_SAMPLES = [
  { id: 1, name: 'MAU_VIRAL_KAH.WEBP', src: '/images/stiker1.png', fallback: 'https://picsum.photos/seed/pepe/200' },
  { id: 2, name: 'BRODY_ONEHIT.WEBP', src: '/images/stiker2.png', fallback: 'https://picsum.photos/seed/alert/200' },
  { id: 3, name: 'SPONGEBOB.WEBP', src: '/images/stiker3.png', fallback: 'https://picsum.photos/seed/dead/200' },
  { id: 4, name: 'CAT.WEBP', src: '/images/stiker4.png', fallback: 'https://picsum.photos/seed/crown/200' },
];

export default function Home() {
  const [qr, setQr] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  const descRef = useRef<HTMLParagraphElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Animasi Typing menggunakan GSAP
  useEffect(() => {
    if (descRef.current) {
      const fullText =
        'Instant WebP conversion. Seamlessly sync curated sticker packs directly to your WhatsApp account with one-click device pairing.';
      
      gsap.to(descRef.current, {
        duration: 5,
        text: fullText,
        ease: 'none',
        delay: 0.3,
      });
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/status`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.qr) {
        setQr(data.qr);
        setIsInitializing(false);
      }
      setIsConnected(data.isConnected);
      if (data.isInitializing !== undefined && !data.qr) {
        setIsInitializing(data.isInitializing);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Inisialisasi Socket secara aman di dalam useEffect
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      secure: true,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('qr_status', (data) => {
      console.log('Received WebSocket qr_status:', data);
      if (data.qr) {
        setQr(data.qr);
        setIsInitializing(false);
      } else if (data.isConnected) {
        setQr(null);
        setIsInitializing(false);
      }
      setIsConnected(data.isConnected);
      if (data.isInitializing !== undefined && !data.qr) {
        setIsInitializing(data.isInitializing);
      }
      setLoading(false);
    });

    return () => {
      if (socket) {
        socket.off('qr_status');
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInitializing && !qr && !isConnected) {
      interval = setInterval(() => {
        fetchStatus();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isInitializing, qr, isConnected]);

  useEffect(() => {
    const sectionIds = ['home', 'preview', 'about'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const handleGenerateQR = async () => {
    setIsInitializing(true);
    setQr(null);
    setIsMobileMenuOpen(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-qr`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed response from server');
      const data = await res.json();
      if (data.qr) {
        setQr(data.qr);
        setIsInitializing(false);
      }
    } catch (err) {
      console.error('Failed to trigger QR generation:', err);
      setIsInitializing(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setIsMobileMenuOpen(false);
    try {
      await fetch(`${BACKEND_URL}/api/logout`, { method: 'POST' });
      setQr(null);
      setIsConnected(false);
      setIsInitializing(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1b1b] font-mono selection:bg-[#ffe600] selection:text-black flex flex-col scroll-smooth">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .bg-neo-dots {
          background-image: radial-gradient(#000000 1.2px, transparent 1.2px);
          background-size: 20px 20px;
        }
        .checkered-pattern {
          background-image: linear-gradient(45deg, #eee 25%, transparent 25%),
            linear-gradient(-45deg, #eee 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #eee 75%),
            linear-gradient(-45deg, transparent 75%, #eee 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }
        [data-nextjs-toast],
        [data-[#nextjs-dialog-overlay]],
        nextjs-portal {
          display: none !important;
        }
      `}</style>

      {/* navbar section */}
      <header className="bg-white border-b-[4px] border-black shadow-[0px_4px_0px_#000000] sticky top-0 z-50">
        <div className="w-full px-4 md:px-8 max-w-[1280px] mx-auto flex items-center justify-between h-20">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="font-black text-xl bg-[#ffe600] text-black px-3 py-1.5 border-[3px] border-black shadow-[3px_3px_0px_#000000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#000000] transition-all flex items-center gap-2 uppercase tracking-tight"
          >
            <span>Y.BOT</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 font-bold text-sm uppercase">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, 'home')}
              className={`pb-1 transition-all ${
                activeSection === 'home'
                  ? 'text-black border-b-[3px] border-black'
                  : 'text-gray-600 hover:text-black border-b-[3px] border-transparent hover:border-black'
              }`}
            >
              Home
            </a>
            <a
              href="#preview"
              onClick={(e) => handleNavClick(e, 'preview')}
              className={`pb-1 transition-all ${
                activeSection === 'preview'
                  ? 'text-black border-b-[3px] border-black'
                  : 'text-gray-600 hover:text-black border-b-[3px] border-transparent hover:border-black'
              }`}
            >
              Preview
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, 'about')}
              className={`pb-1 transition-all ${
                activeSection === 'about'
                  ? 'text-black border-b-[3px] border-black'
                  : 'text-gray-600 hover:text-black border-b-[3px] border-transparent hover:border-black'
              }`}
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 bg-[#ff4d4d] text-white font-black text-xs md:text-sm uppercase px-4 py-2 border-[3px] border-black shadow-[3px_3px_0px_#000000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
              >
                <span>UNLINK DEVICE</span>
              </button>
            ) : (
              <button
                onClick={handleGenerateQR}
                className="hidden md:flex items-center gap-2 bg-[#25D366] text-black font-black text-xs md:text-sm uppercase px-4 py-2 border-[3px] border-black shadow-[3px_3px_0px_#000000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
              >
                <span>LINK DEVICE</span>
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden bg-[#ffe600] text-black font-black p-2 border-[3px] border-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center justify-center"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t-[4px] border-black bg-white px-4 py-6 shadow-[0px_8px_0px_#000000] flex flex-col gap-4">
            <nav className="flex flex-col gap-3 font-black text-base uppercase">
              <a
                href="#home"
                onClick={(e) => handleNavClick(e, 'home')}
                className={`py-2 px-3 border-[2px] border-black ${
                  activeSection === 'home'
                    ? 'bg-[#ffe600] text-black shadow-[3px_3px_0px_#000]'
                    : 'bg-white text-gray-700'
                }`}
              >
                Home
              </a>
              <a
                href="#preview"
                onClick={(e) => handleNavClick(e, 'preview')}
                className={`py-2 px-3 border-[2px] border-black ${
                  activeSection === 'preview'
                    ? 'bg-[#ffe600] text-black shadow-[3px_3px_0px_#000]'
                    : 'bg-white text-gray-700'
                }`}
              >
                Preview
              </a>
              <a
                href="#about"
                onClick={(e) => handleNavClick(e, 'about')}
                className={`py-2 px-3 border-[2px] border-black ${
                  activeSection === 'about'
                    ? 'bg-[#ffe600] text-black shadow-[3px_3px_0px_#000]'
                    : 'bg-white text-gray-700'
                }`}
              >
                About
              </a>
            </nav>

            {isConnected ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-[#ff4d4d] text-white font-black text-sm uppercase py-3 border-[3px] border-black shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer mt-2"
              >
                <span>UNLINK DEVICE</span>
              </button>
            ) : (
              <button
                onClick={handleGenerateQR}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-black font-black text-sm uppercase py-3 border-[3px] border-black shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer mt-2"
              >
                <span>LINK DEVICE</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* main content */}
      <main className="flex-grow w-full bg-neo-dots py-8 md:py-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 space-y-12">

          {/* section 01 home */}
          <section id="home" className="border-[4px] border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_#000000] relative scroll-mt-24">
            <div className="absolute -top-5 left-4 bg-[#FFE600] text-black font-black text-xs uppercase px-3 py-1 border-[3px] border-black shadow-[2px_2px_0px_#000]">
              01 home
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b-[3px] border-black mb-6 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#FFE600] text-black font-bold text-[11px] uppercase px-2.5 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">BUILD: 2026.1A</span>
                <span className="bg-[#38BDF8] text-black font-bold text-[11px] uppercase px-2.5 py-1 border-[2px] border-black shadow-[2px_2px_0px_#000]">ENGINE: WEBP/SHARP</span>
              </div>
              <div className="font-bold text-[11px] uppercase text-gray-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] border border-black animate-pulse"></span>
                WEBSITE IS ONLINE
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4 text-left">
                <h1 className="font-black text-3xl md:text-5xl uppercase tracking-tight leading-tight">
                  Turn Graphics into WhatsApp Stickers in Seconds.
                </h1>
                <p ref={descRef} className="text-gray-700 font-medium text-base md:text-lg leading-relaxed min-h-[56px]"></p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      window.location.href = 'https://github.com/AhmadSyaukiM?tab=repositories';
                    }}
                    className="flex items-center gap-2 bg-[#FFE600] text-black font-black text-sm uppercase px-5 py-3 border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000000] transition-all cursor-pointer"
                  >
                    <span>SEEING OUR OTHER TOOLS</span>
                    <span className="text-base font-black">→</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 w-full">
                <div className="border-[4px] border-black bg-white shadow-[6px_6px_0px_#000000] p-6 relative">
                  <div className="flex items-center justify-between border-b-[3px] border-black pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#25D366] text-black font-bold text-[10px] px-2 py-0.5 border-[2px] border-black uppercase">DEVICE LINK</span>
                      <span className="font-black text-sm uppercase tracking-tight">STATION #01</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 border-[2px] border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_#000] ${
                        isConnected
                          ? 'bg-[#5dfd8a] text-black'
                          : qr
                          ? 'bg-[#5dfd8a] text-black'
                          : isInitializing
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-[#ff4d4d] text-white'
                      }`}
                    >
                      <span>
                        {isConnected
                          ? 'ONLINE'
                          : qr
                          ? 'READY'
                          : isInitializing
                          ? 'WAITING'
                          : 'UNREADY'}
                      </span>
                    </div>
                  </div>

                  <div className="border-[3px] border-dashed border-[#38BDF8] bg-[#F8FAFC] rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[320px]">
                    {loading ? (
                      <div className="space-y-3">
                        <div className="w-10 h-10 border-[4px] border-black border-t-[#FFE600] rounded-full animate-spin mx-auto"></div>
                        <p className="font-bold text-xs uppercase">Connecting to Server...</p>
                      </div>
                    ) : isConnected ? (
                      <div className="space-y-3 w-full bg-[#5dfd8a] border-[3px] border-black p-6 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white border-[2px] border-black flex items-center justify-center text-black">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h4 className="font-black text-lg uppercase">WhatsApp Connected!</h4>
                        <p className="text-xs font-bold text-gray-800">Bot is active & ready to process image stickers.</p>
                      </div>
                    ) : qr ? (
                      <div className="space-y-3 w-full">
                        <div className="inline-block">
                          <img src={qr} alt="WhatsApp QR Code" className="w-56 h-56 mx-auto block" />
                        </div>
                        <p className="text-xs font-bold text-gray-700 uppercase">
                          Open WhatsApp &gt; Linked Devices &gt; Scan QR Code
                        </p>
                      </div>
                    ) : isInitializing ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 border-[4px] border-black border-t-[#25D366] rounded-full animate-spin mx-auto"></div>
                        <p className="font-bold text-xs uppercase">Generating QR Code...</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-sm">
                        <div className="w-16 h-16 rounded-full bg-[#E0F2FE] border-[3px] border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <h3 className="font-black text-base uppercase">Connect your WhatsApp account</h3>
                        <p className="text-xs text-gray-600 font-medium">
                          Click "LINK DEVICE" on top navigation bar to generate QR Code scanner.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* section 02 preview deck */}
          <section id="preview" className="border-[4px] border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_#000000] space-y-6 relative scroll-mt-24">
            <div className="absolute -top-5 left-4 bg-[#38BDF8] text-black font-black text-xs uppercase px-3 py-1 border-[3px] border-black shadow-[2px_2px_0px_#000]">
              02 PREVIEW DECK
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b-[3px] border-black pb-4 gap-2 pt-2">
              <div>
                <span className="bg-[#FFE600] text-black font-bold text-[10px] uppercase px-2 py-0.5 border-[2px] border-black">PREVIEW STICKER</span>
                <h2 className="font-black text-2xl uppercase tracking-tight mt-1">Generated WhatsApp Pack Preview</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 grid grid-cols-2 gap-3">
                {STICKER_SAMPLES.map((item) => (
                  <div key={item.id} className="border-[3px] border-black bg-white p-2 shadow-[3px_3px_0px_#000000] space-y-2 group">
                    <div className="h-28 checkered-pattern border-[2px] border-black flex items-center justify-center p-2 relative overflow-hidden group-hover:scale-105 transition-transform">
                      <img src={item.src} alt={item.name} className="w-20 h-20 object-contain drop-shadow-[2px_2px_0px_#000]" onError={(e) => { (e.target as HTMLImageElement).src = item.fallback; }} />
                      <span className="absolute bottom-1 right-1 bg-black text-white text-[9px] font-bold px-1">WEBP</span>
                    </div>
                    <div className="text-center font-bold text-[11px] uppercase truncate">{item.name}</div>
                  </div>
                ))}
              </div>

              {/* section 03 live chat testbed */}
              <div className="lg:col-span-6 border-[3px] border-black bg-[#EFEAE2] p-3 shadow-[4px_4px_0px_#000000]">
                <div className="flex items-center gap-2 border-[2px] border-black bg-[#075E54] text-white p-2 text-xs font-bold uppercase mb-3 shadow-[2px_2px_0px_#000]">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                  <span>WA LIVE CHAT TESTBED</span>
                  <span className="ml-auto text-[9px] bg-[#25D366] text-black px-1.5 py-0.5 font-black border border-black">
                    ENCRYPTED
                  </span>
                </div>

                <div className="space-y-2.5 font-sans text-xs">
                  <div className="flex items-start justify-end gap-1.5">
                    <div className="bg-[#DCF8C6] p-2 max-w-[75%] border-[2px] border-black rounded-lg shadow-[2px_2px_0px_#000] text-gray-800">
                      Bisa tolong ubah ini jadi stiker ya?
                      <div className="text-[9px] text-right text-gray-500 mt-0.5">10:48 AM</div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-[2px] border-black overflow-hidden shrink-0 bg-amber-100 flex items-center justify-center">
                      <img
                        src="/images/user-avatar.png"
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/user/100';
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-1.5">
                    <div className="bg-[#DCF8C6] p-1.5 border-[2px] border-black rounded-lg shadow-[2px_2px_0px_#000] max-w-[55%]">
                      <div className="border border-black overflow-hidden rounded bg-gray-100">
                        <img
                          src="/images/sample-image.png"
                          alt="Uploaded Image"
                          className="w-full h-28 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/wa/250/200';
                          }}
                        />
                      </div>
                      <div className="text-[9px] text-right text-gray-500 mt-1 px-1">10:48 AM</div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-[2px] border-black overflow-hidden shrink-0 bg-amber-100 flex items-center justify-center">
                      <img
                        src="/images/user-avatar.png"
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/user/100';
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-start gap-1.5">
                    <div className="w-6 h-6 rounded-full border-[2px] border-black overflow-hidden shrink-0 bg-[#38BDF8] flex items-center justify-center">
                      <img
                        src="/images/bot-avatar.png"
                        alt="Bot Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/bot/100';
                        }}
                      />
                    </div>
                    <div className="bg-white p-2 max-w-[75%] border-[2px] border-black rounded-lg shadow-[2px_2px_0px_#000]">
                      <p className="font-bold text-[#075E54] text-[11px]">Generating sticker...</p>
                      <p className="text-[10px] text-gray-700">Processing your image and creating a sticker pack.</p>
                      <div className="text-[9px] text-right text-gray-400 mt-0.5">10:49 AM</div>
                    </div>
                  </div>

                  <div className="flex items-start justify-start gap-1.5">
                    <div className="w-6 h-6 rounded-full border-[2px] border-black overflow-hidden shrink-0 bg-[#38BDF8] flex items-center justify-center">
                      <img
                        src="/images/bot-avatar.png"
                        alt="Bot Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/bot/100';
                        }}
                      />
                    </div>
                    <div className="bg-white p-1.5 border-[2px] border-black rounded-lg shadow-[2px_2px_0px_#000] max-w-[50%] space-y-1">
                      <div className="p-1 flex items-center justify-center">
                        <img
                          src="/images/sample-sticker.png"
                          alt="Result Sticker"
                          className="w-24 h-24 object-contain drop-shadow-[2px_2px_0px_#000]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/bird/200';
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-bold text-[#075E54] border-t border-gray-200 pt-1 px-1">
                        <span className="flex items-center gap-1">✓ Sticker created!</span>
                        <span className="text-[8px] text-gray-400 font-normal">10:49 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* section 03 about & security */}
          <section id="about" className="border-[4px] border-black bg-gray-200 p-6 md:p-8 shadow-[6px_6px_0px_#000000] relative scroll-mt-24">
            <div className="absolute -top-5 left-4 bg-[#C084FC] text-black font-black text-xs uppercase px-3 py-1 border-[3px] border-black shadow-[2px_2px_0px_#000]">
              03 ABOUT & SECURITY
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="border-[3px] border-black bg-white p-4 space-y-2">
                <div className="bg-[#FFE600] w-10 h-10 border-[2px] border-black flex items-center justify-center font-black text-base">01</div>
                <h3 className="font-black text-sm uppercase">Auto-Fit & WebP Engine</h3>
                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                  Automatically convert images to WebP format at 512 x 512 px resolution with a transparent background.
                </p>
              </div>
              <div className="border-[3px] border-black bg-white p-4 space-y-2">
                <div className="bg-[#5dfd8a] w-10 h-10 border-[2px] border-black flex items-center justify-center font-black text-base">02</div>
                <h3 className="font-black text-sm uppercase">Privacy & Security 100% Safe</h3>
                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                  All connections are sent directly to official WhatsApp servers via encrypted WebSocket E2E.
                </p>
              </div>
              <div className="border-[3px] border-black bg-white p-4 space-y-2">
                <div className="bg-[#38BDF8] w-10 h-10 border-[2px] border-black flex items-center justify-center font-black text-base">03</div>
                <h3 className="font-black text-sm uppercase">Direct WebSocket Hook</h3>
                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                  Simply link your device once via QR Scanner without needing manual extraction.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* github button */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce">
        <a
          href="https://github.com/AhmadSyaukiM"
          target="_blank"
          rel="noopener noreferrer"
          title="Visit GitHub Profile"
          className="w-12 h-12 rounded-full bg-black text-white border-[3px] border-white shadow-[4px_4px_0px_#000000] hover:bg-gray-900 flex items-center justify-center"
        >
          <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
      </div>

      <footer className="bg-white border-t-[4px] border-black py-6">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase">
          <div>© 2026 Y.BOT — RAW DIGITAL CRAFT. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
}
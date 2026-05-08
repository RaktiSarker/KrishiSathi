import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Leaf, LogOut, User, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = [
    { name: "হোম", href: "#home" },
    { name: "সুবিধাসমূহ", href: "#features" },
    { name: "সুপারিশ নিন", href: "#recommendation" },
    { name: "আমাদের সম্পর্কে", href: "#about" },
  ];

  // profilePic is either a base64 data URL or a server path — use directly
  const avatarUrl = user?.profilePic || null;

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">
              Krishi<span className="text-primary">Sathi</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </a>
            ))}

            {/* User profile dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                id="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-green-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{user?.name}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* User info */}
                    <div className="p-4 border-b border-border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-green-500 flex items-center justify-center text-white font-bold">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.phone}</p>
                          {(user?.city || user?.country) && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {[user.city, user.country].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        প্রোফাইল
                      </button>
                      <button
                        id="logout-btn"
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        লগআউট
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}

                {/* Mobile user info */}
                <div className="border-t border-border pt-3 mt-2">
                  <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-green-500 flex items-center justify-center text-white font-bold">
                      {avatarUrl ? <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" /> : <span>{initials}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.phone}</p>
                    </div>
                  </div>
                  <Button variant="destructive" className="w-full" onClick={() => { logout(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" /> লগআউট
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;

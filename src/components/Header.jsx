// src/components/Header.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Telescope, LayoutDashboard, FileUp, Info } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Files', to: '/arquivos', icon: <FileUp className="h-5 w-5" /> },
  { label: 'About', to: '/sobre', icon: <Info className="h-5 w-5" /> },
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Telescope className="h-6 w-6" />
          <span className="font-bold text-lg">Exoplanet Hunter</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 transition-colors hover:text-foreground/80 ${
                  isActive ? 'text-foreground' : 'text-foreground/60'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-6 p-6">
                <Link to="/" className="flex items-center gap-2 mb-4">
                    <Telescope className="h-6 w-6" />
                    <span className="font-bold text-lg">Exoplanet Hunter</span>
                </Link>
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 text-lg font-medium hover:text-primary"
                  >
                    {item.icon && React.cloneElement(item.icon, { className: 'h-6 w-6' })}
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
// components/Header.tsx

import Link from "next/link"
import { Menu, Zap, Aperture, Dumbbell, Soup, Heart } from "lucide-react"

// NOTE: Since you don't have a shared 'Button' component,
// I'm using standard HTML <a> tags styled with Tailwind to mimic the look
// of the buttons in the image (outlined 'Login' and filled 'Signup').

export function Header() {
  return (
    <header className="flex items-center justify-between h-20 px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border/50">
      {/* Logo and Name */}
      <Link href="#" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-foreground">
        <Zap className="w-5 h-5 text-destructive" />
        <span className="font-poppins">SAKHI</span>
        <span className="text-xs font-normal text-muted-foreground ml-2">AI-Powered Women's Health</span>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden lg:flex space-x-8 text-sm font-medium">
        <NavLink href="#" icon={Aperture}>Dashboard</NavLink>
        <NavLink href="#" icon={Dumbbell}>Devices</NavLink>
        <NavLink href="#" icon={Dumbbell}>Exercise</NavLink>
        <NavLink href="#" icon={Soup}>Nutrition</NavLink>
        <NavLink href="#" icon={Heart}>Health</NavLink>
      </nav>

      {/* Auth Buttons: Login and Signup */}
      <div className="flex space-x-3">
        {/* LOGIN Button (Outlined/Ghost style) */}
        <Link 
          href="/login" 
          className="px-4 py-2 text-sm font-medium text-destructive border border-destructive rounded-full hover:bg-destructive/10 transition-colors"
        >
          Login
        </Link>
        
        {/* SIGNUP Button (Filled/Primary style, using destructive color for the pink/red look) */}
        <Link 
          href="/signup" 
          className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
        >
          Signup
        </Link>
        
        {/* Mobile Menu (Optional) */}
        <button className="lg:hidden text-foreground">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  )
}

// Helper component for navigation links
function NavLink({ href, icon: Icon, children }: { href: string, icon: any, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-muted-foreground hover:text-destructive transition-colors flex items-center"
    >
      <Icon className="w-4 h-4 mr-1" />
      {children}
    </Link>
  )
}
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store';
import { LayoutDashboard, History, Book, Settings, LogOut, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import CommandMenu from './CommandMenu';
import MobileFab from './MobileFab';


import { useAuth } from '../hooks/useAuth';

export default function Layout() {
    const { isSidebarOpen } = useStore();
    const { user, signInWithGoogle, signOut } = useAuth();
    const location = useLocation();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/timeline', label: 'Timeline', icon: History },
        { href: '/goals', label: 'Goals', icon: Target },
        { href: '/knowledge', label: 'Knowledge', icon: Book },
    ];

    return (
        <div className="fixed inset-0 flex w-full bg-canvas dark:bg-zinc-950 text-text-primary dark:text-zinc-50 p-2 gap-2 overflow-hidden">
            <CommandMenu />
            <MobileFab />
            {/* Sidebar (Desktop) - Bento Island Mode */}
            <aside className={cn(
                "hidden md:flex flex-col gap-2 h-full z-50 bg-transparent transition-all duration-300",
                isSidebarOpen ? "w-64" : "w-16"
            )}>
                {/* Island 1: Header/Logo */}
                <div className="gradient-pastel-animated rounded-2xl border border-border-subtle dark:border-zinc-900 shadow-card p-4 h-16 flex items-center gap-3 shrink-0">
                    <img
                        src="/logo.png"
                        alt="CareerFly Logo"
                        className="h-10 w-10 rounded-lg shadow-sm object-cover shrink-0 select-none"
                    />
                    {isSidebarOpen && (
                        <span
                            className="text-2xl text-[#4f8af1] animate-in fade-in duration-300 transform -rotate-2 origin-left"
                            style={{ fontFamily: '"Permanent Marker", cursive' }}
                        >
                            CareerFly
                        </span>
                    )}
                </div>

                {/* Island 2: Navigation */}
                <nav className="gradient-pastel-animated rounded-2xl border border-border-subtle dark:border-zinc-900 shadow-card flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors duration-200 group relative focus:outline-none focus:ring-0 select-none",
                                    isActive
                                        ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-50 font-normal"
                                        : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-300 font-normal active:bg-gray-100 dark:active:bg-zinc-800"
                                )}
                            >
                                <item.icon size={20} className={cn("transition-colors", isActive ? "text-gray-900 dark:text-zinc-50" : "text-gray-500 dark:text-zinc-600 group-hover:text-gray-900 dark:group-hover:text-zinc-400")} />
                                {isSidebarOpen && <span>{item.label}</span>}
                            </Link>
                        )
                    })}

                    <Link
                        to="/settings"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors duration-200 group relative focus:outline-none focus:ring-0 select-none",
                            location.pathname === '/settings'
                                ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-50 font-normal"
                                : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-300 font-normal active:bg-gray-100 dark:active:bg-zinc-800"
                        )}
                    >
                        <Settings size={20} className={cn("transition-colors", location.pathname === '/settings' ? "text-gray-900 dark:text-zinc-50" : "text-gray-500 dark:text-zinc-600 group-hover:text-gray-900 dark:group-hover:text-zinc-400")} />
                        {isSidebarOpen && <span>Settings</span>}
                    </Link>
                </nav>

                {/* Island 3: Footer/User */}
                <div className="gradient-pastel-animated rounded-2xl border border-border-subtle dark:border-zinc-900 shadow-card p-2 shrink-0">
                    {user ? (
                        <div className={cn("flex items-center gap-2", isSidebarOpen ? "px-2 pb-1 pt-1" : "justify-center")}>
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm object-cover"
                            />
                            {isSidebarOpen && (
                                <>
                                    <div className="flex-1 min-w-0 flex flex-col items-start overflow-hidden">
                                        <span className="text-sm font-medium truncate w-full text-zinc-900 dark:text-zinc-200">
                                            {user.displayName}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 truncate w-full">
                                            Free Plan
                                        </span>
                                    </div>
                                    <button
                                        onClick={signOut}
                                        className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-500 text-zinc-400 transition-colors"
                                        title="Sign Out"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                                "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-300"
                            )}
                        >
                            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">G</div>
                            {isSidebarOpen && <span>Sign In</span>}
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content - Island Mode */}
            <main className="flex-1 rounded-2xl border border-border-subtle dark:border-zinc-900 bg-[#efefe8] dark:bg-zinc-950/50 shadow-sm overflow-hidden relative h-full notebook-grid">
                <div className="h-full overflow-y-auto scroll-smooth">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Nav (Bottom) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-border-subtle dark:border-zinc-800/50 z-50 flex justify-around items-center px-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-1 transition-colors",
                                isActive ? "text-text-secondary" : "text-zinc-600"
                            )}
                        >
                            <item.icon size={24} />
                            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}

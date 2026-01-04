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
        <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
            <CommandMenu />
            <MobileFab />
            {/* Sidebar (Desktop) */}
            <aside className={cn(
                "hidden md:flex flex-col border-r border-zinc-900 bg-zinc-950/50 backdrop-blur-xl transition-all duration-300 z-50 sticky top-0 h-screen",
                isSidebarOpen ? "w-64" : "w-16 items-center"
            )}>
                <div className="p-4 flex items-center gap-2 border-b border-zinc-900 h-16">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center font-bold text-white">
                        CF
                    </div>
                    {isSidebarOpen && <span className="font-bold text-lg tracking-tight">CareerFly</span>}
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-zinc-900 text-indigo-400 shadow-sm ring-1 ring-zinc-800"
                                        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                                )}
                            >
                                <item.icon size={20} className={cn("transition-colors", isActive ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400")} />
                                {isSidebarOpen && <span>{item.label}</span>}
                            </Link>
                        )
                    })}


                    <Link
                        to="/settings"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                            location.pathname === '/settings'
                                ? "bg-zinc-900 text-indigo-400 shadow-sm ring-1 ring-zinc-800"
                                : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                        )}
                    >
                        <Settings size={20} className={cn("transition-colors", location.pathname === '/settings' ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400")} />
                        {isSidebarOpen && <span>Settings</span>}
                    </Link>
                </nav>

                <div className="p-4 border-t border-zinc-900 space-y-2">


                    <button
                        onClick={() => user ? signOut() : signInWithGoogle()}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 w-full transition-colors rounded-lg",
                            user
                                ? "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                : "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                        )}
                    >
                        {user ? (
                            <>
                                <LogOut size={20} />
                                {isSidebarOpen && <span>Sign Out</span>}
                            </>
                        ) : (
                            <>
                                <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">G</div>
                                {isSidebarOpen && <span>Sign In</span>}
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative flex flex-col bg-zinc-950 min-w-0">
                <Outlet />
            </main>

            {/* Mobile Nav (Bottom) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/50 z-50 flex justify-around items-center px-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center p-1 transition-colors",
                                isActive ? "text-indigo-400" : "text-zinc-600"
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

import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
    HomeIcon,
    CreditCardIcon,
    TagIcon,
    BellIcon,
    CurrencyDollarIcon,
    CurrencyRupeeIcon,
    ArrowPathIcon,
    XMarkIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    BanknotesIcon,
    ChatBubbleBottomCenterTextIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { DocumentScannerIcon } from '../icons';

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen, user, handleLogout, unreadCount }) => {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
        { name: 'Categories', href: '/categories', icon: TagIcon },
        { name: 'Reports', href: '/reports', icon: ChartBarIcon },
        { name: 'Budgets', href: '/budgets', icon: CurrencyRupeeIcon },
        { name: 'Recurring', href: '/recurring-transactions', icon: ArrowPathIcon },
        { name: 'Notifications', href: '/notifications', icon: BellIcon },
        { name: 'Investments', href: '/investments', icon: BanknotesIcon },
        { name: 'Add from SMS', href: '/sms-sync', icon: ChatBubbleBottomCenterTextIcon },
        { name: 'Scan Bill', href: '/bill-upload', icon: DocumentScannerIcon }
    ];

    const Logo = () => (
        <div className="flex items-center px-6 py-8 border-b border-gray-800/50 group cursor-default">
            <div className="relative flex h-12 w-12 items-center justify-center transition-transform duration-500 group-hover:scale-110">
                {/* Abstract Money/Compass Logo */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full opacity-20 blur-md animate-pulse group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl transition-all duration-500 group-hover:rotate-[360deg] group-hover:border-emerald-500/50">
                    <CurrencyRupeeIcon className="h-6 w-6 text-emerald-400" />
                </div>
                {/* Decorative dot - orbits on hover */}
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full border-2 border-[#0F172A] transition-all duration-500 group-hover:top-8 group-hover:-right-2"></div>
            </div>
            <div className="ml-3 flex flex-col justify-center">
                <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1 transition-all duration-300 group-hover:tracking-wider">
                    Financial
                </h1>
                <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 bg-emerald-500 rounded-full transition-all duration-300 group-hover:w-full"></div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] transition-all duration-300 group-hover:text-emerald-300">
                        Compass
                    </span>
                </div>
            </div>
        </div>
    );
    const NavItem = ({ item, mobile = false, index }) => {
        const isActive = location.pathname === item.href;
        // Staggered entrance animation delay
        const animationDelay = `${index * 50}ms`;

        return (
            <Link
                key={item.name}
                to={item.href}
                onClick={() => mobile && setMobileMenuOpen(false)}
                style={{ animationDelay }}
                className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out animate-slide-in-left opacity-0 fill-mode-forwards ${isActive
                    ? 'bg-gradient-to-r from-yellow-500/10 to-transparent text-yellow-400 shadow-sm border-l-4 border-yellow-500 translate-x-1'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 hover:translate-x-1'
                    }`}
            >
                <item.icon
                    className={`h-5 w-5 mr-3 flex-shrink-0 transition-all duration-300 ${isActive ? 'text-yellow-400 scale-110' : 'text-gray-500 group-hover:text-gray-300 group-hover:scale-110'
                        }`}
                    aria-hidden="true"
                />
                <span className="flex-1">{item.name}</span>

                {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 ml-2 text-xs font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full ring-2 ring-gray-900 animate-bounce">
                        {unreadCount}
                    </span>
                )}

                {isActive && !mobile && ( // Glow effect for desktop
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-yellow-500/10 to-transparent rounded-r-xl pointer-events-none" />
                )}
            </Link>
        );
    };

    const UserProfile = () => (
        <div className="border-t border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center group cursor-pointer p-2 rounded-xl hover:bg-gray-800 transition-colors">
                <div className="flex-shrink-0 relative">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center ring-2 ring-gray-800 group-hover:ring-yellow-500/50 transition-all duration-300 group-hover:scale-105">
                        <span className="text-sm font-bold text-white">
                            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-gray-900 animate-pulse"></div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-yellow-400 transition-colors">
                        {user?.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="ml-2 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all hover:rotate-90 duration-300"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar (Drawer) */}
            <Transition.Root show={mobileMenuOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button type="button" className="-m-2.5 p-2.5" onClick={() => setMobileMenuOpen(false)}>
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>

                                {/* Mobile Drawer Content */}
                                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#0F172A] ring-1 ring-white/10">
                                    <Logo />
                                    <nav className="flex flex-1 flex-col px-4 pb-4">
                                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                            <li>
                                                <ul role="list" className="-mx-2 space-y-1">
                                                    {navigation.map((item, index) => (
                                                        <li key={item.name}>
                                                            <NavItem item={item} mobile={true} index={index} />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        </ul>
                                    </nav>
                                    <UserProfile />
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Desktop Sidebar (Static) */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
                {/* Sidebar Container */}
                <div className="flex grow flex-col overflow-y-auto bg-[#0F172A] border-r border-gray-800 shadow-2xl relative">

                    {/* Subtle Background Pattern/Glow */}
                    <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

                    <Logo />

                    <nav className="flex flex-1 flex-col px-4 mt-6">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4 animate-fade-in">
                            Menu
                        </div>
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-2">
                                    {navigation.map((item, index) => (
                                        <li key={item.name}>
                                            <NavItem item={item} index={index} />
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    </nav>


                    <UserProfile />

                </div>
            </div>
        </>
    );
};

export default Sidebar;

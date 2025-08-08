import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100/20">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Take Control of Your Finances
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  ExpenseTracker helps you manage your personal finances with ease. Track expenses, set budgets, and gain insights into your spending habits.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      >
                        Get Started
                      </Link>
                      <Link
                        to="/login"
                        className="text-sm font-semibold leading-6 text-gray-900"
                      >
                        Log in <span aria-hidden="true">→</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <div className="shadow-lg md:rounded-3xl">
              <div className="bg-primary-600 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                <div className="relative px-6 pt-8 sm:pt-16 md:pl-16 md:pr-0">
                  <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                    <div className="w-screen overflow-hidden rounded-tl-xl bg-gray-900">
                      <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                        <div className="-mb-px flex text-sm font-medium leading-6 text-gray-400">
                          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
                            Dashboard
                          </div>
                          <div className="border-r border-gray-600/10 px-4 py-2">
                            Transactions
                          </div>
                        </div>
                      </div>
                      <div className="px-6 pt-6 pb-14 bg-gray-50">
                        {/* Placeholder for dashboard preview */}
                        <div className="rounded-md bg-white p-4 shadow-sm mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Monthly Overview</h3>
                          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div className="rounded-md bg-green-50 p-3">
                              <p className="text-sm font-medium text-green-700">Income</p>
                              <p className="text-xl font-semibold text-green-700">$3,240</p>
                            </div>
                            <div className="rounded-md bg-red-50 p-3">
                              <p className="text-sm font-medium text-red-700">Expenses</p>
                              <p className="text-xl font-semibold text-red-700">$2,180</p>
                            </div>
                            <div className="rounded-md bg-blue-50 p-3">
                              <p className="text-sm font-medium text-blue-700">Balance</p>
                              <p className="text-xl font-semibold text-blue-700">$1,060</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-md bg-white p-4 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                          <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center border-b pb-2">
                              <div>
                                <p className="font-medium text-gray-900">Grocery Shopping</p>
                                <p className="text-sm text-gray-500">Food</p>
                              </div>
                              <p className="text-red-600 font-medium">-$85.20</p>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                              <div>
                                <p className="font-medium text-gray-900">Salary</p>
                                <p className="text-sm text-gray-500">Income</p>
                              </div>
                              <p className="text-green-600 font-medium">+$3,200.00</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">Internet Bill</p>
                                <p className="text-sm text-gray-500">Utilities</p>
                              </div>
                              <p className="text-red-600 font-medium">-$59.99</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 md:rounded-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto mt-12 max-w-7xl px-6 sm:mt-16 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Manage Better</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage your finances
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            ExpenseTracker provides all the tools you need to take control of your personal finances and make informed decisions about your money.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                </svg>
                Track Expenses and Income
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Easily record and categorize your transactions. Keep track of where your money is coming from and where it's going.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Set and Manage Budgets
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Create monthly budgets for different spending categories. Monitor your progress and get alerts when you're approaching your limits.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                Visualize Your Finances
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Get insightful reports and charts that help you understand your spending patterns and financial health at a glance.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA section */}
      <div className="mt-32 sm:mt-40 xl:mx-auto xl:max-w-7xl xl:px-8">
        <div className="relative isolate overflow-hidden bg-primary-600 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to take control of your finances?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-primary-100">
            Join thousands of users who have transformed their financial habits with ExpenseTracker.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Sign up for free
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-white">
                  Log in <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fill="url(#gradient)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="gradient">
                <stop stopColor="#fff" />
                <stop offset={1} stopColor="#fff" stopOpacity={0.3} />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 bg-gray-900 sm:mt-40">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} ExpenseTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
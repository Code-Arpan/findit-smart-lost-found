import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-grow w-full lg:w-3/4">
          <Outlet />
        </div>
        <aside className="w-full lg:w-1/4">
          <Sidebar />
        </aside>
      </main>
    </div>
  );
}

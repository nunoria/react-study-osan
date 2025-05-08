import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  return (
    <div>
      <Navigation />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
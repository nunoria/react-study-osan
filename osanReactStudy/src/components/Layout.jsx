import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { useSession } from '../hooks/Session';
import Login from '../pages/Login';

export default function Layout() {
  const { session } = useSession();

  if (!session) {
    return <Login />; // 세션이 없으면 로그인 페이지로 리다이렉트
  }

  return (
    <div>
      <Navigation />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
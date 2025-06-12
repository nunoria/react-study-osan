import { Link, useLocation } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { useSession, } from '../hooks/Session';
import { cn } from '../lib/util';

function Profile() {
    const { session, logout } = useSession();

    if (!session) {
        return null;
    }

    return (
        <div className="flex flex-row items-center gap-2">
            <span className='text-sm'>{session.name}</span>
            <div className="relative group h-32pxr">
                <button onClick={() => logout()}>
                    {
                        session.profileImage
                            ?
                            <img
                                src={`/img/${session.profileImage}`}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover object-contains"
                            />
                            :
                            <UserRound className="w-8 h-8 rounded-full p-1 text-gray-500 bg-white" />
                    }
                </button>
                <div className="absolute top-full-1 left-1/2 -translate-x-1/2 mb-2 w-max
                bg-white text-sm px-2 py-1 rounded opacity-0 shadow-sm border
                group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    <span>
                        로그아웃
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function Navigation() {
    const { isAdmin } = useSession();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div>
            {
                isAdmin &&
                <div className="bg-black text-white p-2 text-center">
                    관리자 모드
                </div>
            }
            <div className="bg-gray-100">
                <div className="container-fluid mx-auto flex justify-between items-center px-4">
                    <nav className="py-4 flex gap-6">
                        <Link to="/" className={cn(currentPath==='/'? "text-blue-600 font-bold": "")}>대쉬보드</Link>
                        <Link to="/LeaveRequest" className={cn(currentPath==='/LeaveRequest'? "text-blue-600 font-bold": "")}>연차신청</Link>
                        <Link to="/Attendance" className={cn(currentPath==='/Attendance'? "text-blue-600 font-bold": "")}>근태현황</Link>
                        {
                            isAdmin && <Link to="/Members" className={cn(currentPath==='/Members'? "text-blue-600 font-bold": "")}>직원현황</Link>
                        }
                    </nav>
                    <Profile />
                </div>
            </div>
        </div>
    );
}
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <div className="bg-gray-100">
      <nav className="container-fluid mx-auto p-4 flex flex gap-6">
        <Link to="/">근태입력</Link>
        <Link to="/LeaveRequest">연차신청</Link>
        <Link to="/Members">직원현황</Link>
        <Link to="/Dashboard">근태현황</Link>
      </nav>
    </div>
  );
}
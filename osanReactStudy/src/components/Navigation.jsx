import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="bg-gray-100 p-4">
      <Link to="/" className="mr-4">Home</Link>
      <Link to="/Members">Members</Link>
    </nav>
  );
}
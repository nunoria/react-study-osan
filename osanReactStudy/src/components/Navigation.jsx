import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <div className="bg-gray-100">
      <nav className="container-fluid mx-auto p-4">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/Members">Members</Link>
      </nav>
    </div>
  );
}
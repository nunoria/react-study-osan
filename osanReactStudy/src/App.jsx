import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Members from './pages/Members';
import Attendance from './pages/Attendance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Attendance />} />
          {/* <Route path="Members" element={<Members />} /> */}
          <Route path="Members" element={<Members />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;

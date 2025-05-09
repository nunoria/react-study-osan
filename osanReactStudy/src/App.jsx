import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import Layout from './components/Layout';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import { getAttendanceList, updateAttendanceList } from "./lib/storage";

const DEFIND_AUTO_CLOCKOUT_TIME = "23:59:00";
// 자동 퇴근 처리
function handleAutoClockOut() {
  const attendanceList = getAttendanceList();
  const now = dayjs();

  console.log("자동 퇴근 처리", now.format('YYYY-MM-DD HH:mm:ss'));
  attendanceList.forEach((record) => {
    // 출근시간이 있고 퇴근시간이 없는 경우
    if (!record.clockOutTime && record.clockInTime) {
      record.clockOutTime = now.format('HH:mm:ss');
      updateAttendanceList(record);
    }
  });
}

function App() {

  useEffect(() => {
    const interval = setInterval(() => {
      const autoClockOutTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T${DEFIND_AUTO_CLOCKOUT_TIME}`);

      // 30초마다 DEFIND_AUTO_CLOCKOUT_TIME 과 비교하여 같으면 처리
      if (dayjs().isSame(autoClockOutTime, 'minute')) {
        handleAutoClockOut();
      }
    }, 1000 * 30);

    return () => clearInterval(interval);
  }, []);

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

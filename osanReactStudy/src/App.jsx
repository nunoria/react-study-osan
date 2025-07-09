import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import LeaveRequest from './pages/LeaveRequest';
import { getAttendanceList, updateAttendanceList, setAttendanceList, setLeaveList, setMemberList } from "./lib/storage";
import attandanceList from './jsons/attendance.json';
import leaveList from './jsons/leave.json';
import memberList from './jsons/member.json';
import { Toaster } from 'react-hot-toast';
import { SessionProvider, useSession } from './hooks/Session';

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

    // json 파일을 storage에 저장
    setAttendanceList(attandanceList);
    setLeaveList(leaveList);
    setMemberList(memberList);

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
      <SessionProvider expireTime={600}>
        <Toaster position="bottom-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="LeaveRequest" element={<LeaveRequest />} />
            <Route path="Members" element={<Members />} />
            <Route path="Attendance" element={<Attendance />} />
          </Route>
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;

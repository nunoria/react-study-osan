import React, { useEffect, useState } from 'react';

// 샘플 유저 출결 데이터
const sampleAttendance = [
  {
    id: 1,
    name: '김철수',
    checkIn: '2024-06-13T08:55:00',
    checkOut: '2024-06-13T18:01:00',
  },
  {
    id: 2,
    name: '박영희',
    checkIn: '2024-06-13T09:12:00',
    checkOut: '2024-06-13T18:10:00',
  },
  {
    id: 3,
    name: '이민호',
    checkIn: '2024-06-13T08:40:00',
    checkOut: '2024-06-13T17:55:00',
  },
];

// 날짜 포맷 함수
const formatTime = (dateStr) => {
  if (!dateStr) return '--:--';
  const date = new Date(dateStr);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

const AttendanceDashboard = () => {
  const [filter, setFilter] = useState('today'); // today, yesterday 등
  const [weather, setWeather] = useState(null);
  const [historyUser, setHistoryUser] = useState(null); // 히스토리 모달용

  // 출근 시간 평균 계산
  const avgCheckIn =
    sampleAttendance.length > 0
      ? (
          sampleAttendance.reduce((acc, cur) => acc + new Date(cur.checkIn).getHours() + new Date(cur.checkIn).getMinutes() / 60, 0) /
          sampleAttendance.length
        ).toFixed(2)
      : '--';

  // 날씨 API 연동 (OpenWeatherMap, 서울 기준)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = '1405dd01ca4deec114dade67a252ac33'; // 실제 발급받은 API 키
        const url = `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${apiKey}&units=metric&lang=kr`;
        const res = await fetch(url);
        const data = await res.json();
        setWeather({
          temp: data.main.temp,
          desc: data.weather[0].description,
          icon: data.weather[0].icon,
        });
      } catch {
        setWeather(null);
      }
    };
    fetchWeather();
  }, []);

  // 날짜 필터링 (오늘/어제)
  const filteredAttendance = sampleAttendance.filter((item) => {
    const now = new Date();
    const checkInDate = new Date(item.checkIn);
    if (filter === 'today') {
      return (
        now.getFullYear() === checkInDate.getFullYear() &&
        now.getMonth() === checkInDate.getMonth() &&
        now.getDate() === checkInDate.getDate()
      );
    } else if (filter === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return (
        yesterday.getFullYear() === checkInDate.getFullYear() &&
        yesterday.getMonth() === checkInDate.getMonth() &&
        yesterday.getDate() === checkInDate.getDate()
      );
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">출결 대시보드</h2>

      {/* 날씨 정보 */}
      <div className="flex items-center gap-3 mb-4">
        {weather ? (
          <>
            <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt="날씨" />
            <span className="text-lg font-semibold dark:text-white">{weather.temp}°C</span>
            <span className="text-gray-600 dark:text-gray-300">{weather.desc}</span>
          </>
        ) : (
          <span className="text-gray-400">날씨 정보를 불러오는 중...</span>
        )}
      </div>

      {/* 날짜 필터 */}
      <div className="mb-4 flex gap-2">
        <button
          className={`px-3 py-1 rounded ${filter === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}
          onClick={() => setFilter('today')}
        >
          오늘
        </button>
        <button
          className={`px-3 py-1 rounded ${filter === 'yesterday' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}
          onClick={() => setFilter('yesterday')}
        >
          어제
        </button>
      </div>

      {/* 출근 평균 */}
      <div className="mb-4 text-gray-700 dark:text-gray-200">
        <span className="font-semibold">출근 시간 평균:</span> {avgCheckIn}시
      </div>

      {/* 유저 리스트 */}
      <table className="w-full text-center border-t">
        <thead>
          <tr className="border-b">
            <th className="py-2">이름</th>
            <th>출근</th>
            <th>퇴근</th>
            <th>상태</th>
            <th>히스토리</th>
          </tr>
        </thead>
        <tbody>
          {filteredAttendance.map((user) => {
            // 9시 이후 출근이면 지각(빨강), 9시 이전이면 정상(초록)
            const checkInDate = new Date(user.checkIn);
            const isLate = checkInDate.getHours() > 9 || (checkInDate.getHours() === 9 && checkInDate.getMinutes() > 0);
            return (
              <tr key={user.id} className="border-b">
                <td className="py-2 font-semibold dark:text-white">{user.name}</td>
                <td>{formatTime(user.checkIn)}</td>
                <td>{formatTime(user.checkOut)}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-white text-xs font-bold ${isLate ? 'bg-red-500' : 'bg-green-500'}`}>
                    {isLate ? '지각' : '정상'}
                  </span>
                </td>
                <td>
                  <button
                    className="text-blue-500 underline text-xs"
                    onClick={() => setHistoryUser(user)}
                  >
                    보기
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 출퇴근 히스토리 모달 (간단 구현) */}
      {historyUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-80">
            <h3 className="text-lg font-bold mb-2">{historyUser.name} 출퇴근 히스토리</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-200 mb-4">
              <li>출근: {formatTime(historyUser.checkIn)}</li>
              <li>퇴근: {formatTime(historyUser.checkOut)}</li>
              <li>상태: {new Date(historyUser.checkIn).getHours() > 9 ? '지각' : '정상'}</li>
            </ul>
            <button
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setHistoryUser(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard; 
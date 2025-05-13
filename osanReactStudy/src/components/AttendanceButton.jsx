import React, { useState, useEffect } from 'react';

const AttendanceButton = () => {
  // 상태 관리
  const [isWorking, setIsWorking] = useState(false); // 출근 상태
  const [isLate, setIsLate] = useState(false); // 지각 여부
  const [checkInTime, setCheckInTime] = useState(null); // 출근 시간
  const [checkOutTime, setCheckOutTime] = useState(null); // 퇴근 시간
  const [workingHours, setWorkingHours] = useState(0); // 근무 시간 (시간 단위)

  // 컴포넌트 마운트 시 localStorage에서 상태 복원
  useEffect(() => {
    const savedCheckInTime = localStorage.getItem('checkInTime');
    const savedIsWorking = localStorage.getItem('isWorking');
    
    if (savedCheckInTime && savedIsWorking === 'true') {
      const parsedTime = new Date(savedCheckInTime);
      setCheckInTime(parsedTime);
      setIsWorking(true);
      
      // 9시 이후 출근인지 확인
      checkIfLate(parsedTime);
      
      // 근무 시간 계산 및 표시
      calculateWorkingHours(parsedTime);
    }
  }, []);

  // 매 분마다 근무 시간 업데이트
  useEffect(() => {
    let timer;
    if (isWorking && checkInTime) {
      timer = setInterval(() => {
        calculateWorkingHours(checkInTime);
        
        // 8시간 이상 근무했으면 자동 퇴근 처리
        if (workingHours >= 8) {
          handleCheckOut();
        }
      }, 60000); // 1분마다 업데이트
    }
    
    return () => clearInterval(timer);
  }, [isWorking, checkInTime, workingHours]);

  // 9시 이후 출근인지 확인하는 함수
  const checkIfLate = (time) => {
    const checkInHour = time.getHours();
    const checkInMinute = time.getMinutes();
    
    // 9시 이후면 지각
    if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0)) {
      setIsLate(true);
    } else {
      setIsLate(false);
    }
  };

  // 근무 시간 계산 함수
  const calculateWorkingHours = (startTime) => {
    if (!startTime) return;
    
    const now = new Date();
    const diff = now - startTime; // 밀리초 단위 차이
    const hours = diff / (1000 * 60 * 60); // 시간 단위로 변환
    
    setWorkingHours(parseFloat(hours.toFixed(2)));
  };

  // 출근 버튼 클릭 이벤트 핸들러
  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now);
    setIsWorking(true);
    setCheckOutTime(null);
    
    // 지각 여부 확인
    checkIfLate(now);
    
    // localStorage에 출근 정보 저장
    localStorage.setItem('checkInTime', now.toString());
    localStorage.setItem('isWorking', 'true');
  };

  // 퇴근 버튼 클릭 이벤트 핸들러
  const handleCheckOut = () => {
    const now = new Date();
    setCheckOutTime(now);
    setIsWorking(false);
    
    // localStorage 정보 초기화
    localStorage.removeItem('checkInTime');
    localStorage.removeItem('isWorking');
    
    // 최종 근무 시간 계산
    if (checkInTime) {
      calculateWorkingHours(checkInTime);
    }
  };

  // 시간 형식을 포맷팅하는 함수
  const formatTime = (date) => {
    if (!date) return '--:--';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 transition">
      <h2 className="text-xl font-bold mb-4 text-center dark:text-white">근태 관리</h2>
      
      {/* 출근/퇴근 시간 표시 */}
      <div className="flex justify-between mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">출근 시간</p>
          <p className="text-lg font-semibold dark:text-white">{formatTime(checkInTime)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">퇴근 시간</p>
          <p className="text-lg font-semibold dark:text-white">{formatTime(checkOutTime)}</p>
        </div>
      </div>
      
      {/* 근무 상태 표시 */}
      <div className="mb-4">
        <div className="flex items-center justify-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isWorking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <p className="text-center dark:text-white">
            {isWorking ? '근무 중' : '퇴근 완료'}
          </p>
        </div>
        
        {/* 지각 표시 */}
        {isLate && isWorking && (
          <p className="text-red-500 text-center mt-2 text-sm font-semibold">
            지각입니다! (9시 이후 출근)
          </p>
        )}
        
        {/* 근무 시간 표시 */}
        {isWorking && (
          <p className="text-center mt-2 text-sm dark:text-gray-300">
            근무 시간: {workingHours.toFixed(2)}시간
            {workingHours >= 8 && " (일일 목표 달성!)"}
          </p>
        )}
      </div>
      
      {/* 출근/퇴근 버튼 */}
      <button
        onClick={isWorking ? handleCheckOut : handleCheckIn}
        className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
          isWorking 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isWorking ? '퇴근하기' : '출근하기'}
      </button>
    </div>
  );
};

export default AttendanceButton; 
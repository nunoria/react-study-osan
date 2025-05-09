import { useState, useEffect } from "react";
import dayjs from 'dayjs';
import { getAttendanceList, updateAttendanceList } from "../lib/storage";
import AttendanceRecord from "../class/AttendanceRecord";
import memberList from "../jsons/member.json";
import { cn } from "../lib/util";
import { Search } from "lucide-react";

function CurrentTime() {
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row gap-2 items-center">
                <span className="text-lg font-semibold">
                    {currentTime.format('YYYY년 M월 D일 A h:mm:ss')}
                </span>
            </div>
        </div>
    );
}

export default function Attendance() {

    const [searchInput, setSearchInput] = useState("");
    const [attendanceRecord, setAttendanceRecord] = useState(null);
    const [msg, setMsg] = useState("");
    const [workingTime, setWorkingTime] = useState(null);

    useEffect(() => {
        if (!attendanceRecord) return;

        if (attendanceRecord.clockOutTime) {
            setWorkingTime(attendanceRecord.getWorkingDuration());
            return;
        }
        // 출근시간이 있는 경우에만 근무시간 계산
        const interval = setInterval(() => {
            setWorkingTime(attendanceRecord.getWorkingDuration());
        }, 1000);
        return () => clearInterval(interval);
    }, [attendanceRecord]);

    const handleSearch = () => {

        // 1. memberlist 에서 ID 찾기 없는경우 결과 표시
        const foundMember = memberList.find(member => member.name.toLowerCase() === searchInput.toLowerCase());
        if (!foundMember) {
            setMsg("해당 이름을 가진 팀원이 없습니다.");
            setAttendanceRecord(null);
            return;
        }

        // 2. attandanceList 에서 memberId 로 오늘날짜 레코드 찾기
        const attendanceList = getAttendanceList();
        const foundAttendance = attendanceList.find(attendance => {
            const isToday = dayjs(attendance.date).isSame(dayjs(), 'day');
            return attendance.memberId === foundMember.id && isToday;
        });

        // 3. foundAttendance 가 없으면 새로운 레코드 생성, 있으면 기존 레코드 사용
        setAttendanceRecord(foundAttendance || AttendanceRecord.newRecord({
            memberId: foundMember.id,
            standardClockInTime: foundMember.standardClockInTime || "09:00:00",
            standardClockOutTime: foundMember.standardClockOutTime || "18:00:00",
        }));
        setSearchInput("");
    }

    const bgcolor = (status) =>
    ({
        '미출근': "bg-gray-100",
        '지각': "bg-red-100",
        '정상': "bg-green-100",
        '조퇴': "bg-orange-100",
        '지각+조퇴': "bg-yellow-100",
    }[status] || "bg-gray-100");

    return (
        <div>
            <section id="header" className="container-fluid mx-auto p-4">
                <h1 className="text-2xl font-bold">출퇴근 입력</h1>
            </section>
            <section id="current_time" className="container-fluid mx-auto p-4 pt-0" >
                {/* 연월일 및 현재 시간 표기 */}
                <CurrentTime />
            </section>
            <section id="search" className="container-fluid mx-auto p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <input type="text" id="searchInput"
                            className="border border-gray-300 p-2 rounded-md focus:border-blue-500 focus:outline-none"
                            placeholder="이름 검색"
                            value={searchInput}
                            onChange={e => { setSearchInput(e.target.value); setMsg("") }}
                            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                        />
                        <button id="searchBtn"
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
                            onClick={handleSearch}>
                            <Search /></button>
                    </div>
                    { /* message 보여주기 */
                        msg.length > 0 && <div className="text-red-500 px-1">{msg}</div>
                    }
                </div>
            </section>
            <section id="result" className="container-fluid mx-auto p-4">
                {/* 2. attendance record 보여주기 */
                    attendanceRecord &&
                    <div className="flex flex-col p-1 mb-2 gap-1 items-start rounded-md w-fit">
                        <div className="flex flex-row gap-2 items-center">
                            <span className="text-gray-400 text-lg font-semibold">{memberList.find(member => member.id === attendanceRecord.memberId).name}</span>
                            {/* 상태배지 */}
                            <span className={cn(
                                "text-xs font-semibold px-6pxr py-2pxr rounded-md",
                                bgcolor(attendanceRecord.status)
                            )}>{attendanceRecord.status}</span>
                        </div>
                        {   /* 출근시간 */
                            attendanceRecord.clockInTime && <span className="text-sm text-gray-500">출근시간: {attendanceRecord.clockInTime}</span>}
                        {   /* 퇴근시간 */
                            attendanceRecord.clockOutTime && <span className="text-sm text-gray-500">퇴근시간: {attendanceRecord.clockOutTime}</span>}
                        {   /* 근무시간 보여주기 */
                            attendanceRecord.clockInTime && <div className="text-sm text-gray-500">근무시간: {workingTime}</div>}
                    </div>
                }
                {
                    /* 3. 출근 버튼, 퇴근 버튼 */
                    attendanceRecord && !attendanceRecord.clockInTime &&
                    <button className="bg-green-600/90 hover:bg-green-600 text-white p-6pxr px-4 rounded-md"
                        onClick={() => {
                            const newRecord = attendanceRecord.clockIn();
                            updateAttendanceList(newRecord);
                            setAttendanceRecord(newRecord);
                            // setMsg("출근 완료");
                        }}
                    >
                        출근
                    </button>
                }
                {
                    attendanceRecord && attendanceRecord.clockInTime &&
                    <button className="bg-sky-600/90 hover:bg-sky-600 text-white p-6pxr px-4 text-white p-2 rounded-md"
                        onClick={() => {
                            const newRecord = attendanceRecord.clockOut();
                            updateAttendanceList(newRecord);
                            setAttendanceRecord(newRecord);
                            // setMsg("퇴근 완료");
                        }}
                    >
                        퇴근
                    </button>
                }

            </section>
        </div>
    )
}
import { useState, useEffect, useMemo } from "react";
import dayjs from 'dayjs';
import { getAttendanceList, updateAttendanceList, getMember } from "../lib/storage";
import AttendanceRecord from "../class/AttendanceRecord";
import { cn } from "../lib/util";
import Badge from "../components/Badge";
import { WeatherCard } from "../components/Card";
import { useSession } from "../hooks/Session";

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
                <span className="text-lg font-semibold text-gray-500">
                    {currentTime.format('HH:mm:ss')}
                </span>
            </div>
        </div>
    );
}

function RecentAttendanceTable({ children, className, list, ...props }) {

    if (!list || list.length === 0) {
        return <p className="text-gray-500">출퇴근 기록이 없습니다.</p>;
    }

    const statusColorMap = {
        '미출근': "gray",
        '지각': "red",
        '정상': "green",
        '조퇴': "orange",
        '지각+조퇴': "yellow",
    };

    return (
        <table className={cn("w-full border-collapse", className)} {...props}>
            <thead>
                <tr className="bg-gray-100">
                    <th className="text-left p-2">날짜</th>
                    <th className="text-left p-2">출근 시간</th>
                    <th className="text-left p-2">퇴근 시간</th>
                    <th className="text-left p-2">상태</th>
                </tr>
            </thead>
            <tbody>
                {list.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="p-2">
                            {record.clockInTime || "미출근"}
                        </td>
                        <td className="p-2">
                            {record.clockOutTime || "미퇴근"}
                        </td>
                        <td className="p-2">
                            <Badge color={statusColorMap[record.status] || 'gray'}>
                                {record.status}
                            </Badge>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default function Dashboard() {

    const [attendanceRecord, setAttendanceRecord] = useState(null);
    // const [workingTime, setWorkingTime] = useState(null);
    const [attendanceList, setAttendanceList] = useState([]);

    const { session } = useSession();

    useEffect(() => {
        if (!attendanceRecord) return;

        // 세션이 있을 때만 근태 기록을 뒤에서 4건 가져오기
        const list = getAttendanceList({ memberId: session.id }).slice(-4).reverse()
        setAttendanceList(list);

        // if (attendanceRecord.clockOutTime) {
        //     setWorkingTime(attendanceRecord.getWorkingDuration());
        //     return;
        // }
        // // 출근시간이 있는 경우에만 근무시간 계산
        // const interval = setInterval(() => {
        //     setWorkingTime(attendanceRecord.getWorkingDuration());
        // }, 1000);
        // return () => clearInterval(interval);
    }, [attendanceRecord]);

    useEffect(() => {
        if (!session) return;

        const foundMember = getMember({ memberId: session.id });

        // 유저의 근태기록을 가져온다
        const userAttendanceList = getAttendanceList({ memberId: session.id })

        const todayAttendance = userAttendanceList.find(attendance => {
            const isToday = dayjs(attendance.date).isSame(dayjs(), 'day');
            return attendance.memberId === foundMember.id && isToday;
        });

        // todayAttendance 가 없으면 새로운 레코드 생성, 있으면 기존 레코드 사용
        setAttendanceRecord(todayAttendance || AttendanceRecord.newRecord({
            memberId: foundMember.id,
            standardClockInTime: foundMember.standardClockInTime || "09:00:00",
            standardClockOutTime: foundMember.standardClockOutTime || "18:00:00",
        }));

    }, [session]);

    const statusColorMap = {
        '미출근': "gray",
        '지각': "red",
        '정상': "green",
        '조퇴': "orange",
        '지각+조퇴': "yellow",
    };

    const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

    if (!session) {
        return (
            <div className="container-fluid mx-auto p-4">
                <h1 className="text-2xl font-bold">접근 권한이 없습니다.</h1>
            </div>
        );
    }

    if (!attendanceRecord) {
        return (
            <div className="container-fluid mx-auto p-4">
                <h1 className="text-2xl font-bold">ㅣloading..</h1>
            </div>
        );
    }

    return (
        <div>
            <section id="header" className="container-fluid mx-auto p-4">
                <h1 className="text-2xl font-bold">대쉬보드</h1>
            </section>
            <section id="today_info" className="container-fluid mx-auto p-4">
                <div className="border rounded-md flex flex-row gap-2 p-2 items-center">
                    <div className="flex flex-col gap-2 w-1/4">
                        <h2 className=" text-lg font-bold">{today}</h2>
                        <WeatherCard />
                    </div>
                    <div className="w-full flex flex-col gap-1">
                        <div className="">
                            <span className="font-bold">{session.name}</span>
                            <span>님, 오늘의 정보</span>
                        </div>
                        <div className="text-sm text-gray-500 flex flex-col">
                            <div className="">
                                <span>근태: </span>
                                <Badge color={statusColorMap[attendanceRecord.status] || 'gray'}>
                                    {attendanceRecord.status}
                                </Badge>
                            </div>
                            {   /* 출근시간 */
                                attendanceRecord.clockInTime && <span>출근시간: {attendanceRecord.clockInTime}</span>}
                            {   /* 퇴근시간 */
                                attendanceRecord.clockOutTime && <span>퇴근시간: {attendanceRecord.clockOutTime}</span>}
                        </div>
                    </div>
                </div>
            </section>
            <section id="request_attendance" className="container-fluid mx-auto p-4">
                {
                    /* 3. 출근 버튼, 퇴근 버튼 */
                    attendanceRecord && !attendanceRecord.clockInTime &&
                    <button className="flex flex-col gap-2 w-200pxr h-40 rounded-md bg-green-400 hover:bg-green-500 cursor-pointer flex flex-row items-center justify-center"
                        onClick={() => {
                            const newRecord = attendanceRecord.clockIn();
                            updateAttendanceList(newRecord);
                            setAttendanceRecord(newRecord);
                            // setMsg("출근 완료");
                        }}
                    >
                        <CurrentTime />
                        <span className="text-lg text-white font-bold">출근하기</span>
                    </button>
                }
                {
                    attendanceRecord && attendanceRecord.clockInTime &&
                    <button className="flex flex-col gap-2 w-200pxr h-40 rounded-md bg-orange-400 hover:bg-orange-500 cursor-pointer flex flex-row items-center justify-center"
                        onClick={() => {
                            const newRecord = attendanceRecord.clockOut();
                            updateAttendanceList(newRecord);
                            setAttendanceRecord(newRecord);
                            // setMsg("퇴근 완료");
                        }}
                    >
                        <CurrentTime />
                        <span className="text-lg text-white font-bold">퇴근하기</span>
                    </button>
                }
            </section>
            <section id="recent_attendance" className="container-fluid mx-auto p-4">
                <h2 className="text-xl font-semibold mb-2">최근 출퇴근 기록</h2>
                <RecentAttendanceTable list={attendanceList} />
            </section>
        </div>
    )
}
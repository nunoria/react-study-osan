import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { getAttendanceList } from "../lib/storage";
import memberJson from "../jsons/member.json";
import { cn } from "../lib/util";
import Badge from "../components/Badge";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from "../components/Select";

function AttendanceTable({ children, className, list, ...props }) {

    if (!list || list.length === 0) {
        return <p className="text-gray-500">출퇴근 기록이 없습니다.</p>;
    }

    const averageWorkingTimeSec = list.reduce((total, record) => {
        const duration = record.getWorkingDuration();
        if (duration) {
            const [hours, minutes, seconds] = duration.split(':').map(Number);
            return total + (hours * 3600 + minutes * 60 + seconds);
        }
        return total;
    }, 0) / list.length;

    const averageWorkingTime = new Date(averageWorkingTimeSec * 1000).toISOString().substr(11, 8); // HH:mm:ss 형식으로 변환

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
                    <th className="text-left p-2">이름</th>
                    <th className="text-left p-2">출근 시간</th>
                    <th className="text-left p-2">퇴근 시간</th>
                    <th className="text-left p-2">상태</th>
                </tr>
            </thead>
            <tbody>
                {list.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="p-2">{
                            memberJson.find(member => member.id === record.memberId)?.name || "알 수 없음"
                        }</td>
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
                <tr>
                    <td className="p-2" colSpan="2">
                        <span className="text-gray-500">총 {list.length}건</span>
                    </td>
                    <td className="p-2" colSpan="3">
                        <span className="text-gray-500">{`평균 근무 시간: ${averageWorkingTime}`}</span>
                    </td>

                </tr>
            </tbody>
        </table>
    );
}

export default function Dashboard() {

    const [range, setRange] = useState("today");
    const [input, setInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [attendanceList, setAttendanceList] = useState(null);

    useEffect(() => {
        // storage에서 근태 현황 읽어오기
        const list = getAttendanceList();
        const today = new Date();

        // range 값을 기준으로 필터링
        let filteredList = list.filter(record => {
            const attendanceDate = new Date(record.date);
            switch (range) {
                case "today":
                    return attendanceDate.toDateString() === today.toDateString();
                case "week":
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    return attendanceDate >= startOfWeek && attendanceDate <= today;
                case "month":
                    return attendanceDate.getMonth() === today.getMonth() && attendanceDate.getFullYear() === today.getFullYear();
                case "all":
                default:
                    return true;
            }
        });

        if (searchKeyword.length > 0) {
            const memberId = memberJson.find(m => m.name.includes(searchKeyword))?.id;

            console.log(`검색어:${searchKeyword}(memberId:${memberId})`);
            filteredList = filteredList.filter(record => record.memberId === memberId);
        }

        // 최근 날짜순으로 정렬
        filteredList.sort((a, b) => new Date(b.date) - new Date(a.date));

        setAttendanceList(filteredList);

    }, [range, searchKeyword]);

    return (
        <div>
            <section id="header">
                <div className="container-fluid mx-auto p-4">
                    <h1 className="text-2xl font-bold">근태 현황</h1>
                </div>
            </section>
            <section id="filter">
                <div className="container-fluid mx-auto p-4 flex flex-row gap-8">
                    <div className="flex flex-row gap-1">
                        <input id="search"
                            type="text" placeholder="이름 검색"
                            className="border rounded-md p-2 w-200pxr focus:border-blue-500 focus:outline-none"
                            value={input}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setSearchKeyword(input);
                                }
                            }}
                            onChange={(e) => setInput(e.target.value)} />
                        <button id="searchBtn" onClick={() => { setSearchKeyword(input); }}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md">
                            <Search />
                        </button>
                    </div>

                    <Select value={range} onValueChange={setRange}
                        className="min-w-100pxr">
                        <SelectTrigger />
                        <SelectContent>
                            <SelectItem value="today">오늘</SelectItem>
                            <SelectItem value="week">이번 주</SelectItem>
                            <SelectItem value="month">이번 달</SelectItem>
                            <SelectItem value="all">전체</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </section>
            <section id="list" className="container-fluid mx-auto p-4">
                <AttendanceTable list={attendanceList} />
            </section>
        </div>
    );
}
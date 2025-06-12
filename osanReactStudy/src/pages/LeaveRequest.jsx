import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../components/Select';
import DatePicker from '../components/DatePicker';
import Badge from '../components/Badge';
import { getLeaveList, updateLeaveList, getMember } from '../lib/storage';
import LeaveRecord from '../class/LeaveRecord';
import { useSession } from '../hooks/Session';

function LeaveTable({ userLeaveList }) {
    if (!userLeaveList || userLeaveList.length === 0) {
        return <p className="text-gray-500">연차 사용 내역이 없습니다.</p>;
    }

    // type 에 따른 색상 및 라벨
    const TypeBadge = ({ type }) => {
        const badgeStyles = {
            ANNUAL: { color: "green", label: "연차" },
            HALF: { color: "orange", label: "반차" },
            QUATER: { color: "orange", label: "반반차" },
            SICK: { color: "red", label: "병가" }
        };

        const { color, label } = badgeStyles[type] || { color: "gray", label: type };
        return <Badge className="text-xs" color={color}>{label}</Badge>;
    };


    return (
        <table className="w-full border-collapse">
            <thead>
                <tr className="bg-gray-100">
                    <th className="p-2 border">날짜</th>
                    <th className="p-2 border">타입</th>
                    <th className="p-2 border">사용여부</th>
                </tr>
            </thead>
            <tbody>
                {userLeaveList.map((leave, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 border">{leave.date}</td>
                        <td className="p-2 border">
                            <TypeBadge type={leave.type} />
                        </td>
                        <td className="p-2 border">
                            {
                                // 오늘 이전날짜는 사용, 오늘 이후 날짜는 미사용
                                dayjs(leave.date).isBefore(dayjs(), 'day') ?
                                    <Badge className="text-xs" color="gray">사용함</Badge> :
                                    <Badge className="text-xs" color="yellow">미사용</Badge>
                            }
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default function LeaveRequest() {

    const [user, setUser] = useState(null);
    const [startDay, setStartDay] = useState(null);
    const [endDay, setEndDay] = useState(null);
    const [type, setType] = useState("ANNUAL");
    const [reason, setReason] = useState("");
    const [remainDays, setRemainDays] = useState(0);
    const [userLeaveList, setUserLeaveList] = useState([]);
    const { session } = useSession();

    useEffect(() => {

        if (!session) {
            setUser(null);
            setUserLeaveList([]);
            return;
        }

        // 세션 정보가 있는 경우 user 정보 가져오기
        const foundMember = getMember({
            memberId: session.id
        })
        if (foundMember) {
            const userLeaveList = getLeaveList({
                memberId: foundMember.id
            })

            setUser(foundMember);
            setUserLeaveList(userLeaveList);
        } else {
            console.error("로그인된 유저가 없습니다.");
        }

    }, [session]);

    useEffect(() => {
        if (!user) return;

        // ANNUAL 인경우 1, HALF 인경우 0.5, QUATER 인경우 0.25, SICK 인경우 0 으로 합산
        const usedAnnualDays = userLeaveList.reduce((acc, leave) => {
            if (leave.type === "ANNUAL") return acc + 1;
            if (leave.type === "HALF") return acc + 0.5;
            if (leave.type === "QUATER") return acc + 0.25;
            return acc; // SICK 은 0 이므로 그대로 반환
        }, 0);

        // 잔여 연차 일수 소수점 2자리까지 표시
        const totalAnnualDays = user.standardAnnualLeaveDays || 0;
        const remainingDays = totalAnnualDays - usedAnnualDays;
        setRemainDays(remainingDays);
    }, [userLeaveList]);

    useEffect(() => {
        // 시작 날짜 변경시, 종료날짜보다 늦거나 종료날짜가 없는경우
        // 종료 날짜를 시작 날짜로 설정
        if (startDay && (!endDay || startDay > endDay)) {
            setEndDay(startDay);
        }

    }, [startDay]);

    const validateForm = () => {
        if (!startDay || !endDay || !reason) {
            toast.error("모든 필드를 입력해주세요.");
            return false;
        }

        if (!startDay || !endDay) {
            toast.error("시작 날짜와 종료 날짜를 모두 선택해주세요.");
            return false;
        }
        if (startDay > endDay) {
            toast.error("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
            return false;
        }
        if (!reason.trim()) {
            toast.error("사유를 입력해주세요.");
            return false;
        }
        // 오늘 이전의 날짜는 신청 불가
        const today = dayjs().startOf('day');
        const start = dayjs(startDay).startOf('day');
        const end = dayjs(endDay).startOf('day');
        if (start.isBefore(today) || end.isBefore(today)) {
            toast.error("오늘 이전의 날짜는 신청할 수 없습니다.");
            return false;
        }

        // 병가가 아닌경우 신청 기간이 남은 연차 일수보다 많으면 에러 토,일 제외하고 연차 일수 계산
        if (type === "SICK") {
            return true; // 병가는 기간 제한 없음
        }

        const totalDays = end.diff(start, 'day') + 1; // 시작일 포함
        const weekends = [];
        for (let d = start; d.isBefore(end) || d.isSame(end); d = d.add(1, 'day')) {
            if (d.day() === 0 || d.day() === 6) { // 일요일(0) 또는 토요일(6)
                weekends.push(d);
            }
        }
        const workingDays = totalDays - weekends.length; // 주말 제외한 근무일수
        if (workingDays <= 0) {
            toast.error("신청 기간에 주말만 포함되어 있습니다. 주말을 제외한 근무일수를 선택해주세요.");
            return false;
        }
        console.log(`신청 기간: ${totalDays}일, 주말 제외 근무일수: ${workingDays}일`);

        // type 에 따른 연차 일수 계산, 반차는 0.5, 반반차는 0.25, 연차는 1 을 곱함
        const calculatedRequiredDays = (() => {
            switch (type) {
                case "ANNUAL":
                    return workingDays; // 연차는 근무일수 그대로
                case "HALF":
                    return workingDays * 0.5; // 반차는 0.5배
                case "QUATER":
                    return workingDays * 0.25; // 반반차는 0.25배
                case "SICK":
                    return 0; // 병가는 0일로 처리
                default:
                    return workingDays; // 기본적으로 연차로 처리
            }
        })();

        if (calculatedRequiredDays > remainDays) {
            toast.error(`신청 기간 ${calculatedRequiredDays}일이 남은 연차 일수를 초과합니다.`);
            return false;
        }

        return true;
    }

    const onClear = () => {
        setStartDay(null);
        setEndDay(null);
        setType("ANNUAL");
        setReason("");
    }

    const onSubmit = () => {
        if (!validateForm()) {
            return;
        }

        // 주말 제외한 실제 근무일을 기준으로 1일씩 레코드를 분리 생성
        const start = dayjs(startDay);
        const end = dayjs(endDay);
        const leaveRecords = [];
        for (let d = start; d.isBefore(end) || d.isSame(end); d = d.add(1, 'day')) {
            if (d.day() !== 0 && d.day() !== 6) { // 주말 제외
                leaveRecords.push(
                    new LeaveRecord({
                        date: d.format('YYYY-MM-DD'),
                        type: type,
                        memberId: user.id,
                        requestId: null
                    })
                );
            }
        }
        //userLeaveList 의 date 중복 체크하여 신청된 날짜가 있는 경우 toast
        const existingDates = userLeaveList.map(leave => leave.date);
        const duplicateDates = leaveRecords.filter(record => existingDates.includes(record.date));
        if (duplicateDates.length > 0) {
            toast.error(`이미 신청된 날짜가 있습니다: ${duplicateDates.map(record => record.date).join(', ')}`);
            return;
        }

        // 휴가 기록을 업데이트
        leaveRecords.forEach(record => updateLeaveList(record));
        toast.success("연차 신청이 완료되었습니다.");

        // userLeaveList 업데이트
        setUserLeaveList(prevList => [...prevList, ...leaveRecords]);
        // 폼 초기화
        onClear();
    }

    if (!user) {
        return <div className="text-center p-4">로그인된 유저가 없습니다.</div>;
    }

    return (
        <div>
            <section id="header" className="container-fluid mx-auto p-4">
                <h1 className="text-2xl font-bold">연차 신청</h1>
            </section>
            <section id="leave_request_form"
                className='container-fluid mx-auto p-4 flex flex-col gap-4'>
                {/* 남은 연차 일수 */}
                <div className="text-md">
                    <span className="font-bold">{user.name}</span>
                    <span className="">{"님의 남은 연차일수는 "}</span>
                    <span className="text-lg font-bold text-red-500">{remainDays}일</span>
                    <span>{" 입니다"}</span>
                </div>
                <div className="flex gap-4">
                    {/* 타입 선택 */}
                    <Select value={type} onValueChange={setType}
                        className="min-w-100pxr">
                        <SelectTrigger />
                        <SelectContent>
                            <SelectItem value="ANNUAL">연차</SelectItem>
                            <SelectItem value="HALF">반차</SelectItem>
                            <SelectItem value="QUATER">반반차</SelectItem>
                            <SelectItem value="SICK">병가</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* 기간 */}
                    <div className="flex flex-row gap-1 items-center">
                        <DatePicker value={startDay} onValueChange={setStartDay}>{"시작 날짜"}</DatePicker>
                        <span>~</span>
                        <DatePicker value={endDay} onValueChange={setEndDay}>{"종료 날짜"}</DatePicker>
                    </div>
                </div>
                <div className="">
                    {/* 사유 입력 */}
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                        rows="6"
                        placeholder="사유를 입력하세요..."
                        maxLength="500"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                </div>
                <div className="flex flex-row gap-4">
                    <button
                        onClick={onSubmit}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md px-10">
                        신청
                    </button>
                    <button
                        onClick={onClear}
                        className="bg-gray-300 hover:bg-gray-400 text-black p-2 rounded-md px-10">
                        취소
                    </button>
                </div>
            </section>
            <section id="leave_request_result"
                className='container-fluid mx-auto p-4'>
                <h2 className="text-xl font-bold mb-4">연차 사용 내역</h2>
                <LeaveTable userLeaveList={userLeaveList} />
            </section>
        </div>
    );

}
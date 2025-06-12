import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getAttendanceList, getMemberList } from "../lib/storage";
import { TeamMemberCard } from "../components/Card";
import { useSession } from "../hooks/Session";

export default function Members() {

  const [memberList, setMemberList] = useState([]);
  const { isAdmin } = useSession();

  // 근태 현황 읽어 오기
  useEffect(() => {
    const list = getMemberList();
    const attendanceList = getAttendanceList();

    // memberList 에 근태 현황 속성 추가
    const updatedMemberList = list.map((member) => {
      const attendanceRecord = attendanceList.find(
        (record) =>
          record.memberId === member.id &&
          record.date === dayjs().format('YYYY-MM-DD')
      );

      if (attendanceRecord) {
        return {
          ...member,
          attandanceStatus: attendanceRecord.status,
        };
      } else {
        return {
          ...member,
          attandanceStatus: "미출근",
        };
      }
    });

    setMemberList(updatedMemberList);
  }, []);

  // 관리자가 아닌경우 접근권한 없음을 보여준다.
  if (!isAdmin) {
    return (
      <div className="container-fluid mx-auto p-4">
        <h1 className="text-2xl font-bold">접근 권한이 없습니다.</h1>
      </div>
    );
  }

  return (
    <div>
      <section id="header" className="container-fluid mx-auto p-4">
        <h1 className="text-2xl font-bold">직원 리스트</h1>
      </section>
      <section id="team_members" className="container-fluid mx-auto p-4">
        <div
          className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4
        gap-3 md:gap-4"
        >
          {memberList.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </div>
      </section>
    </div>
  );
}

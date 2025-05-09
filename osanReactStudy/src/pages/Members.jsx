import { useEffect, useState } from "react";
import { TeamMemberCard } from "../components/Card";
import memberJson from "../jsons/member.json";
import { getAttendanceList } from "../lib/storage";
import dayjs from "dayjs";

export default function Members() {

  const [memberList, setMemberList] = useState(memberJson);

  // 근태 현황 읽어 오기
  useEffect(() => {
    const attendanceList = getAttendanceList();

    // memberList 에 근태 현황 속성 추가
    const updatedMemberList = memberList.map((member) => {
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

  return (
    <div>
      <section id="header" className="container-fluid mx-auto p-4">
        <h1 className="text-2xl font-bold">Team Members</h1>
      </section>
      <section id="team_members" className="container-fluid mx-auto p-4">
        <div
          className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4
        gap-3 md:gap-4"
        >
          {memberList.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
          <TeamMemberCard />
        </div>
      </section>
    </div>
  );
}

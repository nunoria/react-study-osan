import { RectangleEllipsis } from "lucide-react";
import { Modal, ModalTrigger, ModalContent } from "./Modal";
import { cn } from "../lib/util";

function ModalMember({ children, member }) {
  return (
    <Modal className="bg-black/70">
      <ModalTrigger>{children}</ModalTrigger>
      <ModalContent>
        <div className="flex flex-col gap-3">
          <h2 name="title" className="text-center text-lg font-semibold">
            Member Deatil Info
          </h2>
          <div name="information" className="flex flex-col gap-1">
            <p className="text-gray-500">이름: {member?.name || "정보없음"}</p>
            <p className="text-gray-500">
              부서: {member?.department || "정보없음"}
            </p>
            <p className="text-gray-500">
              입사일: {member?.joinedAt || "정보없음"}
            </p>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

/* 입사 연차 계산,
 * param: joinedAt (string) - 입사일
 * return: {years, months} (object) - 연,월
 */
const calcSeniority = (joinedAt) => {
  const joinedDate = new Date(joinedAt);
  const today = new Date();
  const years = today.getFullYear() - joinedDate.getFullYear();
  const months = today.getMonth() - joinedDate.getMonth();

  const totalMonths = years * 12 + months;
  const yearsResult = Math.floor(totalMonths / 12);
  const monthsResult = totalMonths % 12;
  return { years: yearsResult, months: monthsResult };
};

/*
 * props: member {
 *   name: (string),
 *   department: (string),
 *   joinedAt: (string)
 * } (object)
 */
function TeamMemberCard({ member }) {
  if (!member) {
    return (
      <div className="w-64 p-4 border rounded-lg shadow mb-4 text-left">
        정보 없음
      </div>
    );
  }

  const { years, months } = calcSeniority(member.joinedAt);
  const seniorityText =
    (Number(years) > 0 ? `${years}년` : "") + ` ${months}개월`;

  const bgcolor = {
    default: "bg-white",
    Engineering: "bg-blue-100",
    Design: "bg-green-100",
    Marketing: "bg-yellow-100",
  };

  return (
    <div
      className={cn(
        "w-full p-4 border rounded-lg shadow text-left",
        bgcolor[member?.department ?? "default"]
      )}
    >
      <ModalMember member={member}>
        <div
          className="flex flex-row items-end gap-2pxr cursor-pointer hover:scale-105 origin-left"
          onClick={() => console.log(member)}
        >
          <h2 className="text-lg font-semibold ">
            {member?.name || "이름 없음"}
          </h2>
          <RectangleEllipsis className="text-gray-500 h-22pxr" />
        </div>
      </ModalMember>
      <p className="text-sm text-gray-600">
        부서: {member?.department || "정보 없음"}
      </p>
      <p className="text-sm text-gray-600">
        입사일: {member?.joinedAt || "정보 없음"}
      </p>
      <p className="text-sm text-gray-600">
        연차: {seniorityText || "정보 없음"}
      </p>
    </div>
  );
}

export default TeamMemberCard;

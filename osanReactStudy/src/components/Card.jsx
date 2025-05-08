import React, { useState } from "react";
import { Modal, ModalContent, ModalClose } from "./Modal";
import { cn } from "../lib/util";

function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "border-gray-300 border rounded-md cursor-pointer transition-transform hover:scale-105 will-change-transform",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* 입사 연차 계산,
 * @param: joinedAt (string) - 입사일
 * @return (string)
 */
const getSeniority = (joinedAt) => {
  const joinedDate = new Date(joinedAt);
  // 오류 처리: 잘못된 날짜 형식인 경우
  if (isNaN(joinedDate.getTime())) return "정보 없음";

  const today = new Date();
  const years = today.getFullYear() - joinedDate.getFullYear();
  const months = today.getMonth() - joinedDate.getMonth();

  const totalMonths = years * 12 + months;
  const yearsResult = Math.floor(totalMonths / 12);
  const monthsResult = totalMonths % 12;
  return (
    (Number(yearsResult) > 0 ? `${yearsResult}년` : "") + ` ${monthsResult}개월`
  );
};

/*
 * @props: member {
 *   name: (string),
 *   department: (string),
 *   joinedAt: (string)
 * } (object)
 */
function TeamMemberCard({ member }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (!member) {
    return (
      <Card className="w-full p-4 rounded-lg flex items-center justify-center text-gray-500">
        정보 없음
      </Card>
    );
  }

  const bgcolor = (dept) =>
    ({
      Engineering: "bg-blue-100",
      Design: "bg-green-100",
      Marketing: "bg-yellow-100",
    }[dept] || "bg-white");

  return (
    <>
      <Card
        className={cn(
          "w-full p-4 rounded-lg text-left",
          bgcolor(member?.department)
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <h2 className="text-lg font-semibold ">
          {member?.name || "이름 없음"}
        </h2>
        <p className="text-sm text-gray-600">
          부서: {member?.department || "정보 없음"}
        </p>
        <p className="text-sm text-gray-600">
          입사일: {member?.joinedAt || "정보 없음"}
        </p>
        <p className="text-sm text-gray-600">
          연차: {getSeniority(member?.joinedAt)}
        </p>
      </Card>
      <Modal
        className="bg-black/70"
        onOpenChange={setIsModalOpen}
        open={isModalOpen}
      >
        <ModalContent>
          <div className="flex flex-col gap-3 mb-3">
            <h2 name="title" className="text-center text-lg font-semibold">
              Member Deatil Info
            </h2>
            <div name="information" className="flex flex-col gap-1">
              <p className="text-gray-500">
                이름: {member?.name || "정보없음"}
              </p>
              <p className="text-gray-500">
                부서: {member?.department || "정보없음"}
              </p>
              <p className="text-gray-500">
                입사일: {member?.joinedAt || "정보없음"}
              </p>
            </div>
          </div>
          <ModalClose className="w-full p-6pxr rounded-md text-center bg-blue-600 hover:bg-blue-600/90">
            <span className="text-white">닫기</span>
          </ModalClose>
        </ModalContent>
      </Modal>
    </>
  );
}

export { Card, TeamMemberCard };

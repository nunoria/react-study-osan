import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalClose } from "./Modal";
import { cn } from "../lib/util";
import Badge from "./Badge";

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

  const statusColorMap = {
    '미출근': "gray",
    '지각': "red",
    '정상': "green",
    '조퇴': "orange",
    '지각+조퇴': "yellow",
  };

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
        <p className="text-sm text-gray-600">
          {"근태 현황: "}
          <Badge color={statusColorMap[member?.attandanceStatus] || 'gray'}>
            {member?.attandanceStatus || "정보 없음"}
          </Badge>
        </p>
      </Card >
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

const APIKEY = "3e87b3cbf44a5bd009380b0afad104bb";
const BASEURL = "https://api.openweathermap.org/data/2.5/weather";
const CITY = "Seoul";
const weatherIconMap = {
  "01d": { label: "맑음", emoji: "☀️" },
  "01n": { label: "맑은 밤", emoji: "🌙" },
  "02d": { label: "구름 조금", emoji: "🌤" },
  "02n": { label: "구름 조금 (밤)", emoji: "🌤🌙" },
  "03d": { label: "구름 많음", emoji: "🌥" },
  "03n": { label: "구름 많음 (밤)", emoji: "🌥🌙" },
  "04d": { label: "흐림", emoji: "☁️" },
  "04n": { label: "흐림 (밤)", emoji: "☁️🌙" },
  "09d": { label: "소나기", emoji: "🌧" },
  "09n": { label: "소나기 (밤)", emoji: "🌧🌙" },
  "10d": { label: "비", emoji: "🌦" },
  "10n": { label: "비 (밤)", emoji: "🌧🌙" },
  "11d": { label: "천둥번개", emoji: "🌩" },
  "11n": { label: "천둥번개 (밤)", emoji: "🌩🌙" },
  "13d": { label: "눈", emoji: "❄️" },
  "13n": { label: "눈 (밤)", emoji: "❄️🌙" },
  "50d": { label: "안개", emoji: "🌫" },
  "50n": { label: "안개 (밤)", emoji: "🌫🌙" }
};

function WeatherCard({ className, ...props }) {
  const [weatherData, setweatherData] = useState(null);

  useEffect(() => {
    fetch(`${BASEURL}?q=${CITY}&APPID=${APIKEY}&units=metric`)
      .then((res) => {
        if (!res.ok) {
          console.log("날씨 정보 오류:", res);
          throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
        }
        return res.json();
      })
      .then((data) => {
        setweatherData({
          ...data,
          label: weatherIconMap[data.weather[0].icon]?.label || "정보 없음",
          emoji: weatherIconMap[data.weather[0].icon]?.emoji || ""
        });
      })
      .catch((error) => {
        console.error("날씨 정보 오류:", error);
        setweatherData(null);
      });
  }, []);

  return (
    <div className={cn("border w-full p-2 rounded-lg text-left", className)} {...props}>
      {
        weatherData
          ?
          <div>
            <h2 className="text-md font-semibold">날씨 정보</h2>
            <p className="text-sm text-gray-600">
              날씨: {weatherData.label} {weatherData.emoji}
            </p>
            <p className="text-sm text-gray-600">
              기온: {weatherData.main.temp} °C
            </p>
            <p className="text-sm text-gray-600">
              습도: {weatherData.main.humidity}%
            </p>
          </div>
          :
          <p className="text-gray-500">날씨 정보 없음</p>
      }
    </div>
  );
}

export { Card, TeamMemberCard, WeatherCard };

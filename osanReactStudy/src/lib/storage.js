import AttendanceRecord from '../class/AttendanceRecord.jsx';
import LeaveRecord from '../class/LeaveRecord.jsx';

const STORAGE_ATTENDANCE_KEY = 'attendanceList';
const STORAGE_LEAVE_KEY = 'leaveList';
const STORAGE_MEMBER_KEY = 'memberList';

/* localStorage 에서 출퇴근 기록을 가져옴
* @returns {AttendanceRecord[]} 출퇴근 기록 배열
*/
export function getAttendanceList({ memberId } = {}) {
    const raw = localStorage.getItem(STORAGE_ATTENDANCE_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (typeof memberId === "undefined") { // id가 undefined 이면 전체 기록을 반환
            return parsed.map((item) => AttendanceRecord.fromStorage(item));
        }
        if (memberId === null) { // id가 null 이면 빈 배열 반환
            return [];
        }
        if (typeof memberId !== "number") {
            console.error('memberId must be a number');
            return [];
        }
        return parsed
            .map((item) => AttendanceRecord.fromStorage(item))
            .filter((item) => item.memberId === memberId);
    } catch (e) {
        console.error('Failed to parse attendance list:', e);
        return [];
    }
}

/* 출퇴근 기록을 localStorage 에 저장
* @param {AttendanceRecord} record - 출퇴근 기록
*/
export function updateAttendanceList(record) {
    const list = getAttendanceList();
    const index = list.findIndex(item => item.id === record.id);

    if (index !== -1) {
        list[index] = record; // update
    } else {
        record.id = list.length + 1; // assign new ID
        list.push(record); // add
    }

    const raw = JSON.stringify(list);
    localStorage.setItem(STORAGE_ATTENDANCE_KEY, raw);
}

/* 출퇴근 기록을 localStorage 에 저장
* @param {AttendanceRecord[]} list - 출퇴근 기록 배열
*/
export function setAttendanceList(list) {
    const raw = JSON.stringify(list);
    localStorage.setItem(STORAGE_ATTENDANCE_KEY, raw);
}

/* localStorage 에서 휴가 기록을 가져옴
* @param {
    memberId : number | null ,
} options - 옵션 객체
* @returns {LeaveRecord[]} 휴가 기록 배열
*/
export function getLeaveList({ memberId } = {}) {

    const raw = localStorage.getItem(STORAGE_LEAVE_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (typeof memberId === "undefined") { // id가 undefined 이면 전체 기록을 반환
            return parsed.map((item) => LeaveRecord.fromStorage(item));
        }
        if (memberId === null) { // id가 null 이면 빈 배열 반환
            return [];
        }
        return parsed
            .map((item) => LeaveRecord.fromStorage(item))
            .filter((item) => item.memberId === memberId);

    } catch (e) {
        console.error('Failed to parse leave list:', e);
        return [];
    }
}

/* 휴가 기록을 localStorage 에 저장
* @param {LeaveRecord} record - 휴가 기록
*/
export function updateLeaveList(record) {
    const list = getLeaveList();
    const index = list.findIndex(item => item.id === record.id);

    if (index !== -1) {
        list[index] = record; // update
    } else {
        record.id = list.length + 1; // assign new ID
        list.push(record); // add
    }

    const raw = JSON.stringify(list);
    localStorage.setItem(STORAGE_LEAVE_KEY, raw);
}

/* 휴가 기록을 localStorage 에 저장
* @param {LeaveRecord[]} list - 휴가 기록 배열
*/
export function setLeaveList(list) {
    const raw = JSON.stringify(list);
    localStorage.setItem(STORAGE_LEAVE_KEY, raw);
}

/* localStorage 에서 멤버 리스트를 가져옴
* @returns {Object[]} 멤버 리스트 배열
*/
export function getMemberList() {
    const raw = localStorage.getItem(STORAGE_MEMBER_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to parse member list:', e);
        return [];
    }
}

/* 멤버 리스트를 localStorage 에 저장
* @param {Object[]} memberList - 멤버 리스트 배열
*/
export function setMemberList(memberList) {
    const raw = JSON.stringify(memberList);
    localStorage.setItem(STORAGE_MEMBER_KEY, raw);
}

// memberId 에 해당하는 멤버 정보를 localStorage 에서 가져옴
export function getMember({ memberId } = {}) {
    const raw = localStorage.getItem(STORAGE_MEMBER_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (typeof memberId === "undefined" || memberId === null) {
            return null;
        }
        if (typeof memberId !== "number") {
            console.error('memberId must be a number');
            return null;
        }
        return parsed.find((item) => item.id === memberId) || null;
    } catch (e) {
        console.error('Failed to parse member list:', e);
        return null;
    }

}
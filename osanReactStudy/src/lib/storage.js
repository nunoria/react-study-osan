import AttendanceRecord from '../class/AttendanceRecord.jsx';
import LeaveRecord from '../class/LeaveRecord.jsx';

const STORAGE_ATTENDANCE_KEY = 'attendanceList';
const STORAGE_LEAVE_KEY = 'leaveList';

/* localStorage 에서 출퇴근 기록을 가져옴
* @returns {AttendanceRecord[]} 출퇴근 기록 배열
*/
export function getAttendanceList() {
    const raw = localStorage.getItem(STORAGE_ATTENDANCE_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return parsed.map((item) => AttendanceRecord.fromStorage(item));
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
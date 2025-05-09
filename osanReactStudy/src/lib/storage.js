import AttendanceRecord from '../class/AttendanceRecord.jsx';

const STORAGE_KEY = 'attendanceList';

/* localStorage 에서 출퇴근 기록을 가져옴
* @returns {AttendanceRecord[]} 출퇴근 기록 배열
*/
export function getAttendanceList() {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, raw);
}

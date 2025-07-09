import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

/*
* @class AttendanceRecord
* @description 출퇴근 기록을 관리하는 클래스입니다.
* @property {number} id - 출퇴근 기록 ID
* @property {number} memberId - 팀원 ID
* @property {string} date - 출퇴근 날짜 (YYYY-MM-DD 형식)
* @property {string} standardClockInTime - 정규 출근시간 (HH:mm:ss 형식)
* @property {string} standardClockOutTime - 정규 퇴근시간 (HH:mm:ss 형식)
* @property {string} clockInTime - 출근시간 (HH:mm:ss 형식)
* @property {string} clockOutTime - 퇴근시간 (HH:mm:ss 형식)
* @property {string} status - 출퇴근 상태 (미출근, 지각, 정상, 조퇴, 지각+조퇴)
* @property {string} workingDuration - 근무 시간 (HH:mm:ss 형식)
* @method clockIn(date) - 출근 시간을 기록합니다.
* @method clockOut(date) - 퇴근 시간을 기록합니다.
* @method getWorkingDuration() - 근무 시간을 계산하여 반환합니다.
* @method toJSON() - 출퇴근 기록을 JSON 형식으로 변환합니다.
*/
class AttendanceRecord {
    constructor({
        id = null,
        memberId,
        date = dayjs().format('YYYY-MM-DD'),
        standardClockInTime = "09:00:00", // 정규 출근시간
        standardClockOutTime = "18:00:00", // 정규 퇴근시간
        clockInTime = null,
        clockOutTime = null,
    }) {
        this.id = id;
        this.memberId = memberId;
        this.date = date;
        this.standardClockInTime = standardClockInTime;
        this.standardClockOutTime = standardClockOutTime;
        this.clockInTime = clockInTime;
        this.clockOutTime = clockOutTime;
        this.status = '미출근';

        this.#updateStatus();
    }

    static fromStorage(data) {
        return new AttendanceRecord({
            id: data.id,
            memberId: data.memberId,
            date: dayjs(data.date).format('YYYY-MM-DD'),
            standardClockInTime: data.standardClockInTime || null,
            standardClockOutTime: data.standardClockOutTime || null,
            clockInTime: data.clockInTime || null,
            clockOutTime: data.clockOutTime || null,
        });
    }

    static newRecord({memberId, standardClockInTime, standardClockOutTime}) {
        return new AttendanceRecord({ memberId, standardClockInTime, standardClockOutTime });
    }

    clockIn(time = new Date()) {
        this.clockInTime = dayjs(time).format('HH:mm:ss'); // HH:mm:ss 형식으로 저장
        this.#updateStatus();

        console.log("clockIn:", this.clockInTime);
        // immutability 위해 항상 새로운 객체를 반환
        return new AttendanceRecord({
            ...this
        })
    }

    clockOut(time = new Date()) {
        this.clockOutTime = dayjs(time).format('HH:mm:ss'); // HH:mm:ss 형식으로 저장
        this.#updateStatus();

        // immutability 위해 항상 새로운 객체를 반환
        return new AttendanceRecord({
            ...this
        })
    }

    #updateStatus() {
        if (!this.clockInTime) {
            this.status = '미출근';
            return;
        }

        // isAfter, isBefore 는 날짜가 있어야 정상 동작하므로 오늘날짜를 기준으로 dayjs 객체로 변환
        const today = dayjs().format('YYYY-MM-DD');
        const isLate = this.clockInTime && dayjs(`${today} ${this.clockInTime}`, 'YYYY-MM-DD HH:mm:ss').isAfter(dayjs(`${today} ${this.standardClockInTime}`, 'YYYY-MM-DD HH:mm:ss'));
        const isEarlyLeave = this.clockOutTime && dayjs(`${today} ${this.clockOutTime}`, 'YYYY-MM-DD HH:mm:ss').isBefore(dayjs(`${today} ${this.standardClockOutTime}`, 'YYYY-MM-DD HH:mm:ss'));

        if (isLate && isEarlyLeave) this.status = '지각+조퇴';
        else if (isLate) this.status = '지각';
        else if (isEarlyLeave) this.status = '조퇴';
        else this.status = '정상';
    }

    getWorkingDuration() {
        // 시간:분:초 형식으로 반환, 퇴근시간이 없는경우 현재 시간을 기준으로 반환
        if (this.clockInTime) {
            const today = dayjs().format('YYYY-MM-DD');
            const startTime = dayjs(`${today} ${this.clockInTime}`, 'YYYY-MM-DD HH:mm:ss');
            const endTime = this.clockOutTime ? dayjs(`${today} ${this.clockOutTime}`, 'YYYY-MM-DD HH:mm:ss') : dayjs();

            const duration = dayjs.duration(endTime.diff(startTime));
            return `${duration.hours()}:${String(duration.minutes()).padStart(2, '0')}:${String(duration.seconds()).padStart(2, '0')}`;
        }

        return null;
    }

    toJSON() {
        return {
            id: this.id,
            memberId: this.memberId,
            date: this.date,
            clockInTime: this.clockInTime,
            clockOutTime: this.clockOutTime,
            standardClockInTime: this.standardClockInTime,
            standardClockOutTime: this.standardClockOutTime,
        }
    }
}

export default AttendanceRecord;
import dayjs from 'dayjs';

/*
* @class LeaveRecord
* @description 근태 기록 클래스
* @property {number} id - 휴가 기록 ID
* @property {number} requestId - 요청 ID (optional)
* @property {number} memberId - 팀원 ID
* @property {string} date - 휴가 날짜 (YYYY-MM-DD 형식)
* @property {string} type - 휴가 유형 (ANNUAL, HALF, QUATER, SICK)
*/

class LeaveRecord {
    constructor({
        id = null,
        requestId = null, // 요청 ID (optional)
        memberId,
        date = dayjs().format('YYYY-MM-DD'),
        type = "ANNUAL"  // 휴가 유형: ANNUAL, HALF, QUATER, SICK
    }) {
        this.id = id;
        this.requestId = requestId; // 요청 ID (optional)
        this.memberId = memberId;
        this.date = date; // YYYY-MM-DD 형식
        this.type = type; // 휴가 유형 (ANNUAL, HALF, QUATER, SICK)
    }

    static fromStorage(data) {
        return new LeaveRecord({
            id: data.id,
            requestId: data.requestId,
            memberId: data.memberId,
            date: dayjs(data.date).format('YYYY-MM-DD'),
            type: data.type || "ANNUAL"
        });
    }

    toJSON() {
        return {
            id: this.id,
            requestId: this.requestId,
            memberId: this.memberId,
            date: this.date,
            type: this.type
        };
    }

}

export default LeaveRecord;
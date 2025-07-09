import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import memberList from "../jsons/member.json";

const SessionContext = createContext();
const DEFINE_SESSION_KEY = "session";

// localStorage 에 정보를 저장 및 사용
export function SessionProvider({ children, expireTime = 3600 }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [session, setSession] = useState(() => {
        const raw = localStorage.getItem(DEFINE_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    });

    const navigate = useNavigate();

    const logout = () => {
        setSession(null);
        setIsAdmin(false); // 로그아웃 시 관리자 모드 해제
        localStorage.removeItem(DEFINE_SESSION_KEY);
        navigate("/"); // 로그아웃 후 홈으로 이동
    };

    const checkSessionValidity = () => {
        // console.log("session", session);
        if (session) {
            const currentTime = new Date().getTime();
            const loginTime = new Date(session.loginTime).getTime();
            const expired = currentTime - loginTime > expireTime * 1000;
            if (expired) {
                logout(); // 세션 만료 시 로그아웃
            }
        }
    };

    // 세션 체크: focus, interval
    useEffect(() => {
        if (!session) {
            return; // 세션이 없으면 체크하지 않음
        }
        // 창이 다시 포커스될 때 세션 체크
        window.addEventListener("focus", checkSessionValidity);

        // 30초 마다 주기적으로 세션 체크
        checkSessionValidity();
        const interval = setInterval(checkSessionValidity, 30 * 1000);

        return () => {
            window.removeEventListener("focus", checkSessionValidity);
            clearInterval(interval);
        };
    }, [session]);

    const login = (name) => {
        if (!name) {
            return {
                status: "error",
                message: "로그인 이름이 필요합니다.",
            };
        }

        const foundMember = memberList.find(
            (member) => member.name.toLowerCase() === name.toLowerCase()
        );

        if( !foundMember) {
            return {
                status: "error",
                message: "해당 이름을 가진 팀원이 없습니다.",
            };
        }

        const newSession = {
            id: foundMember.id,
            name: foundMember.name,
            profileImage: foundMember.profileImage || null,
            loginTime: new Date().toISOString(),
        };
        setSession(newSession);
        localStorage.setItem(DEFINE_SESSION_KEY, JSON.stringify(newSession));

        return {
            status: "success",
            message: "로그인 성공",
            session: newSession,
            member: foundMember,
        };
    };

    const getSession = () => {
        const raw = localStorage.getItem(DEFINE_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    };

    return (
        <SessionContext.Provider value={{ session, getSession, login, logout, isAdmin, setIsAdmin }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}



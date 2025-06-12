import { useState } from "react"
import { useSession } from "../hooks/Session";
import toast from "react-hot-toast";
import Switch from "../components/Switch";

export default function Login() {

    const [name, setName] = useState("");
    const { login, isAdmin, setIsAdmin } = useSession();

    const onClickLogin = (e) => {
        e.preventDefault();
        if (!name) {
            toast.error("이름을 입력해주세요.");
            return;
        }
        const resp = login(name);
        if (resp.status === "error") {
            toast.error(resp.message);
            return;
        }
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <div className="">
                    <img src="/img/logo.png" alt="logo" />
                </div>
                <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
                <form>
                    <div className="mb-4">
                        <input type="text" className="w-full px-3 py-2 border rounded focus:outline-none " placeholder="이름을 입력하세요"
                            value={name}
                            onChange={(e) => setName(e.target.value)} />
                    </div>
                    <button
                        onClick={onClickLogin}
                        type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">로그인</button>
                </form>
                <div className="py-2 text-sm text-gray-600">
                    <Switch value={isAdmin} onChange={setIsAdmin}>
                        관리자 모드
                    </Switch>
                </div>
            </div>
        </div>
    )
}
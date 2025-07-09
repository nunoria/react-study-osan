import { cn } from "../lib/util";
import { useState, useEffect, useRef, useCallback } from "react";
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import "react-day-picker/style.css";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";

export default function DatePicker({ children, value, onValueChange, className }) {

    const dateRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [_selected, _setSelected] = useState(null);
    const [dateString, setDateString] = useState(null);
    const defaultClassNames = getDefaultClassNames();

    // 1. value가 변경될 때마다 _selected 상태 업데이트
    useEffect(() => {
        _setSelected(value);
    }, [value]);

    // 2. 날짜가 유효한 Date 객체일 때만 문자열로 변환
    useEffect(() => {
        if (_selected instanceof Date && !isNaN(_selected.getTime())) {
            setDateString(dayjs(_selected).format('YYYY-MM-DD'));
        } else {
            setDateString(null);
        }
    }, [_selected]);

    // 3. 선택 변경 시 onValueChange 호출
    const handleChange = (v) => {
        _setSelected(v);
        onValueChange?.(v);
    };

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event) => {
            if (dateRef.current && !dateRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <div ref={dateRef}
            className="flex flex-col">
            <button name="date-picker-button"
                className={cn(
                    "min-w-140pxr border rounded-md py-2 px-10pxr focus:outline-none hover:bg-gray-100 transition-colors",
                    "flex items-center gap-2",
                    dateString ? "text-gray-800" : "text-gray-500",
                    className
                )}
                onClick={() => setOpen(prev => !prev)}
            >
                <Calendar className="w-4 h-4" />
                {dateString || children || "날짜 선택"}
            </button>
            <div className="relative">
                <div name="date-picker"
                    className={cn(
                        "absolute top-2 left-0 z-10 transition-all duration-100 ease-in-out transform origin-top-left",
                        open
                            ? "opacity-100 scale-100 pointer-events-auto"
                            : "opacity-0 scale-95 pointer-events-none"
                    )}>
                    <DayPicker
                        animate
                        mode="single"
                        captionLayout="label"
                        navLayout="around"
                        selected={value || _selected}
                        onSelect={handleChange}
                        classNames={{
                            today: `bg-gray-100 rounded-md`,
                            selected: `bg-amber-500 border-amber-500 text-white rounded-md`, // Highlight the selected day
                            root: `${defaultClassNames.root} shadow-lg p-5 border rounded-md bg-white`, // Add a shadow to the root element
                            chevron: `fill-blue-500` // Change the color of the chevron
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
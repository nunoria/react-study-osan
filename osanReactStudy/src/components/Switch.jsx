import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/util";

export default function Switch({ value, onChange, children, side = "left" }) {

    const [_value, _setValue] = useState(false);
    const valueRef = useRef(false);

    useEffect(() => {
        if (value !== undefined && value !== null) {
            _setValue(value);
            valueRef.current = value;
        } else {
            _setValue(valueRef.current);
        }
    }, [value, valueRef.current]);

    const onChangeHandler = ((e) => {
        console.log("Switch onChange", e.target.checked);
        valueRef.current = e.target.checked;
        onChange && onChange(e.target.checked);
    });

    return (
        <label className={cn("flex items-center cursor-pointer gap-2",
            side === "right" ? "flex-row-reverse" : "flex-row"
        )}>
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={_value}
                    onChange={onChangeHandler}
                />
                <div className={cn("block w-10 h-6 rounded-full",
                    _value ? "bg-blue-600" : "bg-gray-500")}></div>
                <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${_value ? 'translate-x-full' : ''}`}
                ></div>
            </div>
            <span className="">{children}</span>
        </label>
    );
}
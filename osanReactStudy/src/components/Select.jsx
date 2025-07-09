import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    Children,
    isValidElement,
    useRef,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/util";

const SelectContext = createContext(null);
const SelectContentContext = createContext(null);

function Select({
    children,
    className,
    onOpenChange,
    open,
    onValueChange,
    value,
    defaultValue,
    ...props }) {

    const selectRef = useRef(null);
    const [_open, setOpen] = useState(false);
    const [_value, setValue] = useState(defaultValue);
    const [options, setOptions] = useState([]);

    const contextValue = {
        open: open !== undefined ? open : _open,
        setOpen: open !== undefined ? onOpenChange : setOpen,
        value: value !== undefined ? value : _value,
        setValue: onValueChange ? onValueChange : setValue,
        options,
        setOptions,
    }

    const handleClickOutside = useCallback((event) => {
        if (!contextValue.open) return;
        if (selectRef.current && !selectRef.current.contains(event.target)) {
            setOpen(false);
        }
    }, [contextValue]);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    return (
        <SelectContext.Provider value={contextValue}>
            <div ref={selectRef}
                className={cn("relative w-fit", className)} {...props}>
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const useSelectContext = () => {
    const context = useContext(SelectContext);
    if (!context) {
        throw new Error("Select components must be used within <Select>");
    }
    return context;
};

function SelectTrigger({
    children,
    className,
    ...props
}) {
    const { open, setOpen, value, options } = useSelectContext();

    return (
        <button
            data-state={open ? "open" : "closed"}
            className={cn("border rounded-md p-2 flex flex-row gap-2 justify-between w-full [&[data-state=open]>svg]:rotate-180", className)}
            onClick={() => setOpen(!open)}
            {...props}
        >
            <span>
                {
                    options.length > 0
                        ? options.find(option => option.value === value)?.label || children || "옵션선택"
                        : "옵션 없음"
                }
            </span>
            <ChevronDown className="transition-transform duration-150" />
        </button>
    );
}

function SelectContent({
    children,
    className,
    ...props
}) {
    const { open, setOpen, value, setValue, setOptions } = useSelectContext();

    // 자식 요소에서 옵션을 추출하여 setOptions에 설정
    useEffect(() => {
        const newOptions = Children.toArray(children)
            .filter(isValidElement)
            .map(child => ({
                value: child.props.value,
                label: child.props.children,
            }));
        setOptions(newOptions);
    }, [children, setOptions]);

    return (
        <SelectContentContext.Provider value={{ value, setValue, setOpen, setOptions }}>
            <div
                className={cn(
                    "w-full border rounded-md p-2 flex flex-col gap-1",
                    "absolute top-full left-0 z-50 mt-2",
                    "overflow-auto transition-transform duration-150 ease-in-out origin-top",
                    open
                        ? "max-h-42 opacity-100 scale-y-100 bg-white shadow-md"
                        : "max-h-0 opacity-0 scale-y-95 pointer-events-none",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </SelectContentContext.Provider>
    );
}

const useSelectContentContext = () => {
    const context = useContext(SelectContentContext);
    if (!context) {
        throw new Error(
            "SelectContent components must be used within <SelectContent>"
        );
    }
    return context;
};

function SelectItem({
    children,
    value,
    className,
    ...props
}) {
    const { setValue, setOpen, value: selectedValue } = useSelectContentContext();

    const handleClick = () => {
        setValue(value);
        setOpen(false);
    };

    return (
        <div
            className={cn("p-1 cursor-pointer hover:bg-gray-300",
                value === selectedValue ? "bg-amber-500 text-white rounded-sm" : "bg-none",
                className)}
            onClick={handleClick}
            {...props}
        >
            {children}
        </div>
    );
}

export {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
}
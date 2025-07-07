import React from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
    title: string;
}

const Header = ({ title }: HeaderProps) => {
    const router = useRouter();

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between px-6 py-4">
            {/* Left: Menu Button */}
            <button
                onClick={() => router.push("/")}
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h5m4 0h5a1 1 0 001-1V10"
                    />
                </svg>

            </button>

            {/* Center: Title */}
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
                {title}
            </h1>

            {/* Right: Empty space (optional for future icons) */}
            <div className="w-6 h-6" />
        </header>
    );
};

export default Header;

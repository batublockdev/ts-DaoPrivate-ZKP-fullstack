"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (sidebar && !sidebar.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const navigateAndClose = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-40 flex transition duration-300 ${isOpen ? "visible" : "invisible"}`}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`w-64 h-full bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full flex flex-col justify-center items-center space-y-6 text-gray-900 dark:text-white">
          <button
            onClick={() => navigateAndClose("/")}
            className="text-lg px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition w-40 text-center"
          >
            Home
          </button>
          <button
            onClick={() => navigateAndClose("/proposals")}
            className="text-lg px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition w-40 text-center"
          >
            Proposals
          </button>
          <button
            onClick={() => navigateAndClose("/components/voteFace")}
            className="text-lg px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition w-40 text-center"
          >
            Reveal Votes
          </button>
        </div>
      </div>
    </div>
  );
}

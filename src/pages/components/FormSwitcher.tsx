// components/FormSwitcher.tsx

import { useState } from "react";
import FormB from "./formB";
import FormA from "./formA";

const FormSwitcher = () => {
    const [activeForm, setActiveForm] = useState<"A" | "B">("A");

    const toggleForm = () => {
        setActiveForm((prev) => (prev === "A" ? "B" : "A"));
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow-xl bg-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                    {activeForm === "A" ? "Upload ZK Proof " : "Form B"}
                </h2>
                <button
                    onClick={toggleForm}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
                >
                    Switch to {activeForm === "A" ? "Form B" : "Form A"}
                </button>
            </div>

            {activeForm === "A" ? <FormA /> : <FormB />}
        </div>
    );
};

export default FormSwitcher;

import React, { useState } from "react";

interface CreateProposalFormProps {
    onSubmitx: (data: {
        targets: string[];
        values: bigint[];
        calldatas: string[];
        descriptionHash: string;
    }) => void;
}

const CreateProposalForm: React.FC<CreateProposalFormProps> = ({ onSubmitx }) => {
    const [target, setTarget] = useState("");
    const [value, setValue] = useState("0");
    const [calldata, setCalldata] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting proposal with data:", { target, value, calldata, description });

        if (typeof onSubmitx === "function") {
            onSubmitx({
                targets: [target],
                values: [BigInt(value)],
                calldatas: [calldata],
                descriptionHash: description,
            });
        } else {
            console.error("onSubmit is not a function", typeof onSubmitx);
        }
    };

    return (
        <div className="flex justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
            >
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                    📜 Create a DAO Proposal
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Target Address
                        </label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 0x1234..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            ETH Value (in wei)
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 0"
                            required
                            min="0"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Calldata (hex)
                        </label>
                        <input
                            type="text"
                            value={calldata}
                            onChange={(e) => setCalldata(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0x..."
                            required
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Proposal Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your proposal..."
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition duration-200"
                >
                    Submit Proposal
                </button>
            </form>
        </div>
    );
};

export default CreateProposalForm;

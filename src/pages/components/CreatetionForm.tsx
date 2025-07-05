// components/FormSwitcher.tsx

import { useState } from "react";
import { CreateCommitment } from "../../utils/makletree";
import SendModal from "./Modal"; // Adjust the import path as necessary
const CreationForm = () => {
    const { genProof_browser, verifyProof } = require('../../src-zk/indexz.ts');

    interface ProofData {
        proof: any;
        publicSignals: any;
    }
    const [formData, setFormData] = useState<{ SecretNullifier: string; address: string; vote: string; secret: string }>({
        SecretNullifier: "",
        address: "",
        vote: "",
        secret: ""
    });
    const [CommitmentData, setCommitmentData] = useState<{ Commiment: string; Nullfier: string }>({ Nullfier: "", Commiment: "" });
    const [showModal, setShowModal] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };



    const [Vproof, VsetProof] = useState<ProofData["proof"] | null>(null);
    const [VpublicSignals, VsetPublicSignals] = useState<ProofData["publicSignals"] | null>(null);
    const [verificationResult, setVerificationResult] = useState<null | boolean>(null);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});


    const validateForm = () => {
        const errors: { [key: string]: boolean } = {};

        if (!formData.SecretNullifier) errors.SecretNullifier = true;
        if (!formData.address) errors.address = true;
        if (!formData.vote) errors.vote = true;
        if (!formData.secret) errors.secret = true;


        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handlesumitx = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            console.error("Form validation failed");
            return;
        }

        try {

            const CommitmentResult = await CreateCommitment(BigInt(formData.SecretNullifier), BigInt(formData.address), BigInt(formData.vote), BigInt(formData.secret));
            setCommitmentData((prev) => ({ Commiment: CommitmentResult.commitment.toString(), Nullfier: CommitmentResult.nullifierHash.toString() }));

            setShowModal(true);
        } catch (error) {
            console.error("Error generating proof:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret Nullifier</label>
                    <input
                        name="SecretNullifier"
                        value={formData.SecretNullifier}
                        onChange={handleChange}
                        type="password"
                        placeholder="••••••"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.SecretNullifier ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        type="text"
                        placeholder="0x1234...abcd"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.address ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vote</label>
                    <input
                        name="vote"
                        value={formData.vote}
                        onChange={handleChange}
                        placeholder="1"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.vote ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret</label>
                    <input
                        name="secret"
                        value={formData.secret}
                        onChange={handleChange}
                        type="password"
                        placeholder="••••••"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                            ${formErrors.secret ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`} />
                </div>






            </div>

            <div className="flex flex-col md:flex-row md:justify-center md:space-x-4 space-y-4 md:space-y-0 mt-6">
                <button
                    type="button"
                    onClick={handlesumitx}
                    className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md"
                >
                    {loading ? "..." : "🧠 "}
                </button>





            </div>
            <SendModal commitment={CommitmentData.Commiment} nullfier={CommitmentData.Nullfier} isOpen={showModal} onClose={() => setShowModal(false)} />

        </form>

    );
};
export default CreationForm;

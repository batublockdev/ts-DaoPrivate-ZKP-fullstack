"use client";

import { useState, useEffect } from "react";

interface SendModalProps {
    isOpen: boolean;
    commitment: string;
    nullfier: string;
    onClose: () => void;
}

const steps = [
    { title: "Validating", icon: "🧪" },
    { title: "Preparing", icon: "📦" },
    { title: "Sending", icon: "🚀" },
    { title: "Done", icon: "✅" },
];


export default function SendModal({ isOpen, onClose, commitment, nullfier }: SendModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState("")
    const [currentScreen, setCurrentScreen] = useState(0);
    const goNext = () => setCurrentScreen((prev) => prev + 1);

    const renderContent = () => {
        switch (currentScreen) {
            case 0:
                return <StepZKProof onNext={goNext} />;
            case 1:
                return <StepConnectWallet onNext={goNext} onBack={goBack} />;
            case 2:
                return <StepReview onNext={goNext} onBack={goBack} />;
            case 3:
                return <StepFinalMessage onBack={goBack} />;
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[75vh] p-8 relative flex flex-col">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    ✖
                </button>

                {/* Steps */}
                <ol className="flex space-x-8 justify-center items-center mb-8">
                    {steps.map((step, index) => (
                        <li key={index} className="flex flex-col items-center text-center">
                            <span className={`text-3xl mb-1 ${index === currentStep ? "animate-bounce" : ""}`}>
                                {index < currentStep ? "✅" : index === currentStep ? step.icon : "🕓"}
                            </span>
                            <span
                                className={`text-sm ${index === currentStep ? "font-bold text-purple-600" : "text-gray-600"
                                    }`}
                            >
                                {step.title}
                            </span>
                        </li>
                    ))}
                </ol>

                {/* Content */}
                <div className="flex-1 space-y-4">
                    {renderContent()}


                </div>

                {/* Bottom-right Continue button */}
                <div className="flex justify-end mt-6">
                    <button
                        //onClick={onContinue}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-xl transition-all"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>


    );
}

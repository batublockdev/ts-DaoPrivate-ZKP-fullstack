import { useState, useEffect } from "react";
import CreateProposalForm from "./CreateProposal";
import CreateProposalModal from "./ModalSend";

export default function RevealPage() {
    const [showModal, setShowModal] = useState(false);
    const [dataToSend, setDataToSend] = useState<{
        targets: string[];
        values: bigint[];
        calldatas: string[];
        descriptionHash: string;
    }>({
        targets: [],
        values: [],
        calldatas: [],
        descriptionHash: ""
    });

    const onSubmit = (data: {
        targets: string[];
        values: bigint[];
        calldatas: string[];
        descriptionHash: string;
    }) => {
        console.log("Data to send:", data);
        setDataToSend(data);
        setShowModal(true);
    };
    const onSent = (result: boolean) => {
        console.log("Proposal sent:", result);

    }

    return (
        <>
            <CreateProposalForm onSubmitx={onSubmit} />
            <CreateProposalModal
                funtionName="propose"
                dataSend={dataToSend}
                isOpen={showModal}
                onSending={onSent}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}

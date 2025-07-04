
const circomlibjs = require("circomlibjs");

let poseidon: any;

async function initPoseidon() {
    poseidon = await circomlibjs.buildPoseidon(); // remove "const"

}

function hash(a: bigint, b: bigint): bigint {
    const rawHash = poseidon([a, b]); // poseidon output is field element
    const result = poseidon.F.toObject(rawHash) as bigint; // convert to bigint
    return result;
}

function buildMerkleTree(leaves: bigint[]): [bigint[][], number] {
    const tree: bigint[][] = [];

    tree[0] = leaves; // Level 0: hashed leaves

    let currentLevel = tree[0];
    let level = 0;
    while (currentLevel.length > 1) {

        const nextLevel: bigint[] = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = currentLevel[i + 1] ?? zeros(level); // duplicate last if odd
            nextLevel.push(hash(left, right));
        }
        tree.push(nextLevel);
        level++;
        currentLevel = nextLevel;
    }

    return [tree, level];
}

function getMerkleProof(tree: bigint[][], index: number) {
    const proof: { sibling: bigint; isLeft: boolean }[] = [];

    for (let level = 0; level < tree.length - 1; level++) {

        const isLeft = index % 2 === 0;

        const siblingIndex = isLeft ? index + 1 : index - 1;

        const levelNodes = tree[level];
        const siblingHash = levelNodes[siblingIndex] ?? (isLeft ? zeros(level) : levelNodes[index]); // if missing, duplicate

        proof.push({
            sibling: siblingHash,
            isLeft: !isLeft,
        });

        index = Math.floor(index / 2);
    }

    return proof;
}
function normalizeProof(proof: { sibling: bigint; isLeft: boolean }[], root: bigint, levels: number) {
    const pathElements: string[] = [];
    const pathIndices: string[] = [];

    for (const { sibling, isLeft } of proof) {
        let siblingBigInt: bigint;

        siblingBigInt = sibling;


        pathElements.push(siblingBigInt.toString());
        pathIndices.push(isLeft ? '1' : '0');
    }
    let current = root;
    for (let i = levels; i < 20; i++) {
        current = hash(current, zeros(i));
        pathElements.push(zeros(i).toString());
        pathIndices.push('0');
    }


    return { pathElements, pathIndices, current };
}


function zeros(i: number): bigint {
    if (i == 0) {
        return BigInt(
            "5365074742933140195701460912837558111746482509126416785866028967095537070591"
        );
    } else if (i == 1) {
        return BigInt(
            "18927995262277541656172313965917959133749249173481326288359404073453342459520"
        );
    } else if (i == 2) {
        return BigInt(
            "16731048699270784421706570066001991137631760108429146124137121216236553054391"
        );
    } else if (i == 3) {
        return BigInt(
            "16538499595934659613727544616962797785338492501618747306146816584688577735208"
        );
    } else if (i == 4) {
        return BigInt(
            "9080356992685742511681529878226919830400349732756896631827555189762739734491"
        );
    } else if (i == 5) {
        return BigInt(
            "5424144409132066577541240512439621178657103249409002506486103738618538352024"
        );
    } else if (i == 6) {
        return BigInt(
            "10544296693406531387206535330554893730829540929428087193592756592216676445216"
        );
    } else if (i == 7) {
        return BigInt(
            "7564988964993902948097824678805225006987812851830016626680599597402005451957"
        );
    } else if (i == 8) {
        return BigInt(
            "12169719382686741916580483745316623687880402026431235449348059358607961733224"
        );
    } else if (i == 9) {
        return BigInt(
            "8406940278843123175743832327158906184461007565351952961240403202786066254437"
        );
    } else if (i == 10) {
        return BigInt(
            "18095170724440081982596227705073746612735437036256299083752673311093685115565"
        );
    } else if (i == 11) {
        return BigInt(
            "12494921685926131790120916419089462187828486801312615440551414562915682918055"
        );
    } else if (i == 12) {
        return BigInt(
            "10982166978621049276500916207228131554783228711662971846611531133859682131754"
        );
    } else if (i == 13) {
        return BigInt(
            "20706006017932272733008726576435564635242694158389807366729547655972642914556"
        );
    } else if (i == 14) {
        return BigInt(
            "12387411678914679768595095911604733054258673148265834445738162148229762835545"
        );
    } else if (i == 15) {
        return BigInt(
            "4645457020147420961926028699764295047993990626023916925718742337202088609186"
        );
    } else if (i == 16) {
        return BigInt(
            "20031172315068130033417068040619844856054469898708347831004393380441627976110"
        );
    } else if (i == 17) {
        return BigInt(
            "10706546104333770657460492059417658198254511559412115282441046503143202741181"
        );
    } else if (i == 18) {
        return BigInt(
            "11849011169801684430469139138252284578555021442080969739652766930478906494558"
        );
    } else if (i == 19) {
        return BigInt(
            "3314372264187560584702178823305973219176593083766293720214567837146802335937"
        );
    } else if (i == 20) {
        return BigInt(
            "1976389223243078417398278543048130277804852592158378794293220333410109017266"
        );
    } else {
        throw new Error("Index out of bounds");
    }
}

async function GetPathFromIndex(index: number) {
    await initPoseidon(); // Make sure Poseidon is ready
    const babyjub = await circomlibjs.buildBabyjub();
    const F = babyjub.F;
    const rawLeaves: bigint[] = [];


    // fix the fecth URL to your API endpoint
    try {
        const response = await fetch("http://localhost:3000/api/dbtree", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        const data = await response.json();
        console.log("Proof gotten successfully:",);
        for (let i = 0; i < data.data.length; i++) {
            const leaf = data.data[i];
            rawLeaves.push(BigInt(leaf.leaf_value)); // Convert to bigint
        }



    } catch (error) {
        console.error("Error getting data:", error);
    }

    if (index < 0 || index >= rawLeaves.length) {
        throw new Error("Index out of bounds");
    } else if (rawLeaves.length === 0) {
        throw new Error("No leaves found in the database");
    } else {
        const [tree, levels] = buildMerkleTree(rawLeaves);
        const root = tree[tree.length - 1][0];



        const proof = getMerkleProof(tree, index);


        const circomProof = normalizeProof(proof, root, levels);


        return circomProof;
    }


};

async function CreateCommitment(secretNullifier: bigint, address: bigint, vote: bigint, secret: bigint) {
    await initPoseidon(); // Make sure Poseidon is ready
    const babyjub = await circomlibjs.buildBabyjub();
    const F = babyjub.F;

    const nullifierHash = poseidon([secretNullifier, address]);
    const commitment = poseidon([nullifierHash, vote, secret]);

    console.log("nullifierHash:", F.toString(nullifierHash));
    console.log("mycommitment:", F.toString(commitment));
    return {
        nullifierHash: F.toString(nullifierHash),
        commitment: F.toString(commitment)
    };
};

CreateCommitment(BigInt("456"), BigInt("272631572832604088006640318881740354409054456694"), BigInt("1"), BigInt("789"))
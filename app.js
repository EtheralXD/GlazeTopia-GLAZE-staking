const CONTRACT_ADDRESS = "0x2A013C39D3CF9FcFa2d9D27895Db60f73d5DDF9D";

const ABI = [
    "function stake() payable",
    "function withdraw()",
    "function stakes(address) view returns (uint256 amount, uint256 start)"
];

let provider;
let signer;
let contract;

async function init() {
    if (!window.ethereum) {
        alert("MetaMask required");
        return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    document.getElementById("connectWallet").onclick = connectWallet;
    document.getElementById("stakeBtn").onclick = stake;
    document.getElementById("checkStakeBtn").onclick = checkStake;
    document.getElementById("withdrawBtn").onclick = withdraw;
}

function showMessage(msg, type ="success", duration = 3000) {
    const pop = document.getElementById("message")
    pop.innerText = msg;
    pop.className = `message ${type}`;
    pop.style.display = "block";

    setTimeout(() => {
        pop.style.display = "none";
    }, duration);
}

async function connectWallet() {
    await provider.send("eth_requestAccounts", []);
    showMessage("Wallet connected: " + await signer.getAddress());
}

async function stake() {
    const amount = document.getElementById("stakeAmount").value;

    if (!amount || Number(amount) <= 0) {
        showMessage("You must stake more than 0 GLAZE", "error");
        return;
    }

    try {
        const tx = await contract.stake({value: ethers.parseEther(amount)});
        await tx.wait();   
        showMessage("Staked" +  amount +  "GLAZE");

    } catch (error) {
        console.error(error);
        showMessage("Transaction failed", "error");
    }
}

async function checkStake() {
    const addr = await signer.getAddress();
    const stakeData = await contract.stakes(addr);
    const eth = ethers.formatEther(stakeData.amount);
    const date = new Date(Number(stakeData.start) * 1000);
    showMessage(`Staked: ${eth} ETH, Start: ${date}`);
}

async function withdraw() {
    try {
        const tx = await contract.withdraw();
        await tx.wait();

        showMessage("Withdrawal successful!");

    } catch (err) {
        console.log(err);

        let message = "Transaction failed";

        if (err.reason) {
            message = err.reason;
        } 
        else if (err.data?.message) {
            message = err.data.message;
        } 
        else if (err.error?.message) {
            message = err.error.message;
        }

        showMessage(message);
    }
}

window.onload = init;
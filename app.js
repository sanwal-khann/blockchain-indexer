let provider;
let contract;

async function connectToMetaMask() {
  try {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      document.getElementById(
        "walletAddress"
      ).innerText = `Connected Wallet Address: ${accounts[0]}`;
      contract = new ethers.Contract(
        "0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99", // Contract address
        [
          {
            inputs: [],
            name: "connectToMetaMask",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address",
              },
            ],
            name: "MetaMaskConnected",
            type: "event",
          },
          {
            inputs: [
              {
                internalType: "address payable",
                name: "_to",
                type: "address",
              },
            ],
            name: "sendToken",
            outputs: [],
            stateMutability: "payable",
            type: "function",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            name: "TokenSent",
            type: "event",
          },
        ],
        signer
      );
      contract.on("MetaMaskConnected", (account) => {
        alert(`MetaMask connected: ${account}`);
      });
      contract.on("TokenSent", (from, to, amount) => {
        console.log("Token sent:");
        console.log("From:", from);
        console.log("To:", to);
        console.log("Amount:", ethers.utils.formatEther(amount), "ETH");
      });
    } else {
      alert("Please install MetaMask to connect to Ethereum");
    }
  } catch (error) {
    console.error(error);
  }
}

async function sendToken() {
  try {
    const recipientAddress = document.getElementById("recipientAddress").value;
    const amount = ethers.utils.parseEther(
      document.getElementById("amount").value
    );
    if (!ethers.utils.isAddress(recipientAddress)) {
      alert("Invalid recipient address");
      return;
    }
    const accounts = await provider.listAccounts();
    const tx = await contract.sendToken(recipientAddress, { value: amount });
    await tx.wait(); // Wait for the transaction to be mined
    console.log("Transaction successful");
    console.log("Transaction Hash:", tx.hash);
    console.log("Sender:", accounts[0]);
    console.log("Recipient:", recipientAddress);
    console.log("Amount:", ethers.utils.formatEther(amount), "ETH");
  } catch (error) {
    console.error(error);
  }
}

async function getContractLogs() {
  try {
    const logsContainer = document.getElementById("logsContainer");
    logsContainer.innerHTML = "";

    const filter = {
      address: "0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3",
      topics: [ethers.utils.id("TokenSent(address,address,uint256)")],
    };

    const logs = await provider.getLogs(filter);

    logs.forEach((log) => {
      const parsedLog = contract.interface.parseLog(log);
      const logData = document.createElement("div");
      logData.textContent = JSON.stringify(parsedLog.values);
      logsContainer.appendChild(logData);
    });
  } catch (error) {
    console.error(error);
  }
}

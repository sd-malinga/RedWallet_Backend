import dotenv from "dotenv";
import { UploadtoThirdweb } from "./ThirdWeb.js";
import { ethers } from "ethers";
import Web3 from "web3";
import { abi } from "../models/abi.js";
dotenv.config();

// send notice function
export const sendNotice = async (wallet, notice) => {
  try {
    // upload notice to thirdweb

    const uri = await UploadtoThirdweb(notice);

    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.PRIVATE_KEY,
    );
    web3.eth.accounts.wallet.add(signer);
    web3.eth.defaultAccount = signer.address;

    const contract = new web3.eth.Contract(
      abi,
      "0x4b2F7710263bF0050Bb64dc214B47757Da4C3479",
    );

    // estimate gas
    const gas = await contract.methods.safeMint(wallet, uri).estimateGas({
      from: signer.address,
    });

    // call function
    const tx = await contract.methods.safeMint(wallet, uri).send({
      from: signer.address,
      gas,
    });
    // console log trx has
    console.log(
      `Token ID: ${tx.events.Transfer.returnValues.tokenId} minted to ${wallet} with transaction hash ${tx.transactionHash}`,
    );

    // extract token id from events
    const tokenId = tx.events.Transfer.returnValues.tokenId;
    return { success: true, tokenId, trxHash: tx.transactionHash };
  } catch (err) {
    console.log(err);
    return {
      success: false,
    };
  }
};

// send bulk notice

export const sendBulkNotice = async (data) => {
  try {
    const inputData = [];
    const tokenIdToWallet = {};
    // upload notice to thirdweb
    for (let i = 0; i < data.length; i++) {
      const uri = await UploadtoThirdweb(data[i].notice);
      inputData.push({
        to: data[i].walletAddress,
        uri: uri,
      });
    }
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.PRIVATE_KEY,
    );
    web3.eth.accounts.wallet.add(signer);
    web3.eth.defaultAccount = signer.address;

    const contract = new web3.eth.Contract(
      abi,
      "0x4b2F7710263bF0050Bb64dc214B47757Da4C3479",
    );

    // estimate gas
    const gas = await contract.methods.safeMint(inputData).estimateGas({
      from: signer.address,
    });
    console.log(gas, "gas");
    // call function
    const tx = await contract.methods.safeMint(inputData).send({
      from: signer.address,
      gas,
    });
    // console log trx has
    console.log(tx.transactionHash, "trx hash");

    // Extract token IDs and associate with wallet addresses
    tx.events.forEach((event) => {
      const walletAddress = event.returnValues.to;
      const tokenId = event.returnValues.tokenId.toString();
      tokenIdToWallet[tokenId] = walletAddress;
    });

    // Log tokenIdToWallet mapping
    console.log("Token ID to Wallet mapping:", tokenIdToWallet);

    return { success: true, tokenIdToWallet, trxHash: tx.transactionHash };
  } catch (err) {
    console.log(err);
    return {
      success: false,
    };
  }
};

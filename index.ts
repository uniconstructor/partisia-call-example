import BN from "bn.js";
import { partisiaCrypto } from 'partisia-blockchain-applications-crypto';
import { PartisiaAccount, PartisiaRpc } from "partisia-blockchain-applications-rpc";
import { createTender } from "./root-mvp-contract";

export const initClient = async () => {
    try {
        console.log("initClient")
        //const userAddress = '003eadda927c799ef11a584dd6dca747f2a769d7d7';
        //const contractAddress = '023460205f066896f58bf9cac3e22efcebfb2c484a';
        const connectionConfig = {
            urlBaseGlobal: { url: 'https://node1.testnet.partisiablockchain.com', shard_id: 0 },
            urlBaseShards: [
                { url: 'https://node1.testnet.partisiablockchain.com/shards/Shard0', shard_id: 0 },
                { url: 'https://node1.testnet.partisiablockchain.com/shards/Shard1', shard_id: 1 },
                { url: 'https://node1.testnet.partisiablockchain.com/shards/Shard1', shard_id: 2 },
            ]
        };
        const rpc = PartisiaAccount(connectionConfig);

        let adminPrivateKey: string = "INSERT_KEY_HERE";
        let rootContractAddress: string = "023460205f066896f58bf9cac3e22efcebfb2c484a";
        const adminAddress = partisiaCrypto.wallet.privateKeyToAccountAddress(adminPrivateKey);
        // get account info
        const account = await rpc.getAccount(adminAddress);
        if (account === null) {
            throw new Error("Partisia account not found");
        }
        // get nonce for address
        const nonce = await rpc.getNonce(adminAddress, account.shard_id);

        const ownerId = new BN(1);
        const tenderId = new BN(7);
        const createTenderPayload = createTender(ownerId, tenderId);
        const dataPayload = partisiaCrypto.structs.serializeToBuffer(createTenderPayload);
        const txSerialized = partisiaCrypto.transaction.serializedTransaction(
            {
                nonce,
                cost: 100000,
            },
            {
                contract: rootContractAddress,
            },
            dataPayload
        );
        console.log("txSerialized:", txSerialized);
        //const signature = partisiaCrypto.wallet.signTransaction(txSerialized, adminPrivateKey);

        const result = await rpc.broadcastTransaction(adminAddress, txSerialized);
        console.log(result);

    } catch (error) {
        console.log(error);
    }
}

(async () => {
    await initClient();
})().catch(e => {
    // Deal with the fact the chain failed
});
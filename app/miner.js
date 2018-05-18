const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

class Miner {

    // init
    constructor(blockchain, transactionPool, wallet, p2pServer) {

        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet; 
        this.p2pServer = p2pServer;
 
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions();
 
        // reward transaction to the miner
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
        
        // create new block
        const block = this.blockchain.addBlock(validTransactions);

        // sync the chains
        this.p2pServer.syncChains();

        // clear transaction pool of the local miner
        this.transactionPool.clearTransactions();

        // tell other miners to clear their transaction pools
        // since block has been mined
        this.p2pServer.broadcastClearTransactions();

        // return block data to miner
        return block;
    }
}

module.exports = Miner;

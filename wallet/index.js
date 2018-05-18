const { INITIAL_BALANCE } = require('../config');
const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');

class Wallet {

    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `Wallet - 
        publicKey:  ${this.publicKey.toString()}
        balance:    ${this.balance}`;
    }

    createTransaction(recipient, amount, transactionPool, blockchain) {
        
        this.balance = this.calculateBalance(blockchain);

        if(amount > this.balance) {
            console.log(`Amount ${amount} exceeds current balance: ${this.balance}`);
            return;
        }

        let tx = transactionPool.existingTransaction(this.publicKey);    
        if(tx) {
            tx.update(this, recipient, amount);
        } else {
            tx = Transaction.newTransaction(this, recipient, amount);
        }

        transactionPool.updateOrAddTransaction(tx);

        return tx;

    }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchainWallet';
        return blockchainWallet;
    }

    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];

        blockchain.chain.forEach(block => block.data.forEach(tx => {
            transactions.push(tx);
        }));

        const walletInputTxs = transactions.filter(tx => tx.input.address === this.publicKey);

        let startTime = 0;

        if(walletInputTxs.length > 0) {

            const recentInputTx = walletInputTxs.reduce(
                (prev, current) => {
                    prev.input.timestamp > current.input.timestamp ? prev : current
                }
            );

            balance = recentInputTx.outputs.find(o => o.address === this.publicKey).amount;
            startTime = recentInputTx.input.timestamp;

        }

        transactions.forEach(tx => {
            if(tx.input.timestamp > startTime) {
                tx.outputs.find(o => {
                    if (o.address === this.publicKey) {
                        balance += o.amount;
                    }
                });
            }
        });

        return balance;

    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

}

module.exports = Wallet;
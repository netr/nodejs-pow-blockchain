const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction {

    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    // update transaction
    update(sender, recipient, amount) {
        
        const senderOutput = this.outputs.find(output => output.address === sender.publicKey);

        if (amount > sender.amount) {
            console.log(`Amount: ${amount} exceeds balance`);
            return;
        }

        senderOutput.amount = senderOutput.amount - amount;
        this.outputs.push({ 
            amount, address: recipient
        });

        Transaction.signTransaction(this, sender);

        return this;        
    }

    static newTransaction(sender, recipient, amount) {

        if(sender.balance < amount) {
            console.log('Transaction ERR: Insufficient amount');
            return;
        }

        return this.transactionWithOutputs(sender, [
            { 
                amount: sender.balance - amount, 
                address: sender.publicKey
            },
            {
                amount, 
                address: recipient
            }
        ]);

    }

    static rewardTransaction(miner, blockchainWallet) {
        return Transaction.transactionWithOutputs(blockchainWallet, [
            {
                amount: MINING_REWARD,
                address: miner.publicKey
            }
        ]);
    }

    static signTransaction(transaction, sender) {
        transaction.input = {
            timestamp: Date.now(),
            amount: sender.balance,
            address: sender.publicKey,
            signature: sender.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(
            transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs)
        );
    }

    static transactionWithOutputs(sender, outputs) {
        const transaction = new this();
        transaction.outputs.push(...outputs);
        this.signTransaction(transaction, sender);
        return transaction;
    }
   
}

module.exports = Transaction;
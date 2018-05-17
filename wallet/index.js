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

    createTransaction(recipient, amount, transactionPool) {
        
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

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

}

module.exports = Wallet;
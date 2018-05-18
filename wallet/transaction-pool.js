const Transaction = require('../wallet/transaction');

class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    updateOrAddTransaction(transaction) {
        let transactionWithId = this.transactions.find(tx => tx.id === transaction.id);

        if(transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }

    clearTransactions() {
        this.transactions = [];
    }

    existingTransaction(address) {
        return this.transactions.find(tx => tx.input.address === address);
    }

    validTransactions() {
        return this.transactions.filter(transaction => {

            const outputTotal = transaction.outputs.reduce((total, output) => {
                return total + output.amount;
            }, 0);

            if(transaction.input.amount !== outputTotal) {
                console.log(`Invalid transaction from ${transaction.input.address}`);
                return;
            }

            if(!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}`);
                return;
            }

            return transaction;
            
        });      
    }

}

module.exports = TransactionPool;
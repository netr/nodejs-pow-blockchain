const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

describe('TransactionPool', () => {

    let transactionPool, transaction, wallet;

    beforeEach(() => {

        transactionPool = new TransactionPool();    
        wallet = new Wallet();
        transaction = Transaction.newTransaction(wallet, '0xpoop', 30);
        transactionPool.updateOrAddTransaction(transaction);

    });

    it('adds a transaction to the pool', () => {
        expect(transactionPool.transactions.find(tx => tx.id === transaction.id)).toEqual(transaction);
    });

    it('transaction gets updated in the pool', () => {
        const oldTx = JSON.stringify(transaction);
        const newTx = transaction.update(wallet, '0xhotdog', 40);

        transactionPool.updateOrAddTransaction(newTx);

        expect(transactionPool.transactions.find(tx => tx.id === newTx.id)).not.toEqual(oldTx);

    });

});
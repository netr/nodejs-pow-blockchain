const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {

    let transactionPool, transaction, wallet, bc;

    beforeEach(() => {

        transactionPool = new TransactionPool();
        wallet = new Wallet();
        bc = new Blockchain();
        transaction = wallet.createTransaction('0xpoop', 30, transactionPool, bc);

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

    it('clears transactions', () => {
        transactionPool.clearTransactions();
        expect(transactionPool.transactions).toEqual([]);

    });

    describe('mixing valid and corrupt transactions', () => {

        let validTransactions;

        beforeEach(() => {
            validTransactions = [...transactionPool.transactions];
            for (let i = 0; i < 6; i++) {
                wallet = new Wallet();
                transaction = wallet.createTransaction('0xYience', 30, transactionPool, bc);
                if (i % 2 == 0) {
                    transaction.input.amount = 42069;
                } else {
                    validTransactions.push(transaction);
                }
            }
        });
        
        it('show a differnce between valid and corrupt transactions', () => {
            expect(JSON.stringify(transactionPool.transactions)).not.toEqual(JSON.stringify(validTransactions));
        });

        it('grabs valid transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });

    });

});
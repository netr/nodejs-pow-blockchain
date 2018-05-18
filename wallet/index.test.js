const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');
const { INITIAL_BALANCE } = require('../config');

describe('Wallet', () => {

    let wallet, transactionPool, bc;

    beforeEach(() => {
        wallet = new Wallet();
        bc = new Blockchain();
        transactionPool = new TransactionPool();
    });

    describe('wallet is creating a transaction', () => {

        let transaction, sendAmount, recipient;

        beforeEach(() => {
            sendAmount = 50;
            recipient = '0xM1N3RVA';
            transaction = wallet.createTransaction(recipient, sendAmount, transactionPool, bc);
        });

        describe('and doing the same transaction', () => {

            beforeEach(() => {
                wallet.createTransaction(recipient, sendAmount, transactionPool, bc);
            });

            it('doubles the `sendAmount` subtracted from wallet balance', () => {
                expect(transaction.outputs.find(o => o.address === wallet.publicKey).amount).toEqual(wallet.balance - sendAmount * 2);
            });

            it('clones the `sendAmount` output for the recipient', () => {
                expect(transaction.outputs.filter(o => o.address == recipient).map(o => o.amount)).toEqual([sendAmount, sendAmount]);
            });

        });

    });


    describe('calculating a balance', () => {

        let addBalance, repeatAdd, senderWallet;

        beforeEach(() => {
            senderWallet = new Wallet();
            addBalance = 100;
            repeatAdd = 3;
            for(let i = 0; i < repeatAdd; i++) {
                senderWallet.createTransaction(wallet.publicKey, addBalance, transactionPool, bc);
            }

            bc.addBlock(transactionPool.transactions);

        });

        it('calculates balance for recipient', () => {

            expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));

        });

        it('calculates balance for sender', () => {
            expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));
        });

        describe('and the recipient conducts a transaction', () => {
            let subtractBalance, recipientBalance;

            beforeEach(() => {

                transactionPool.clearTransactions();
                subtractBalance = 60;
                
                recipientBalance = wallet.calculateBalance(bc);
                console.log("Recipient Balance: " + recipientBalance);

                wallet.createTransaction(senderWallet.publicKey, subtractBalance, transactionPool, bc);

                bc.addBlock(transactionPool.transactions);

            });

            describe('and the sender sends another tx to the recipient', () => {

                beforeEach(() => {
                    transactionPool.clearTransactions();
                    senderWallet.createTransaction(wallet.publicKey, addBalance,transactionPool, bc);
                    bc.addBlock(transactionPool.transactions);
                });

                it('calculates recipient balance only using tx since its more recent one', () => {

                    expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance);

                });

            });

        });

    });

});
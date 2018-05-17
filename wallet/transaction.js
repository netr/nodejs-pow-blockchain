const ChainUtil = require('../chain-util');

class Transaction {

    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

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

        const transaction = new this();

        transaction.outputs.push(...[
            { 
                amount: sender.balance - amount, 
                address: sender.publicKey
            },
            {
                amount, 
                address: recipient
            }
        ]);

        this.signTransaction(transaction, sender);
        return transaction;

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
   
}

module.exports = Transaction;
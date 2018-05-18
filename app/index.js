// imports
const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2PServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');

// scope
const HTTP_PORT = process.env.HTTP_PORT || 3001;

// local
const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2p = new P2PServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2p);

// json parser
app.use(bodyParser.json());

// get all blocks
app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

// mine/add a new block
app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);

    // send new chain to all peers
    p2p.syncChains();

    res.redirect('/blocks');
});

// get all transactions in pool
app.get('/transactions', (req, res) => {
    res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const tx = wallet.createTransaction(recipient, amount, tp, bc);
    
    // send new transaction to all peers
    p2p.broadcastTransaction(tx);

    // show transactions
    res.redirect('/transactions');
});

// get your public key
app.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey });
});

// start mining
app.get('/mine-transactions', (req, res) => {
    const block = miner.mine();
    console.log(`New block has been mined: ${block.toString()}`);

    res.redirect('/blocks');
});

// listen to port
app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});

// connect to websocket
p2p.listen();
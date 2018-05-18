// imports
const WebSocket = require('ws');
const TransactionPool = require('../wallet/transaction-pool');

// scope
const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS',
};

// $ HTTP_PORT=3001 P2P_PORT=5001 PEERS=ws://localhost:5001,ws://localhost:5002

class P2PServer {

    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen() {
        const server = new WebSocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));

        this.connectToPeers();

        console.log(`Listening for p2p connections on: ${P2P_PORT}`);
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');

        this.messageHandler(socket)
        this.sendChain(socket);
    }

    connectToPeers() {
        peers.forEach(peer => {
            // ws://localhost:5001
            const socket = new WebSocket(peer);

            socket.on('open', () => {
                this.connectSocket(socket)
            });
        });
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch(data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clearTransactions();
                    break;
            }
        });
    }

    syncChains() { 
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    } 

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction);
        });
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => { 
            socket.send(JSON.stringify({
                type: MESSAGE_TYPES.clear_transactions
            }));
        });
    }

    sendChain(socket) { 
        socket.send(JSON.stringify({ 
            type: MESSAGE_TYPES.chain, 
            chain: this.blockchain.chain
        }));
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }

}

module.exports = P2PServer;

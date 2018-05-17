
const { DIFFICULTY, MINE_RATE } = require('../config');
const ChainUtil = require('../chain-util');

class Block {

    /**
     * @param  {} timestamp
     * @param  {} lastHash
     * @param  {} hash
     * @param  {} data
     */
    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString() {
        return `Block -
            Timestamp:      ${this.timestamp}
            Last Hash:      ${this.lastHash.substring(0, 10)}
            Current Hash:   ${this.hash.substring(0, 10)}
            Nonce:          ${this.nonce}
            Difficulty:     ${this.difficulty}
            Data:           ${this.data}`;
    }

    static genesis() {
        return new this('420', 'null', 'l33th4x0rz', [], DIFFICULTY);
    }
    
    /**
     * @param  {} lastBlock
     * @param  {} data
     */
    static mineBlock(lastBlock, data) {
        
        const lastHash = lastBlock.hash;
        let nonce = 0;
        let hash, timestamp;
        let { difficulty } = lastBlock;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock,timestamp);
            hash = this.generateHash(timestamp, lastHash, data, nonce, difficulty);
        } while(hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, lastHash, hash, data, nonce, difficulty);

    }
    
    /**
     * @param  {} timestamp
     * @param  {} lastHash
     * @param  {} data
     */
    static generateHash(timestamp, lastHash, data, nonce,difficulty) {
        return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    /**
     * @param  {} block
     */
    static blockHash(block) {
        const {timestamp, lastHash, data, nonce, difficulty} = block;
        return this.generateHash(timestamp, lastHash, data, nonce,difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime) {

        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
        return difficulty;

    }
}

module.exports = Block;
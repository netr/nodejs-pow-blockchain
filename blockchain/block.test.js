const Block = require('./block');

describe('Block', () => {

    let data, lastBlock, block;

    beforeEach(() => {
        data = 'testing blockchain data';
        lastBlock = Block.genesis();
        block = Block.mineBlock(lastBlock, data);
    });

    it('sets the `data` to match given input', () => {     
        expect(block.data).toEqual(data);
    });

    it('sets the `lastHash` to match hash of last block', () => {
        expect(block.lastHash).toEqual(lastBlock.hash);
    });

    it('generated a hash that matches the difficulty', () => {
        expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    });

    it('lowers difficulty for slowly mined blocks', () => {
        expect(Block.adjustDifficulty(block, block.timestamp+360000)).toEqual(block.difficulty - 1);
    });

    it('raises difficulty for quickly mined blocks', () => {
        expect(Block.adjustDifficulty(block, block.timestamp+1)).toEqual(block.difficulty + 1);
    });

})
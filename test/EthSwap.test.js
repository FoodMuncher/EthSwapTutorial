const { assert } = require('chai');

const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'Ether')
}

contract('EthSwap', ([deployer, investor]) => {
    let token, ethSwap

    before(async () => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        await token.transfer(ethSwap.address, tokens('1000000'))
    })

    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'DweebCoin')
        })
    })

    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        it('check transfer of funds', async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('buyTokens()', async () => {
        let result

        before(async () => {
            // Purchase tokens before each example
            result = await ethSwap.buyTokens({ from: investor, value: tokens('1') });
        })

        it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
            // Check invetsor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            // Check ethSwap balance after purchase
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1'))

            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount, tokens('100').toString())
            assert.equal(event.rate, '100')
        })
    })

})

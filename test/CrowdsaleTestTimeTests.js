import ether from '../node_modules/openzeppelin-solidity/test/helpers/ether';
import { advanceBlock } from '../node_modules/openzeppelin-solidity/test/helpers/advanceToBlock';
import { increaseTimeTo, duration } from '../node_modules/openzeppelin-solidity/test/helpers/increaseTime';
import latestTime from '../node_modules/openzeppelin-solidity/test/helpers/latestTime';
import EVMRevert from '../node_modules/openzeppelin-solidity/test/helpers/EVMRevert';

const BigNumber = web3.BigNumber;

require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(BigNumber))
.should();

const Crowdsale = artifacts.require('Crowdsale');
const TRND = artifacts.require('TRND');

const FINNEY = 10**15; // 1 Finney is 10^15 Wei

contract('Crowdsale', accounts => {
    
    const rate = new BigNumber(1);
    const value = ether(42);
    
    
    
    
    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
        
        
    });
    
    beforeEach(async function () {
        this.openingTime = latestTime() + duration.weeks(1);
        this.closingTime = this.openingTime + duration.weeks(1);
        this.afterClosingTime = this.closingTime + duration.seconds(1);
        this.crowdsale = await Crowdsale.deployed();
        const date = latestTime();
        await this.crowdsale.setStartIcoPreICO(date);
        var aNewDate = await this.crowdsale.startIcoPreICO.call();
        
        console.log("new date", aNewDate);
        
        
        this.token = TRND.at(await this.crowdsale.token.call());
        
        //console.log("token:", this.token);
        
    });
    

    
    it('buying tokens and pausing them', async function () {
        console.log("empty test");
        console.log("initial balance 1: ", web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0])));       
        var crowdsale = this.crowdsale;
        var amount1 = 400 * FINNEY; // 0.4 eth
        
        const account1 = accounts[1];
        const account2 = accounts[2];
        
        // buy tokens
        await crowdsale.procureTokens(account1, { from: account1, value: amount1, gas: 500000 });
        //await crowdsale.send( { from: accounts[1], value: amount1, gas: 500000 });
        
        var now = latestTime();
        const rate = await crowdsale.getRateIcoWithBonusByDate.call(now);
        console.log("rate: ", rate);
        console.log("amount ETH: ", amount1 * 1000);
        
        // check the balances
        var contractBalance1 = await crowdsale.contractBalanceOf.call(account1);
        var tokeBalance1 = await crowdsale.tokenBalanceOf.call(account1);
        console.log("contract balance: ", contractBalance1);
        console.log("token balance: ", tokeBalance1);
        
        assert.equal(contractBalance1, amount1);
        assert.equal(tokeBalance1, amount1 * rate);
        
        // now we have a token in account 1, send to account 2
        
        // var t = TRND.at(this.token);
        
        // const balance1 = await t.balanceOf(account1);
        // console.log("token balance 1: ", balance1);
        
        
        
        const balance1 = await this.token.balanceOf(account1);
        balance1.should.be.bignumber.equal(tokeBalance1);
        
        const balance2 = await this.token.balanceOf(account2);
        balance2.should.be.bignumber.equal(0);
        
        console.log("token balance 1: ", balance1);
        console.log("token balance 2: ", balance2);
        
        
        
        var amount = 30 * FINNEY;
        
        var paused = await this.token.paused.call();
        
        console.log("paused: ", paused);
        paused.should.be.false;

        console.log("lock test: ", paused);

        // token should be locked
        var permissions =  await crowdsale.GetPermissionsList.call(account1);
        console.log("permissions: ", permissions);

        permissions.should.be.bignumber.equal(1);
        
        try {
            await this.token.transfer(account2, amount, { from: account1, gas: 500000 });
            fail("token is locked, transfer should fail");
          } catch(error) {
            console.log("expected error - test is passing.");       
          }
        
        // unlock the token
        await crowdsale.SetPermissionsList(account1, 0);
        permissions =  await crowdsale.GetPermissionsList(account1);
        console.log("permissions unlocked: ", permissions);
        permissions.should.be.bignumber.equal(0);


        // send an amount over to account 2
        
        await this.token.transfer(account2, amount, { from: account1, gas: 500000 });
        
        console.log("transfer ok");
        
        const senderBalance = await this.token.balanceOf(account1);
        console.log("sender balance: ", senderBalance);
        senderBalance.should.be.bignumber.equal(balance1-amount);
        
        const recipientBalance = await this.token.balanceOf(account2);
        console.log("recepient balance: ", recipientBalance);
        recipientBalance.should.be.bignumber.equal(balance2+amount);
        
        
    });
    
    //   describe('accepting payments', function () {
    //     it('should reject payments before start', async function () {
    //       await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
    //       await this.crowdsale.buyTokens(investor, { from: purchaser, value: value }).should.be.rejectedWith(EVMRevert);
    //     });
    
    //     it('should accept payments after start', async function () {
    //       await increaseTimeTo(this.openingTime);
    //       await this.crowdsale.send(value).should.be.fulfilled;
    //       await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
    //     });
    
    //     it('should reject payments after end', async function () {
    //       await increaseTimeTo(this.afterClosingTime);
    //       await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
    //       await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    //     });
    //   });
});

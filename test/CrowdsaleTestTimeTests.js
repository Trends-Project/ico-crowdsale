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
const ETHER = 10**18; // 1 Ether is 10^18 Wei

contract('Crowdsale', accounts => {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
        
        
    });
    
    beforeEach(async function () {
        
        this.crowdsale = await Crowdsale.new();
        this.token = TRND.at(await this.crowdsale.token.call());
                
    });
    

    
    it('buying tokens and pausing them', async function () {
        //this.crowdsale = await Crowdsale.deployed();
        //this.token = TRND.at(await this.crowdsale.token.call());

        const date = latestTime();
        await this.crowdsale.setStartIcoPreICO(date);
        var aNewDate = await this.crowdsale.startIcoPreICO.call();
        console.log("new date", aNewDate);

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

    it('during main sale, all funds are protected by soft cap, all funds will be restored if softcap is not hit', async function () {

        const date = latestTime();
        const day = 24 * 3600;

        printDate("start pre ico", await this.crowdsale.startIcoPreICO.call());

        await this.crowdsale.setIcoDates(
            date - 5*day, // pre ico
            date - 4*day, // 2nd round
            date - 3*day, // end of pre ico
            date - day,   // main ico
            date + day,   // end of main
        );

        var account = accounts[1];
        await this.crowdsale.procureTokens(account, { from: account, value: 11*ETHER, gas: 500000 });

        var contractBalance1 = await this.crowdsale.contractBalanceOf.call(account);
        var tokeBalance1 = await this.crowdsale.tokenBalanceOf.call(account);
        console.log("contract balance: ", contractBalance1);
        console.log("token balance: ", tokeBalance1);
        var totalSoldTokens = await this.crowdsale.totalSoldTokens.call();
        var softCap =  await this.crowdsale.softcap.call();
        console.log("total sold: ", totalSoldTokens);
        console.log("softcap: ", softCap);

        totalSoldTokens.should.be.bignumber.lessThan(softCap);

        // try to withdraw, should not be allowed
        await this.crowdsale.transferEthToMultisig().should.be.rejectedWith(EVMRevert);
        
        await this.crowdsale.procureTokens(account, { from: account, value: 10000*ETHER, gas: 500000 });

        totalSoldTokens = await this.crowdsale.totalSoldTokens.call();
        console.log("total sold 2: ", totalSoldTokens);

        totalSoldTokens.should.be.bignumber.greaterThan(softCap);

        // failing because of unconfirmed sum
        await this.crowdsale.transferEthToMultisig().should.be.rejectedWith(EVMRevert);

        // enable token transfers from acount 1
        // TODO seems like we have to call this on every single token holder
        // TODO I guess this is KYC - we can approve each token holder 
        // Once they pass KYC
        await this.crowdsale.SetPermissionsList(account, 0);

        // fail because its not end of ico yet
        await this.crowdsale.transferEthToMultisig().should.be.rejectedWith(EVMRevert);

        // end ico
        await this.crowdsale.setIcoDates(
            date - 5*day, // pre ico
            date - 4*day, // 2nd round
            date - 3*day, // end of pre ico
            date - 2*day,   // main ico
            date - day,   // end of main
        );

        // now it should succeed
        await this.crowdsale.transferEthToMultisig();


    });

    it('during private sale, funds can be withdrawn', async function () {
        
    });

    it('during pre-ico sale, funds can be withdrawn', async function () {
        
    });

    it('after main sale, funds can be withdrawn if softcap was hit', async function () {
        
    });
        // 

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

function unixDate(dateString) {
    let date = (new Date(dateString)).getTime();
    return date / 1000;
  };
function printDate(message, date) {
    console.log(message, new Date(date*1000).toUTCString());
  };
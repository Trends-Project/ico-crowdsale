// import latestTime from "../node_modules/openzeppelin-solidity/test/helpers/latestTime.js";
// import { increaseTimeTo } from "../node_modules/openzeppelin-solidity/test/helpers/increaseTime.js";
// import { advanceBlock } from '../node_modules/openzeppelin-solidity/test/helpers/advanceToBlock';

import {
  advanceBlock,
  advanceToBlock,
  increaseTime,
  increaseTimeTo,
  duration,
  revert,
  latestTime
} from 'truffle-test-helpers';
import { fail } from 'assert';

// var Web3 = require('web3');
// var web3 = new Web3();

// test/FundingTest.js
const Crowdsale = artifacts.require("Crowdsale");
const ETHER = 10**18; // 1 Ether is 10^18 Wei
const FINNEY = 10**15; // 1 Finney is 10^15 Wei


contract("Crowdsale", accounts => {
  
  const firstAccount = accounts[0];
  const secondAccount = accounts[1];
  const account3 = accounts[2];
  const account4 = accounts[3];
    
  before(async function () {      
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await advanceBlock();
  });
  
  
  it("sets an owner", async function () {
    var crowdsale = await Crowdsale.deployed();
    assert.equal(await crowdsale.owner.call(), firstAccount);
  });
  
  it("sets start date for Pre-ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const date = 1530522000; // July 2, 2018, 09:00 GMT
    const defaultDate = 1530435600; // July 1    
    assert.equal(await crowdsale.startIcoPreICO.call(), defaultDate);
    // set the date to a new date
    await crowdsale.setStartIcoPreICO(date);
    var aNewDate = await crowdsale.startIcoPreICO.call();
    assert.equal(aNewDate, date);
    assert.notEqual(aNewDate, defaultDate);
    
    // reset to default
    await crowdsale.setStartIcoPreICO(defaultDate);
  });
  
  it("sets END date for Pre-ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const date = 1533017600; // date before the original pre ico
    const defaultDate = 1533027600; // July 31
    assert.equal(await crowdsale.endIcoPreICO.call(), defaultDate);
    // set the date to a new date
    await crowdsale.setEndIcoPreICO(date);
    var aNewDate = await crowdsale.endIcoPreICO.call();
    assert.equal(aNewDate, date);
    assert.notEqual(aNewDate, defaultDate);
    
    // reset to default
    await crowdsale.setEndIcoPreICO(defaultDate);
  });
  
  it("sets start date for Pre-ICO, 2nd round", async () => {
    var crowdsale = await Crowdsale.deployed();
    const date = 1530522000; // July 2, 2018, 09:00 GMT
    const defaultDate = 1531731600; // July 16
    assert.equal(await crowdsale.startIcoPreICO2ndRound.call(), defaultDate);
    await crowdsale.setStartIcoPreICO2ndRound(date);
    
    var aNewDate = await crowdsale.startIcoPreICO2ndRound.call();
    assert.equal(aNewDate, date);
    
    // reset to default
    await crowdsale.setStartIcoPreICO2ndRound(defaultDate);
  });
  
  it("sets START date for main ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const defaultDate = 1534323600;        // 08/15/2018 @ 9:00am (UTC)
    const date = defaultDate + 15 * 24 * 60 * 60; // 8/30
    assert.equal(await crowdsale.startIcoMainSale.call(), defaultDate);
    await crowdsale.setStartIcoMainICO(date);
    var aNewDate = await crowdsale.startIcoMainSale.call();
    assert.equal(aNewDate, date);
    
    // reset to default
    await crowdsale.setStartIcoMainICO(defaultDate);
  });
  
  it("sets END date for main ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const defaultDate = 1538557200;        
    const date = defaultDate + 29 * 24 * 60 * 60; 
    assert.equal(await crowdsale.endIcoMainSale.call(), defaultDate);
    await crowdsale.setEndIcoMainICO(date);
    var aNewDate = await crowdsale.endIcoMainSale.call();
    assert.equal(aNewDate, date);
    
    // reset to default
    await crowdsale.setEndIcoMainICO(defaultDate);
  });
  
  it("sets RATE for pre-ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const defaultRate = 2933;        
    const rate = defaultRate + 901; 
    assert.equal(await crowdsale.rateIcoPreICO.call(), defaultRate);
    await crowdsale.setRateIcoPreICO(rate);
    assert.equal(await crowdsale.rateIcoPreICO.call(), rate);
    
    // reset to default
    await crowdsale.setRateIcoPreICO(defaultRate);
  });
  
  it("sets RATE for main-ICO", async () => {
    var crowdsale = await Crowdsale.deployed();
    const defaultRate = 2200;        
    const rate = defaultRate + 333; 
    assert.equal(await crowdsale.rateIcoMainSale.call(), defaultRate);
    await crowdsale.setRateIcoMainSale(rate);
    assert.equal(await crowdsale.rateIcoMainSale.call(), rate);
    // reset to default
    await crowdsale.setRateIcoMainSale(defaultRate);
  });
  
  
  it("allows for a pre-ICO sale", async () => {
    var crowdsale = await Crowdsale.deployed();
    const day = 60 * 60 * 24;
    
    let now = latestTime();
    
    printDate("initial time: ",now);
    console.log("initial balance 1: ", web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0])));       
    console.log("initial balance 2: ", web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1])));       
    console.log("initial balance 3: ", web3.fromWei(web3.eth.getBalance(web3.eth.accounts[2])));       
    
    await increaseTimeTo(1530435600 + 10); // July 1st
    
    now = latestTime();
    printDate("new time : ",now);
    
    const minPurchase = await crowdsale.minPurchasePreICO.call();
    
    var amount = 50 * FINNEY;
    
    if (amount < minPurchase) {
      try {
        await crowdsale.procureTokens(firstAccount, { from: firstAccount, value: amount, gas: 500000 });
        fail("purchasing less than minimum amount should fail");
      } catch(error) {
        console.log("expected error - test is passing.");       
      }
    }
    
    var amount1 = 3 * minPurchase;
    var amount2 = 10 * minPurchase;
    var amount3 = 13 * minPurchase;
    
    
    await crowdsale.procureTokens(firstAccount, { from: firstAccount, value: amount1, gas: 500000 });
    await crowdsale.procureTokens(secondAccount, { from: secondAccount, value: amount2, gas: 500000 });
    await crowdsale.procureTokens(secondAccount, { from: secondAccount, value: amount3, gas: 500000 });    
    
    const rate = await crowdsale.getRateIcoWithBonusByDate.call(now);
    
    console.log("rate: ", rate);
    
    var contractBalance1 = await crowdsale.contractBalanceOf.call(firstAccount);
    var tokeBalance1 = await crowdsale.tokenBalanceOf.call(firstAccount);
    
    var contractBalance2 = await crowdsale.contractBalanceOf.call(secondAccount);
    var tokeBalance2 = await crowdsale.tokenBalanceOf.call(secondAccount);
    
    console.log("contract balance: ", contractBalance1);
    console.log("token balance: ", tokeBalance1);
    
    console.log("contract balance 2: ", contractBalance2);
    console.log("token balance 2: ", tokeBalance2);
    
    var amountTotal = amount2 + amount3;
    
    assert.equal(contractBalance2, amountTotal);
    assert.equal(tokeBalance2, amountTotal * rate);
    
  });
  
  
  it("allows for main ICO sale", async () => {
    var crowdsale = await Crowdsale.deployed();
    
    let now = latestTime();
    
    printDate("main initial time: ",now);
    console.log("initial balance 1: ", web3.fromWei(web3.eth.getBalance(web3.eth.accounts[2])));       
    console.log("initial balance 2: ", web3.fromWei(web3.eth.getBalance(web3.eth.accounts[3])));       
    console.log("initial balance 3: ", web3.fromWei(web3.eth.getBalance(web3.eth.accounts[4])));       
    
    await increaseTimeTo(1534323600 - 10); // Aug 15th, 10 seconds early
    
    var minPurchase = ETHER / 100; // there is no min purchase on main sale
    
    now = await latestTime();
    printDate("new time: ",now);
    
    try {
      await crowdsale.procureTokens(account3, { from: account3, value: amount, gas: 500000 });
      fail("purchasing tokens early should fail");
    } catch(error) {
      console.log("expected error - test is passing.");       
    }
    
    await increaseTime(20);
    await advanceBlock();

    now = await latestTime();

    printDate("main ico new time: ",now);
    var amount1 = 3 * minPurchase;
    var amount2 = 10 * minPurchase;
    var amount3 = 13 * minPurchase;
    
    await crowdsale.procureTokens(account3, { from: account3, value: amount1, gas: 500000 });
    await crowdsale.procureTokens(account4, { from: account4, value: amount2, gas: 500000 });
    await crowdsale.procureTokens(account4, { from: account4, value: amount3, gas: 500000 });    
    
    const rate = await crowdsale.getRateIcoWithBonusByDate.call(now);
    
    console.log("rate: ", rate);
    
    var contractBalance1 = await crowdsale.contractBalanceOf.call(account3);
    var tokeBalance1 = await crowdsale.tokenBalanceOf.call(account3);
    
    var contractBalance2 = await crowdsale.contractBalanceOf.call(account4);
    var tokeBalance2 = await crowdsale.tokenBalanceOf.call(account4);
    
    console.log("contract balance: ", contractBalance1);
    console.log("token balance: ", tokeBalance1);
    
    console.log("contract balance 2: ", contractBalance2);
    console.log("token balance 2: ", tokeBalance2);
    
    var amountTotal = amount2 + amount3;
    
    assert.equal(contractBalance2, amountTotal);
    assert.equal(tokeBalance2, amountTotal * rate);
    
  });

  
  
});
contract("Crowdsale", accounts => {


});

function printDate(message, date) {
  console.log(message, new Date(date*1000).toUTCString());
};
// web3._extend({
//     property: 'evm',
//     methods: [new web3._extend.Method({
//         name: 'snapshot',
//         call: 'evm_snapshot',
//         params: 0,
//         outputFormatter: toIntVal
//     })]
// });

// web3._extend({
//     property: 'evm',
//     methods: [new web3._extend.Method({
//         name: 'revert',
//         call: 'evm_revert',
//         params: 1,
//         inputFormatter: [toIntVal]
//     })]
// });

// try to get around truffle test env bug
contract("TRND", accounts => {
  it("doesn't do anything", async () => {
    console.log("empty test OK");
    // 
  });
});
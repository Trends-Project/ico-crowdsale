require('babel-register')({
  ignore: /node_modules\/(?!openzeppelin-solidity\/test\/helpers)/
})
require('babel-polyfill')

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      //port: 7545,
      port: 8545,
      network_id: "*" // Match any network id
    },

    // development: {
    //   provider: function() {        
    //     var ganache = require("ganache-cli");
    //     //web3.setProvider(ganache.provider());
    //     return ganache.provider(
    //       {
    //         "accounts": [
    //           [0x1, 1000000000000],
    //           [0x2, 2000000000000],
    //           [0x3, 4000000000000],
    //         ],
    //         "defaultBalanceEther": 9000000000000000000000,
    //         //"total_accounts":10
    //       }
    //     );
    //     //return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/");
    //   },
    //   network_id: '*',
    // },
  },

  

  mocha: {
    reporter:"nyan"
  }
};

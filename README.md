# ico-crowdsale

The Token and Crowdsale smart contracts for the https://www.trendsproject.io/ ICO

# Install

```
cd ico-crowdsale
sudo npm install -g truffle
sudo npm install -g ganache-cli
npm install
```

Also, follow this doc to install Ganache: http://truffleframework.com/docs/ganache/using

```
sudo npm install -g ganache-cli 
```

# Build

In another console launch a ganache:

```
ganache-cli -p 7545
```

The real build

```
truffle compile
truffle migrate
```


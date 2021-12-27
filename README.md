# svweb3

This is a simple project to provide utilities to work with the web3 environment and Svelte.

Is based on stores and components that will help you work your way into web3.

Is primary focused on Ethereum blockchain utilities.

## Utilities

### useWeb3

This is the first and basic utility provided, is a writable store that provide data related with the web3 status and connection and also a method to
connect to the user account.

#### usage

```js
const { connect, subscribe } = useWeb3();
subscribe(async (state) => {
	({ account: currentAccount, isConnected, hasPermissions, signer, ens } = state);
});
```

#### state provided

This store provide the following data

```js
{
    provider: null,
    signer: null,
    account: null,
    isConnected: false,
    balance: null,
    ens: null,
    network: null,
    hasPermissions: false, // show if the dapp have access to the user wallet
    chainId: null
}
```

- `provider`: An object that give access to the web3 provider data.
- `signer`: The signer address.
- `account`: The currently selected account.
- `isConnected`: Boolean that represent if the app is connected.
- `balance`: The balance of ETH in the selected account.
- `ens`: If the account have an ens domain it will be here.
- `network`: To what chain/network is connected.
- `hasPemissions`: Boolean that represent if the Dapp have access to the user wallet.
- `chainId`: The id of the current chain.

#### parameters

`useWeb3` accept a few parameters

```js
type UseWeb3Args = {
	init?: () => Promise<void>,
	onConnect?: () => void,
	onDisconnect?: () => void,
	onAccountsChanged?: (accounts: string[]) => void
};
```

- _init_ an async function meant to be run at the start of the "service". For example, here you can call a function to setup your contract. This `init` function will run as soon as the connection is stablished.
- `onConnect` to be run on the connection event.
- `onDisconnect` to be run when the connnection is lost.
- `onAccountsChanged` to be run when the user change the selected account.

#### connect method

Meant to be used as a button action to request user wallet access.

import { ethers } from 'ethers';
import { writable, get } from 'svelte/store';

type UseWeb3Args = {
	init?: () => Promise<void>;
	onConnect?: () => void;
	onDisconnect?: () => void;
	onAccountsChanged?: (accounts: string[]) => void;
};
export function useWeb3({ init, onConnect, onDisconnect, onAccountsChanged }: UseWeb3Args) {
	const store = writable(
		{
			provider: null,
			signer: null,
			account: null,
			isConnected: false,
			balance: null,
			ens: null,
			network: null,
			hasPermissions: false,
			chainId: null,
			contract: null
		},
		() => {
			initialize();
		}
	);

	function getCurrentState() {
		return get(store);
	}

	async function handleAccountsChanged(accounts: string[]) {
		const state = getCurrentState();
		const ens = await state.provider.lookupAddress(window.ethereum.selectedAddress);
		const balance = await state.provider.getBalance(window.ethereum.selectedAddress);

		store.update((state) => {
			return {
				...state,
				account: window.ethereum.selectedAddress,
				ens,
				balance: ethers.utils.formatEther(balance)
			};
		});
		onAccountsChanged?.(accounts);
	}

	function handleOnConnect() {
		store.update((state) => ({ ...state, isConnected: true }));
		onConnect?.();
	}

	function handleDisconnect() {
		store.update((state) => ({
			...state,
			isConnected: false,
			hasPermissions: false,
			account: null
		}));
		onDisconnect?.();
	}

	function handleChainChanged(chainId: string) {
		window.location.reload();
	}

	async function initialize() {
		if (window) {
			//@ts-ignore
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const balance = await provider.getBalance(window.ethereum.selectedAddress);
			const ens = await provider.lookupAddress(window.ethereum.selectedAddress);
			const chainId = await window.ethereum.request({ method: 'eth_chainId' });
			const network = await provider.getNetwork();
			const accounts = await provider.listAccounts();

			store.update((state) => ({
				...state,
				provider,
				signer,
				account: accounts?.[0],
				balance: ethers.utils.formatEther(balance),
				ens,
				network,
				isConnected: window.ethereum.isConnected(),
				chainId
			}));
			// Listenerrs
			window.ethereum.on('connect', handleOnConnect);
			window.ethereum.on('disconnect', handleDisconnect);
			window.ethereum.on('accountsChanged', handleAccountsChanged);
			window.ethereum.on('chainChanged', handleChainChanged);

			// init function provided by the user
			await init?.();
		}
	}

	async function connect() {
		if (window?.ethereum) {
			const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
			store.update((state) => ({ ...state, hasPermissions: true }));
			handleAccountsChanged(accounts);
		}
	}

	return {
		subscribe: store.subscribe,
		connect
	};
}

/// <amd-module name="@scom/scom-custodial-wallet" />
declare module "@scom/scom-custodial-wallet" {
    import { IClientProviderOptions, IClientSideProvider, IClientSideProviderEvents, IConnectWalletEventPayload, Wallet } from '@ijstech/eth-wallet';
    export default class CustodialWalletProvider implements IClientSideProvider {
        protected wallet: Wallet;
        protected _events?: IClientSideProviderEvents;
        protected _options?: IClientProviderOptions;
        protected _isConnected: boolean;
        protected _name: string;
        protected _image: string;
        protected _selectedAddress: string;
        provider: any;
        onAccountChanged: (account: string) => void;
        onChainChanged: (chainId: string) => void;
        onConnect: (connectInfo: any) => void;
        onDisconnect: (error: any) => void;
        private handleAccountsChanged;
        private handleChainChanged;
        private handleConnect;
        private handleDisconnect;
        constructor(wallet: Wallet, events?: IClientSideProviderEvents, options?: IClientProviderOptions);
        get name(): string;
        get displayName(): string;
        get image(): string;
        installed(): boolean;
        get events(): IClientSideProviderEvents;
        get options(): IClientProviderOptions;
        get selectedAddress(): string;
        protected toChecksumAddress(address: string): string;
        private _handleAccountsChanged;
        protected initEvents(): void;
        connect(eventPayload?: IConnectWalletEventPayload): Promise<any>;
        disconnect(): Promise<void>;
        isConnected(): boolean;
        switchNetwork(chainId: number): Promise<boolean>;
        encrypt(key: string): Promise<string>;
        decrypt(data: string): Promise<string>;
    }
}

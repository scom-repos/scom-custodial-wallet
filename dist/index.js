define("@scom/scom-custodial-wallet", ["require", "exports", "@ijstech/eth-wallet", "@ijstech/components"], function (require, exports, eth_wallet_1, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let moduleDir = components_1.application.currentModuleDir;
    function fullPath(path) {
        if (path.indexOf('://') > 0)
            return path;
        return `${moduleDir}/${path}`;
    }
    class CustodialWalletProvider {
        constructor(wallet, events, options) {
            this._isConnected = false;
            this.wallet = wallet;
            this._events = events;
            this._options = options;
            if (this._options) {
                if (this._options.name) {
                    this._name = this._options.name;
                }
                if (this._options.image) {
                    this._image = this._options.image;
                }
            }
            this.initEvents();
        }
        get name() {
            return this._name;
        }
        get displayName() {
            return 'Email';
        }
        get image() {
            return fullPath('img/email.png');
        }
        installed() {
            return true;
        }
        get events() {
            return this._events;
        }
        get options() {
            return this._options;
        }
        get selectedAddress() {
            return this._selectedAddress;
        }
        toChecksumAddress(address) {
            address = address.toLowerCase().replace('0x', '');
            let sha3 = window['sha3'];
            let hash = sha3.keccak256(address);
            let ret = '0x';
            for (let i = 0; i < address.length; i++) {
                if (parseInt(hash[i], 16) >= 8) {
                    ret += address[i].toUpperCase();
                }
                else {
                    ret += address[i];
                }
            }
            return ret;
        }
        _handleAccountsChanged(account, eventPayload) {
            let accountAddress;
            let hasAccounts = !!account;
            if (hasAccounts) {
                this._selectedAddress = this.toChecksumAddress(account);
                accountAddress = this._selectedAddress;
                if (this.wallet.web3) {
                    this.wallet.web3.selectedAddress = this._selectedAddress;
                }
                this.wallet.account = {
                    address: accountAddress
                };
            }
            this._isConnected = hasAccounts;
            eth_wallet_1.EventBus.getInstance().dispatch(eth_wallet_1.Constants.ClientWalletEvent.AccountsChanged, {
                ...eventPayload,
                account: accountAddress
            });
        }
        initEvents() {
            let self = this;
            this.handleChainChanged = (chainId) => {
                self.wallet.chainId = parseInt(chainId);
                if (this._options && this._options.useDefaultProvider) {
                    if (this._options.infuraId)
                        this.wallet.infuraId = this._options.infuraId;
                    self.wallet.setDefaultProvider();
                }
                this.provider = this.wallet.provider;
                eth_wallet_1.EventBus.getInstance().dispatch(eth_wallet_1.Constants.ClientWalletEvent.ChainChanged, chainId);
                if (self.onChainChanged)
                    self.onChainChanged(chainId);
            };
            // this.handleConnect = (connectInfo) => {
            //     EventBus.getInstance().dispatch(Constants.ClientWalletEvent.Connect, connectInfo);
            //     if (self.onConnect)
            //         self.onConnect(connectInfo);
            // }
        }
        async connect(eventPayload) {
            // this.wallet.chainId = parseInt(this.provider.chainId, 16);
            // this.wallet.provider = this.provider;
            this.provider = this.wallet.provider;
            let self = this;
            if (eventPayload?.userTriggeredConnect) {
                if (eventPayload.verifyAuthCode) {
                    let result = await eventPayload.verifyAuthCode(eventPayload.verifyAuthCodeArgs);
                    if (result.success) {
                        // this.provider.selectedAddress = result.data.walletAddress;
                        self._handleAccountsChanged(result.data.walletAddress, eventPayload);
                        self.wallet.privateKey = result.data.privateKey;
                        localStorage.setItem('privateKey', result.data.privateKey); //FIXME: for testing only
                    }
                }
            }
            else {
                if (eventPayload.loggedInAccount) {
                    // this.provider.selectedAddress = eventPayload.loggedInAccount;
                    self._handleAccountsChanged(eventPayload.loggedInAccount, eventPayload);
                    //FIXME: for testing only
                    const privateKey = localStorage.getItem('privateKey');
                    if (privateKey) {
                        self.wallet.privateKey = privateKey;
                    }
                }
            }
            return this.provider;
        }
        async disconnect() {
            this.wallet.account = null;
            this._isConnected = false;
            localStorage.removeItem('privateKey'); //FIXME: for testing only
        }
        isConnected() {
            return this._isConnected;
        }
        switchNetwork(chainId) {
            let self = this;
            return new Promise(async function (resolve, reject) {
                try {
                    let chainIdHex = '0x' + chainId.toString(16);
                    self.handleChainChanged(chainIdHex);
                    resolve(true);
                }
                catch (err) {
                    reject(err);
                }
            });
        }
    }
    exports.default = CustodialWalletProvider;
});

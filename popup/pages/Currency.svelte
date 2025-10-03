<!-- pages/Currency.svelte (updated) -->
<script lang="ts">
    import { _ } from 'popup/i18n';
    import globalStore from 'popup/store/global';
    import { setGlobalState } from 'popup/background/wallet';
    import NavBar from '../components/NavBar.svelte';
    import SmartInput from '../components/SmartInput.svelte';
    import SearchIcon from '../components/icons/Search.svelte';
    import CurrencyIcon from '../components/icons/Currency.svelte';
    import ActionCard from '../components/ActionCard.svelte';
    import SelectableListItem from '../components/SelectableListItem.svelte';
    
    interface Currency {
        code: string;
        name: string;
        symbol: string;
    }
    
    const currencies: Currency[] = [
        { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
        { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
        { code: 'LTC', name: 'Litecoin', symbol: 'Ł' },
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
        { code: 'CHF', name: 'Swiss Franc', symbol: '₣' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
        { code: 'SOL', name: 'Solana', symbol: '◎' },
        { code: 'USDT', name: 'Tether', symbol: '₮' },
        { code: 'DOGE', name: 'Dogecoin', symbol: 'Ð' },
        { code: 'GOLD', name: 'Gold', symbol: 'Au' },
        { code: 'SILVER', name: 'Silver', symbol: 'Ag' },
        { code: 'OIL', name: 'Oil', symbol: '🛢️' },
        { code: 'GAS', name: 'Gas', symbol: '⛽' },
        { code: 'PLAT', name: 'Platinum', symbol: 'Pt' },
        { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
        { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
        { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
        { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
        { code: 'THB', name: 'Thai Baht', symbol: '฿' },
        { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
        { code: 'XMR', name: 'Monero', symbol: 'ɱ' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
        { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
        { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
        { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' }
    ];
    
    let searchTerm = $state('');
    let selectedCurrency = $state($globalStore.wallets[$globalStore.selectedWallet]?.settings?.currencyConvert || 'BTC');
    
    const currentWallet = $derived($globalStore.wallets[$globalStore.selectedWallet]);
    const filteredCurrencies = $derived(() => {
        if (!searchTerm) return currencies;
        const term = searchTerm.toLowerCase();
        return currencies.filter(c => 
            c.code.toLowerCase().includes(term) || 
            c.name.toLowerCase().includes(term)
        );
    });
    
    async function selectCurrency(code: string) {
        selectedCurrency = code;
        const walletIndex = $globalStore.selectedWallet;
        if (walletIndex >= 0) {
            globalStore.update(state => {
                const newWallets = [...state.wallets];
                if (newWallets[walletIndex]?.settings) {
                    newWallets[walletIndex].settings.currencyConvert = code;
                }
                return { ...state, wallets: newWallets };
            });
            await setGlobalState();
        }
    }
    
    function handleEngineSettings() {
    
    }
</script>

<div class="page-container">
    <NavBar title={$_('settings.currency')} />
    
    <div class="content">
        <div class="engine-section">
            <ActionCard
                Icon={CurrencyIcon}
                title={$_('currency.engineTitle')}
                subtitle={$_('currency.engineSubtitle')}
                tag={$_('currency.engineProvider')[currentWallet.settings.ratesApiOptions]}
                onaction={handleEngineSettings}
            />
        </div>
        
        <div class="currencies-section">
            <div class="search-container">
                <SmartInput
                    bind:value={searchTerm}
                    placeholder={$_('currency.searchPlaceholder')}
                    showToggle={false}
                >
                    {#snippet leftIcon()}
                        <SearchIcon />
                    {/snippet}
                </SmartInput>
            </div>
            
            <div class="currency-list">
                {#each filteredCurrencies() as currency (currency.code)}
                    <SelectableListItem
                        label={`${currency.name} ${currency.symbol}`}
                        sublabel={`(${currency.code})`}
                        selected={selectedCurrency === currency.code}
                        onselect={() => selectCurrency(currency.code)}
                    />
                {/each}
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    .page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--color-neutral-background-base);
        padding: 0;
        box-sizing: border-box;
    }
    
    .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0px var(--padding-side, 20px);
        min-height: 0;
    }
    
    .engine-section {
        width: 100%;
    }
    
    .currencies-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        background: var(--color-neutral-background-container);
        border-radius: 12px;
        min-height: 0;
    }
    
    .search-container {
        flex-shrink: 0;
    }
    
    .currency-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0;
        overflow-y: auto;
        min-height: 0;
    }
</style>

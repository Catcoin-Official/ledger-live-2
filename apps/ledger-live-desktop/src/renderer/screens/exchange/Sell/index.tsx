import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { getAccountCurrency, isAccountEmpty } from "@ledgerhq/live-common/account/helpers";
import SelectAccountAndCurrency from "~/renderer/components/SelectAccountAndCurrency";
import { CryptoCurrency, TokenCurrency } from "@ledgerhq/types-cryptoassets";
import TrackPage from "~/renderer/analytics/TrackPage";
import { track } from "~/renderer/analytics/segment";
import { DProps } from "~/renderer/screens/exchange";
import { ProviderList } from "../ProviderList";
import { useRampCatalogCurrencies } from "../hooks";
import { counterValueCurrencySelector } from "~/renderer/reducers/settings";
import { currenciesByMarketcap } from "@ledgerhq/live-common/currencies/index";
import BigSpinner from "~/renderer/components/BigSpinner";
const BuyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
`;
type State = {
  sortedCurrencies: Array<TokenCurrency | CryptoCurrency>;
  isLoading: boolean;
};
const OffRamp = ({ defaultCurrencyId, defaultAccountId, defaultTicker, rampCatalog }: DProps) => {
  const [currencyState, setCurrencyState] = useState<State>({
    sortedCurrencies: [],
    isLoading: false,
  });
  const allCurrencies = useRampCatalogCurrencies(rampCatalog.value.offRamp);
  useEffect(
    () => {
      const filteredCurrencies = defaultTicker
        ? allCurrencies.filter(currency => currency.ticker === defaultTicker)
        : allCurrencies;
      setCurrencyState(oldState => ({
        ...oldState,
        isLoading: true,
      }));
      currenciesByMarketcap(filteredCurrencies).then(sortedCurrencies => {
        setCurrencyState({
          sortedCurrencies,
          isLoading: false,
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const fiatCurrency = useSelector(counterValueCurrencySelector);
  const [state, setState] = useState({
    account: undefined,
    parentAccount: undefined,
  });
  const { account, parentAccount } = state;
  const reset = useCallback(() => {
    track("Page Sell Reset");
    setState({
      account: undefined,
      parentAccount: undefined,
    });
  }, []);
  const selectAccount = useCallback((account, parentAccount) => {
    setState(oldState => ({
      ...oldState,
      account: account,
      parentAccount: parentAccount,
    }));
  }, []);
  const confirmButtonTracking = useCallback(account => {
    track("Sell Crypto Continue Button", {
      currencyName: getAccountCurrency(account).name,
      isEmpty: isAccountEmpty(account),
    });
  }, []);
  return (
    <BuyContainer>
      <TrackPage category="Multibuy" name="SellPage" />
      {currencyState.isLoading ? (
        <BigSpinner size={42} />
      ) : account ? (
        <ProviderList
          account={account}
          parentAccount={parentAccount}
          providers={rampCatalog.value.offRamp}
          onBack={reset}
          trade={{
            type: "offRamp",
            cryptoCurrencyId: account.token ? account.token.id : account.currency.id,
            fiatCurrencyId: fiatCurrency.ticker,
            fiatAmount: 400,
          }}
        />
      ) : (
        <SelectAccountAndCurrency
          selectAccount={selectAccount}
          allCurrencies={currencyState.sortedCurrencies}
          defaultCurrencyId={defaultCurrencyId}
          defaultAccountId={defaultAccountId}
          confirmCb={confirmButtonTracking}
          flow="sell"
        />
      )}
    </BuyContainer>
  );
};
export default OffRamp;

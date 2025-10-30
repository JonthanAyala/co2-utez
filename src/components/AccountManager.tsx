import { useState } from "react";
import { useStellarAccounts } from "../providers/StellarAccountProvider";
import { saveAccountToStorage } from "../utils/local-storage";
import { stellarService } from "../services/stellar.service";
import AccountCard from "./AccountCard";
import { AccountBalance, IAccount } from "../interfaces/account";
import useModal from "../hooks/useModal";
import PaymentModal from "./PaymentModal";
import StellarExpertLink from "./StellarExpertLink";

export default function AccountManager() {
  const { getAccount, hashId } = useStellarAccounts();
  const [, forceUpdate] = useState({});
  const paymentModal = useModal();

  const ayala3Account = getAccount("ayala3");
  const ayala4Account = getAccount("ayala4");

  const handleCreateAccount = (name: string) => {
    const account = stellarService.createAccount();
    saveAccountToStorage(name, account);
    forceUpdate({});
  };

  const fundAccount = async (name: string) => {
    const account = getAccount(name);
    if (!account) return;

    const response = await stellarService.fundAccount(account.publicKey);

    if (!response) return;

    const balancesData = await stellarService.getAccountBalance(
      account.publicKey
    );
    const updatedAccount: IAccount = {
      ...account,
      balances: balancesData.map((balance: AccountBalance) => ({
        amount: balance.amount,
        assetCode: balance.assetCode,
      })),
    };

    saveAccountToStorage(name, updatedAccount);
    forceUpdate({});
  };

  const refreshAccountBalances = async () => {
    if (ayala3Account) {
      const balancesData = await stellarService.getAccountBalance(
        ayala3Account.publicKey
      );
      const updatedayala3: IAccount = {
        ...ayala3Account,
        balances: balancesData.map((balance: AccountBalance) => ({
          amount: balance.amount,
          assetCode: balance.assetCode,
        })),
      };
      saveAccountToStorage("ayala3", updatedayala3);
    }

    if (ayala4Account) {
      const balancesData = await stellarService.getAccountBalance(
        ayala4Account.publicKey
      );
      const updatedayala4: IAccount = {
        ...ayala4Account,
        balances: balancesData.map((balance: AccountBalance) => ({
          amount: balance.amount,
          assetCode: balance.assetCode,
        })),
      };
      saveAccountToStorage("ayala4", updatedayala4);
    }

    forceUpdate({});
  };

  return (
    <div className="max-w-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Stellar Account Manager
          </h1>
          <p className="text-slate-600 text-lg">
            Create and manage Stellar accounts for ayala3 and ayala4
          </p>
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={() => handleCreateAccount("ayala3")}
            disabled={!!ayala3Account}
            className="group px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none cursor-pointer"
          >
            <span className="flex items-center gap-2">
              Create Account for ayala3
            </span>
          </button>
          <button
            onClick={paymentModal.openModal}
            className="group px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 hover:shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none cursor-pointer"
          >
            <span className="flex items-center gap-2">Send Payment</span>
          </button>

          <button
            onClick={() => handleCreateAccount("ayala4")}
            disabled={!!ayala4Account}
            className="group px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none cursor-pointer"
          >
            <span className="flex items-center gap-2">
              Create Account for ayala4
            </span>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {ayala3Account && (
            <AccountCard
              name="ayala3"
              account={ayala3Account}
              onFund={() => {
                void fundAccount("ayala3");
              }}
              variant="primary"
            />
          )}

          {ayala4Account && (
            <AccountCard
              name="ayala4"
              account={ayala4Account}
              onFund={() => {
                void fundAccount("ayala4");
              }}
              variant="secondary"
            />
          )}
        </div>

        {!ayala3Account && !ayala4Account && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-slate-200 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No accounts yet
            </h3>
            <p className="text-slate-500">
              Create your first account to get started
            </p>
          </div>
        )}
      </div>
      {paymentModal.showModal && (
        <PaymentModal
          closeModal={paymentModal.closeModal}
          getAccount={getAccount}
          onPaymentSuccess={refreshAccountBalances}
        />
      )}
      {hashId && <StellarExpertLink url={hashId} />}
    </div>
  );
}

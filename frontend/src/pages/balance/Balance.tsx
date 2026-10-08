import React, { useState } from "react";
import styled, { css } from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";

import { useAuth } from "../../context/AuthContext";
import { MY_TRANSACTIONS_QUERY } from "../../queries/Queries";
import { TOP_UP_MUTATION } from "../../queries/Mutations";
import { TransactionsData } from "../../types/Types";
import formatCurrency from "../../utils/CurrencyFormatter";
import formatDate from "../../utils/formatDate";
import { getErrorMessage } from "../../utils/apolloErrors";
import { colors, radii } from "../../styles/theme";
import Loading from "../../components/loading/Loading";
import { Button } from "../../components/ui/Button";
import { Alert, Field, Form, Input } from "../../components/ui/Form";
import { PageHeader, Panel, PanelTitle } from "../../components/ui/Layout";
import { EmptyState, ErrorState } from "../../components/ui/States";

export const PRESET_AMOUNTS = [10000, 25000, 50000, 100000];
const MAX_TOP_UP = 5000000;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const BalanceCard = styled(Panel)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  background: linear-gradient(135deg, #3b5bdb 0%, ${colors.primary} 100%);
`;

const BalanceLabel = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
`;

const BalanceAmount = styled.p`
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1.1;
`;

const Note = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.875rem;
  line-height: 1.5;
`;

const Presets = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
  gap: 0.75rem;
`;

const Preset = styled.button<{ $selected: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.sm};
  background: transparent;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
  }

  ${({ $selected }) =>
    $selected &&
    css`
      border-color: ${colors.primary};
      background: ${colors.primarySoft};
    `}
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.875rem 0.5rem;
    border-bottom: 1px solid ${colors.border};
    text-align: left;
  }

  th {
    color: ${colors.textMuted};
    font-size: 0.875rem;
    font-weight: 600;
  }

  td:nth-child(n + 3),
  th:nth-child(n + 3) {
    text-align: right;
  }
`;

const Amount = styled.td<{ $positive: boolean }>`
  color: ${({ $positive }) => ($positive ? colors.success : colors.textSoft)};
  font-weight: 600;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const TopUpForm = () => {
  const [amount, setAmount] = useState(String(PRESET_AMOUNTS[1]));
  const [success, setSuccess] = useState("");
  const [topUp, { loading, error, reset }] = useMutation(TOP_UP_MUTATION, {
    refetchQueries: ["getMyTransactions"],
  });

  const value = Number(amount);
  const valid = Number.isInteger(value) && value > 0 && value <= MAX_TOP_UP;

  const choose = (next: string) => {
    setAmount(next);
    setSuccess("");
    reset();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    try {
      await topUp({ variables: { amount: value } });
      setSuccess(`${formatCurrency(value)} was added to your balance.`);
    } catch {
      // Shown through `error` below.
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {success && (
        <Alert $tone="success" role="status">
          {success}
        </Alert>
      )}
      {error && (
        <Alert $tone="error" role="alert">
          {getErrorMessage(error)}
        </Alert>
      )}
      <Presets role="group" aria-label="Quick amounts">
        {PRESET_AMOUNTS.map((preset) => (
          <Preset
            key={preset}
            type="button"
            $selected={value === preset}
            aria-pressed={value === preset}
            onClick={() => choose(String(preset))}
          >
            {formatCurrency(preset)}
          </Preset>
        ))}
      </Presets>
      <Field
        label="Amount (₦)"
        htmlFor="top-up-amount"
        hint={`Whole Naira, up to ${formatCurrency(MAX_TOP_UP)}`}
        error={amount && !valid ? "Enter a whole amount within the limit" : ""}
      >
        <Input
          id="top-up-amount"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_TOP_UP}
          step={1}
          value={amount}
          onChange={(e) => choose(e.target.value)}
          aria-invalid={Boolean(amount) && !valid}
        />
      </Field>
      <div>
        <Button type="submit" disabled={!valid || loading}>
          {loading
            ? "Adding…"
            : `Add ${valid ? formatCurrency(value) : "funds"}`}
        </Button>
      </div>
    </Form>
  );
};

const Transactions = () => {
  const { data, loading, error, refetch } = useQuery<TransactionsData>(
    MY_TRANSACTIONS_QUERY,
    { fetchPolicy: "cache-and-network" }
  );

  if (loading && !data) return <Loading label="Loading transactions" />;
  if (error && !data) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  }
  if (!data?.myTransactions.length) {
    return (
      <EmptyState
        icon={<MdOutlineAccountBalanceWallet aria-hidden />}
        title="No transactions yet"
        description="Top-ups and purchases will be listed here."
      />
    );
  }

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Description</th>
            <th scope="col">Amount</th>
            <th scope="col">Balance</th>
          </tr>
        </thead>
        <tbody>
          {data.myTransactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{formatDate(transaction.createdAt)}</td>
              <td>{transaction.description}</td>
              <Amount $positive={transaction.amount > 0}>
                {transaction.amount > 0 && "+"}
                {formatCurrency(transaction.amount)}
              </Amount>
              <td>{formatCurrency(transaction.balanceAfter)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

const Balance = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <PageHeader
        title="Balance"
        subtitle="Your store credit pays for orders at checkout."
      />
      <Grid>
        <BalanceCard aria-label="Current balance">
          <div>
            <BalanceLabel>
              <MdOutlineAccountBalanceWallet aria-hidden />
              Available balance
            </BalanceLabel>
            <BalanceAmount>{formatCurrency(user.balance)}</BalanceAmount>
          </div>
          <Note>
            This is a demo wallet: top-ups are instant and no real payment is
            taken.
          </Note>
        </BalanceCard>
        <Panel aria-labelledby="top-up-title">
          <PanelTitle id="top-up-title">Top up</PanelTitle>
          <TopUpForm />
        </Panel>
      </Grid>
      <Panel aria-labelledby="transactions-title">
        <PanelTitle id="transactions-title">Transactions</PanelTitle>
        <Transactions />
      </Panel>
    </>
  );
};

export default Balance;

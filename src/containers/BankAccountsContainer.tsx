import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { useActor } from "@xstate/react";
import {
  BaseActionObject,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  TypegenDisabled,
} from "xstate";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import { Grid, Button, Paper, Typography } from "@mui/material";

import { AuthMachineContext, AuthMachineEvents, AuthMachineSchema } from "../machines/authMachine";
import { DataContext, DataEvents, DataSchema } from "../machines/dataMachine";
import BankAccountForm from "../components/BankAccountForm";
import BankAccountList from "../components/BankAccountList";
import { httpClient } from "../utils/asyncUtils";

export interface Props {
  authService: Interpreter<AuthMachineContext, AuthMachineSchema, AuthMachineEvents, any, any>;
  // dejamos bankAccountsService opcional para compatibilidad si el router lo sigue pasando
  bankAccountsService?: any;
}

const PREFIX = "BankAccountsContainer";

const classes = {
  paper: `${PREFIX}-paper`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const BankAccountsContainer: React.FC<Props> = ({ authService }) => {
  const match = useRouteMatch();
  const [authState] = useActor(authService);
  const currentUser = authState?.context.user;

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBankAccounts = async () => {
  try {
    const { data } = await httpClient.get("/bankAccounts");

    const raw =
      Array.isArray(data)
        ? data
        : Array.isArray((data as any).results)
        ? (data as any).results
        : Array.isArray((data as any).bankAccounts)
        ? (data as any).bankAccounts
        : [];

    const visible = raw.filter((acc: any) => !acc.isDeleted);

    console.log("loadBankAccounts →", visible);
    setBankAccounts(visible);
  } catch (err) {
    console.error("Error loading bank accounts", err);
    setBankAccounts([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const createBankAccount = async (payload: BankAccountPayload) => {
    const { data } = await httpClient.post("/bankAccounts", payload);
    console.log("createBankAccount →", data);

    const newAccount = (data as any).account ?? data;

    setBankAccounts((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return [...safePrev, newAccount];
    });
  };

  const deleteBankAccount = async ({ id }: { id: string }) => {
  await httpClient.delete(`/bankAccounts/${id}`);
  setBankAccounts((prev) =>
    (Array.isArray(prev) ? prev : []).filter((acc) => acc.id !== id)
  );
};


  if (match.url === "/bankaccounts/new" && currentUser?.id) {
    return (
      <StyledPaper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Create Bank Account
        </Typography>
        <BankAccountForm userId={currentUser.id} createBankAccount={createBankAccount} />
      </StyledPaper>
    );
  }

  return (
    <StyledPaper className={classes.paper}>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Bank Accounts
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/bankaccounts/new"
            data-test="bankaccount-new"
          >
            Create
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <div>Loading bank accounts...</div>
      ) : (
        <BankAccountList bankAccounts={bankAccounts} deleteBankAccount={deleteBankAccount} />
      )}
    </StyledPaper>
  );
};

export default BankAccountsContainer;
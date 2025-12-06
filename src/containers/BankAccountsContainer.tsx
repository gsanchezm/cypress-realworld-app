import React, { useEffect } from "react";
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
  bankAccountsService: Interpreter<
    DataContext,
    DataSchema,
    DataEvents,
    any,
    ResolveTypegenMeta<TypegenDisabled, DataEvents, BaseActionObject, ServiceMap>
  >;
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

const BankAccountsContainer: React.FC<Props> = ({ authService, bankAccountsService }) => {
  const match = useRouteMatch();

  const [authState] = useActor(authService);
  const [bankAccountsState, sendBankAccounts] = useActor(bankAccountsService);

  const currentUser = authState?.context.user;

  const createBankAccount = async (payload: any) => {
  await httpClient.post("/bankAccounts", payload);
  sendBankAccounts("FETCH");
};

  const deleteBankAccount = async (payload: any) => {
  await httpClient.delete(`/bankAccounts/${payload.id}`);
  sendBankAccounts("FETCH");
};

  useEffect(() => {
    sendBankAccounts("FETCH");
  }, [sendBankAccounts]);

  if (match.url === "/bankaccounts/new" && currentUser?.id) {
    return (
      <StyledPaper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Create Bank Account
        </Typography>
        <BankAccountForm userId={currentUser?.id} createBankAccount={createBankAccount} />
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
      <BankAccountList
        bankAccounts={bankAccountsState?.context.results!}
        deleteBankAccount={deleteBankAccount}
      />
    </StyledPaper>
  );
};
export default BankAccountsContainer;

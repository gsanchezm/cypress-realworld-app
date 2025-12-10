import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Grid } from "@mui/material";
import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import PersonalSettingsIllustration from "../components/SvgUndrawPersonalSettingsKihd";
import UserSettingsForm from "../components/UserSettingsForm";

import {
  AuthMachineContext,
  AuthMachineEvents,
} from "../machines/authMachine";
import { User, UserSettingsPayload } from "../models";
import { httpClient } from "../utils/asyncUtils";

const PREFIX = "UserSettingsContainer";

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

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const UserSettingsContainer: React.FC<Props> = ({ authService }) => {
  const [authState, sendAuth] = useActor(authService);

  const currentUser = authState?.context?.user ?? null;

  const [userProfile, setUserProfile] = useState<User | null>(currentUser);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserProfile(currentUser);
    }
  }, [currentUser]);

  const updateUser = async (values: UserSettingsPayload & { id: string }) => {
    if (!userProfile) return;

    const fullUser: User = {
      ...userProfile,
      ...values,      
    };

    try {
      setSaving(true);

      const { data } = await httpClient.patch(`/users/${fullUser.id}`, fullUser);

      const updatedUser: User = (data as any).user ?? data ?? fullUser;

      setUserProfile(updatedUser);

      sendAuth({
        type: "USER_UPDATED",
        user: updatedUser,
      } as any);
    } catch (error) {
      console.error("Error updating user profile", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <StyledPaper className={classes.paper}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        User Settings
      </Typography>

      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <Grid item>
          <PersonalSettingsIllustration style={{ height: 200, width: 300 }} />
        </Grid>

        <Grid item style={{ width: "50%" }}>
          {userProfile && (
            <UserSettingsForm
              userProfile={userProfile}
              updateUser={updateUser}
              saving={saving}
            />
          )}
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default UserSettingsContainer;
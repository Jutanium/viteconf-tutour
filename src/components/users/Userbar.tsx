import {
  Component,
  createEffect,
  createResource,
  createSignal,
  ErrorBoundary,
} from "solid-js";
import { supabase } from "@/data/supabaseClient";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import { ProjectData } from "@/state";

const Userbar: Component<{
  projectData: ProjectData;
  saveButtonClicked: () => void;
}> = (props) => {
  const [authState, authActions] = useAuth();
  const theme = useTheme();

  return (
    <div class={theme.userbar()}>
      <Show
        when={authState.session?.user}
        children={
          <>
            <div class="ml-2">{authState.session.user.email}</div>
            <button
              class={theme.userbarButton()}
              onClick={props.saveButtonClicked}
            >
              Save
            </button>
            <button class={theme.userbarButton()} onClick={authActions.signout}>
              Log Out
            </button>
          </>
        }
        fallback={
          <button class={theme.userbarButton()} onClick={authActions.signin}>
            Log In
          </button>
        }
      />
    </div>
  );
};

export default Userbar;

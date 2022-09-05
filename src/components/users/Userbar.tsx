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
import { getProjects, insertProject } from "@/data/projects";
import { ProjectData } from "@/state";

const Userbar: Component<{ projectData: ProjectData }> = (props) => {
  const [authState, authActions] = useAuth();
  const theme = useTheme();

  const [trigger, setTrigger] = createSignal<any>(false);
  const [data] = createResource(trigger, insertProject);

  createEffect(() => {
    console.log("projects", data());
    setTrigger(false);
  });

  return (
    <div class={theme.userbar()}>
      <button
        class={theme.userbarButton()}
        onClick={
          () => console.log(JSON.parse(JSON.stringify(props.projectData)))
          // setTrigger({
          //   user_id: authState.session?.user?.id,
          // })
        }
      >
        Save
      </button>
      <Show
        when={authState.session?.user}
        children={
          <>
            <div class="ml-2">{authState.session.user.email}</div>
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

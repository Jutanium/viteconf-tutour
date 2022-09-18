import {
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
} from "solid-js";
import { supabase } from "@/fetch/supabaseClient";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import { useNavigate } from "solid-app-router";
import { ProjectState } from "@/state";
import { saveProject } from "@/fetch/projects";

const Userbar: Component<{
  project: ProjectState;
  lastSavedAt?: Date;
  saving: boolean;
  saveable: boolean;
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
            <div class="ml-2">
              {authState.session.user.user_metadata.preferred_username}
            </div>
            <button
              class={"mr-a " + theme.userbarButton()}
              onClick={authActions.signout}
            >
              Log Out
            </button>
            <Show
              when={props.saving}
              fallback={
                props.lastSavedAt && (
                  <div>
                    Saved{" "}
                    {props.lastSavedAt.toLocaleTimeString("en", {
                      timeStyle: "short",
                    })}
                  </div>
                )
              }
            >
              <div>Saving...</div>
            </Show>
            <button
              class={theme.userbarButton()}
              onClick={props.saveButtonClicked}
            >
              <Show when={props.saveable} fallback="Fork to Edit">
                Save
              </Show>
            </button>
          </>
        }
        fallback={
          <button
            class={theme.userbarButton()}
            onClick={[authActions.signin, props.project.serialize()]}
          >
            Log In
          </button>
        }
      />
      <form class={theme.userbarPreviewForm()}>
        {/* TODO: should be a toggle switch, not a checkbox! */}
        <input
          id="preview"
          type="checkbox"
          class={theme.userbarPreviewToggle()}
          checked={props.project.previewMode}
          onChange={(e) => {
            props.project.setPreviewMode(!props.project.previewMode);
          }}
        ></input>
        <label for="preview">Preview</label>
      </form>
    </div>
  );
};

export default Userbar;

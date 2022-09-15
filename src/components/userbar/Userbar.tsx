import {
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
} from "solid-js";
import { supabase } from "@/data/supabaseClient";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import { useNavigate } from "solid-app-router";
import { ProjectState } from "@/state/state";
import { saveProject } from "@/data/projects";

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
            <div class="ml-2">{authState.session.user.email}</div>
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
            <Show when={props.saveable}>
              <div class="flex justify-center items-center gap-1 mr-2 font-bold">
                <input
                  id="preview"
                  type="checkbox"
                  class="w-6 h-6 text-oneDark-coral focus:ring-0 rounded-md"
                  checked={props.project.previewMode}
                  onChange={(e) => {
                    props.project.setPreviewMode(!props.project.previewMode);
                  }}
                ></input>
                <label for="preview">Preview</label>
              </div>
            </Show>
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

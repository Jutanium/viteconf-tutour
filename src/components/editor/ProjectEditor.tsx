import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  createResource,
  on,
  createSignal,
} from "solid-js";
import { ProjectData, ProjectState } from "@/state";
import { useTheme } from "../../providers/theme";
import { TabbedEditor } from "./code/TabbedEditor";
import { Repl } from "../repl/Repl";
import Userbar from "@/components/userbar/Userbar";
import { useNavigate, useRouteData } from "@solidjs/router";
import { saveProject } from "../../fetch/projects";
import Slides from "./slides/Slides";
import SlideStart from "./slides/SlideStart";
import { useAuth } from "../../providers/auth";
import "./fonts.ts";

const ProjectEditor: Component = () => {
  const theme = useTheme();

  const project = useRouteData<Accessor<ProjectState>>();
  const [auth] = useAuth();
  const navigate = useNavigate();

  const saveable = createMemo(
    () => project()?.savedId && project().createdBy === auth.session?.user.id
  );

  const [saveData, setSaveData] = createSignal<ProjectData>();
  const [saved] = createResource(saveData, async function (data) {
    if (saveable()) {
      const id = await saveProject(data, project().savedId);
      return id;
    }
  });

  const lastSavedAt = createMemo(() => {
    const savedResult = saved();
    if (savedResult) {
      return savedResult.updated_at;
    }
  });

  async function saveButtonClicked() {
    if (saveable()) {
      setSaveData(project().serialize());
      return;
    }
    const result = await saveProject(project().serialize());
    if (result) {
      navigate(`/p/${result?.id}`);
    }
  }

  createEffect(
    on(project, () => {
      if (project() && auth.session) {
        if (project().createdBy === auth.session.user.id) {
          project().setPreviewMode(false);
          return;
        }
        project().setPreviewMode(true);
      }
    })
  );

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setSaveData(project().serialize());
    }
  }

  return (
    <Show when={project()}>
      <div
        class="dark flex h-screen w-full bg-oneDark-background"
        onKeyDown={onKeyDown}
      >
        <div class="w-1/3 flex flex-col border-r-1 border-oneDark-selection">
          <Userbar
            project={project()}
            saveable={saveable()}
            saving={saved.loading}
            lastSavedAt={lastSavedAt()}
            saveButtonClicked={saveButtonClicked}
          />
          <Slides project={project()} />
        </div>
        <div class="w-2/3 flex flex-col lg:flex-row">
          <Show when={project().currentSlide}>
            <div class="w-full h-1/2 flex-grow lg:w-1/2 lg:h-full border-b-1 lg:border-r-1 lg:border-b-0 border-oneDark-selection">
              <Show
                when={project().currentSlide.fileSystem.fileList.length > 0}
                fallback={<SlideStart project={project()} />}
              >
                <TabbedEditor fileSystem={project().currentSlide.fileSystem} />
              </Show>
            </div>
            <Repl fileSystem={project().currentSlide.fileSystem} />
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default ProjectEditor;

import { fetchRepo, RepoFile } from "@/fetch/github";
import { useTheme } from "@/providers/theme";
import { ProjectState } from "@/state";
import {
  Component,
  createSignal,
  createMemo,
  onMount,
  createResource,
  createEffect,
} from "solid-js";
import SlidesBar from "./SlidesBar";

const GitHubForm: Component<{
  onSuccess: (files: RepoFile[]) => void;
  error?: string;
}> = (props) => {
  const theme = useTheme();
  let inputRef!: HTMLInputElement;

  onMount(() => {
    inputRef.focus();
  });

  const [inputPath, setInputPath] = createSignal<string>(
    "solidjs/templates/js"
  );

  const [submitted, setSubmitted] = createSignal(false);

  const [ghData] = createResource(() => submitted() && inputPath(), fetchRepo);

  const ghFormSubmit = (e) => {
    e.preventDefault();
    if (!submitted()) {
      setSubmitted(true);
    }
  };

  createEffect(() => {
    if (ghData()) {
      if (ghData().files) {
        props.onSuccess(ghData().files);
      }
      setSubmitted(false);
    }
  });

  const regexp = /.+\/.+(?:\/.+)?/;

  return (
    <Show
      when={!ghData.loading}
      fallback={<div class="text-oneDark-chalky ml-2">Loading...</div>}
    >
      <form class={theme.slideStartForm()} onSubmit={ghFormSubmit}>
        <label class="font-bold" for="degitString">
          Load files from GitHub:
        </label>
        <input
          ref={inputRef}
          spellcheck={false}
          type="text"
          id="degitString"
          placeholder="owner/repo/path"
          class={theme.slideStartInput()}
          size={20}
          value={inputPath()}
          onInput={(e) => setInputPath(e.currentTarget.value)}
          required
          pattern={regexp.source}
        />
        <button type="submit" class={theme.slideStartButton()}>
          Pull
        </button>
      </form>
      {props.error && (
        <div class="text-oneDark-coral max-w-100 ml-2">{props.error}</div>
      )}
    </Show>
  );
};

const SlideStart: Component<{ project: ProjectState }> = (props) => {
  const theme = useTheme();

  // const [ghError, setGhError] = createSignal<string | false>(false);

  const currentSlide = createMemo(() => props.project.currentSlide);
  const previousSlides = createMemo(() => props.project.slides);

  const fromPrevious = (slideIndex: number) => {
    currentSlide().setFilesFromSlide(
      props.project.slides[slideIndex].serialize()
    );
  };

  const ghFormSuccess = (files: RepoFile[]) =>
    currentSlide().setFilesFromGitHub(files);

  const removeSlide = () => {
    const index = props.project.slideIndex;
    props.project.removeSlide(index);
    props.project.setSlide(index > 0 ? index - 1 : 0);
  };

  return (
    <div class={theme.slideStartRoot()}>
      <Show when={!props.project.previewMode}>
        <div class={theme.slideStartBody()}>
          <Show
            when={
              props.project.slideIndex > 0 &&
              previousSlides().some((s) => !s.fileSystem.isEmpty)
            }
          >
            <div class={theme.slideStartForm()}>
              <span class="font-bold">Copy files from a previous slide:</span>
              <SlidesBar
                array={previousSlides()}
                filter={(slide) => !slide.fileSystem.isEmpty}
                onClick={fromPrevious}
              />
            </div>
          </Show>
          <ErrorBoundary
            fallback={(err) => (
              <GitHubForm onSuccess={ghFormSuccess} error={err.message} />
            )}
          >
            <GitHubForm onSuccess={ghFormSuccess} />
          </ErrorBoundary>
          <Show when={props.project.slides.length > 0}>
            <div class={theme.slideStartForm()}>
              <button class={theme.slideStartButton()} onClick={removeSlide}>
                Remove Slide
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default SlideStart;

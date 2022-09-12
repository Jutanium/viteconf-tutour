import { fetchRepo, RepoFile } from "@/data/github";
import { useTheme } from "@/providers/theme";
import { ProjectState } from "@/state/state";
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

  const regexp = /\w+\/\w+(?:\/\w+)?/;

  return (
    <Suspense fallback={<div class="text-oneDark-chalky">Loading...</div>}>
      <form class={theme.slideStartForm()} onSubmit={ghFormSubmit}>
        <label class="font-bold" for="degitString">
          Start from GitHub:
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
    </Suspense>
  );
};

const SlideStart: Component<{ project: ProjectState }> = (props) => {
  const theme = useTheme();

  // const [ghError, setGhError] = createSignal<string | false>(false);

  const currentSlide = createMemo(() => props.project.currentSlide);
  const previousSlides = createMemo(() => props.project.slides);

  const fromPrevious = (slideIndex: number) => {
    currentSlide().setFilesFromSlide(
      props.project.slides[slideIndex].serialized
    );
  };

  const ghFormSuccess = (files: RepoFile[]) =>
    currentSlide().setFilesFromGitHub(files);

  return (
    <div class={theme.slideStartRoot()}>
      <div class={theme.slideStartBody()}>
        <Show when={props.project.slideIndex > 0}>
          <div class={theme.slideStartForm()}>
            <span class="font-bold">Start from a previous slide:</span>
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
      </div>
    </div>
  );
};

export default SlideStart;

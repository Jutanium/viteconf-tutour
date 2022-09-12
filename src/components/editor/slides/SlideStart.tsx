import { useTheme } from "@/providers/theme";
import { ProjectState, SlideState } from "@/state";
import { Component, createSignal, createMemo, onMount } from "solid-js";
import SlidesBar from "./SlidesBar";

const SlideSetup: Component<{ project: ProjectState }> = (props) => {
  const theme = useTheme();

  let inputRef!: HTMLInputElement;

  const [inputPath, setInputPath] = createSignal<string>(
    "solidjs/templates/js"
  );

  const [submitted, setSubmitted] = createSignal(false);
  const [ghError, setGhError] = createSignal<string | false>(false);

  const currentSlide = createMemo(() => props.project.currentSlide);
  const previousSlides = createMemo(() => props.project.slides);

  onMount(() => {
    inputRef.focus();
  });

  const fromPrevious = (slideIndex: number) => {
    currentSlide().setFilesFromSlide(
      props.project.slides[slideIndex].serialized
    );
  };

  const ghFormSubmit = async (e) => {
    e.preventDefault();
    if (!submitted()) {
      setSubmitted(true);
      setGhError(false);
      const error = await currentSlide().loadFilesFromGitHub(inputPath());
      if (typeof error === "string") {
        setGhError(error);
      }
      setSubmitted(false);
    }
  };

  const regexp = /\w+\/\w+(?:\/\w+)?/;
  return (
    <div class={theme.slideStartRoot()}>
      <div class={theme.slideStartBody()}>
        <Show
          when={!submitted()}
          fallback={<div class="text-oneDark-chalky">Loading...</div>}
        >
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
        </Show>
        <Show when={ghError()}>
          <div class="text-oneDark-coral max-w-2/3">{ghError()}</div>
        </Show>
      </div>
    </div>
  );
};

export default SlideSetup;

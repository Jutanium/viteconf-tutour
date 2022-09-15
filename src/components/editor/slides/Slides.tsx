import { useTheme } from "@/providers/theme";
import { ProjectState } from "@/state/state";
import { Component } from "solid-js";
import { MarkdownEditor } from "../content/MarkdownEditor";
import { MarkdownPreview } from "../content/MarkdownPreview";
import SlidesBar from "./SlidesBar";

const Slides: Component<{ project: ProjectState }> = (props) => {
  const theme = useTheme();

  const setSlide = (index) => props.project.setSlide(index);
  const addSlide = () => {
    const newIndex = props.project.addSlide({ md: "# New Slide" });
    setSlide(newIndex);
  };

  return (
    <div class={theme.slidesRoot()}>
      <div class={theme.slidesBar()}>
        <SlidesBar
          array={props.project.slides}
          selected={props.project.slideIndex}
          onClick={setSlide}
        />
        <button class={theme.slidesBarButton()} onClick={addSlide}>
          <span>+</span>
        </button>
      </div>
      <div class="w-full">
        <For each={props.project.slides}>
          {(slide, index) => (
            <div
              class={theme.mdContainer(index() === props.project.slideIndex)}
            >
              <Show
                when={
                  !props.project.previewMode &&
                  index() === props.project.slideIndex
                }
                children={
                  <MarkdownEditor
                    startingMarkdown={slide.markdown}
                    updateMarkdown={slide.setMarkdown}
                  />
                }
                fallback={
                  <div onClick={[setSlide, index()]}>
                    <MarkdownPreview markdown={slide.markdown} />
                  </div>
                }
              />
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default Slides;

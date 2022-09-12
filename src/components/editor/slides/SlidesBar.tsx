import { useTheme } from "@/providers/theme";
import { SlideState } from "@/state";
import { Component } from "solid-js";

const SlidesBar: Component<{
  array: Array<SlideState>;
  selected?: number;
  onClick: (index: number) => void;
  filter?: (slide: SlideState) => boolean;
}> = (props) => {
  const theme = useTheme();

  return (
    <For each={props.array}>
      {(slide, index) => (
        <Show when={!props.filter || props.filter(slide)}>
          <button
            class={theme.slidesBarButton(index() == props.selected)}
            onClick={[props.onClick, index()]}
          >
            {index() + 1}
          </button>
        </Show>
      )}
    </For>
  );
};

export default SlidesBar;

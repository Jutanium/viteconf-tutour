import { useTheme } from "@/providers/theme";
import { FilePath, isFilePath } from "@/state";
import { Component, createSignal, onMount } from "solid-js";

const EditPath: Component<{
  initial?: string;
  onSubmit: (validPath: FilePath | false) => void;
}> = (props) => {
  let ref!: HTMLInputElement;
  const theme = useTheme();

  const [inputPath, setInputPath] = createSignal<string>(
    props.initial || "new.js"
  );

  function submit(e) {
    const newPath = inputPath();
    props.onSubmit(isFilePath(newPath) ? newPath : false);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      ref.blur();
    }
  }

  onMount(() => {
    ref.focus();
    if (!props.initial) {
      ref.select();
      return;
    }
    ref.setSelectionRange(0, inputPath().indexOf("."));
  });

  return (
    <input
      ref={ref}
      class={theme.editPath()}
      spellcheck={false}
      size={inputPath().length}
      onBlur={submit}
      onKeyDown={onKeyDown}
      onInput={(e) => setInputPath(e.currentTarget.value)}
      type="text"
      value={inputPath()}
    />
  );
};

export default EditPath;

import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { debounce, throttle } from "@solid-primitives/scheduled";
import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import "xterm/css/xterm.css";
import { FileState, FileSystemState } from "@/state/state";
import { FileSystemTree, load, WebContainer } from "@webcontainer/api";

// https://xtermjs.org/docs/api/vtfeatures/

interface Props {
  fileSystem: FileSystemState;
}

const bootWebContainer = load().then((x) => x.boot());

function treeFromFiles(files: FileState[]): FileSystemTree {
  const tree = {} as FileSystemTree;

  for (const file of files) {
    const pieces = file.pathName.split("/");
    let segment = tree;
    for (let i = 0; i < pieces.length - 1; i++) {
      const piece = pieces[i];
      if (!segment[piece]) {
        const x = { directory: {} };
        segment[piece] = x;
        segment = x.directory;
      } else {
        segment = segment[piece].directory;
      }
    }
    segment[pieces[pieces.length - 1]] = {
      file: { contents: file.doc },
    };
  }
  return tree;
}

export function Repl(props: Props) {
  const [magicURL, setMagicURL] = createSignal<string | null>(null, {
    equals: false,
  });

  const terminal = new Terminal({ convertEol: true });
  // const fitAddon = new FitAddon();
  // terminal.loadAddon(fitAddon);
  // const debouncedFit = debounce(() => fitAddon.fit(), 17);
  // const observer = new ResizeObserver(() => debouncedFit());

  onCleanup(() => {
    // observer.disconnect();
    // fitAddon.dispose();
    terminal.dispose();
  });

  let container: WebContainer;

  async function loadFiles() {
    if (container) {
      // await container.fs.rm("app", { force: true, recursive: true });
      await container.loadFiles({
        app: { directory: treeFromFiles(props.fileSystem.fileList) },
      });
    }
  }

  createEffect(() => {
    console.log(props.fileSystem.filesSaved);
  });

  onMount(async () => {
    container = await bootWebContainer;
    console.log("wc booted");

    container.on("server-ready", (_, url) => {
      console.log(url);
      setMagicURL(url);
    });
    // console.log(container);
  });

  // terminal.onData((str, arg2) => {
  //   const charCode = str.charCodeAt(0);
  //   console.log(str, charCode, arg2);

  //   if (charCode === 127) {
  //     terminal.write("\x9B1D");
  //     terminal.write("\x9B1P");
  //     return;
  //   }

  //   if (charCode === 13) {
  //   }

  //   terminal.write(str);
  // });

  return (
    <div>
      <Show when={magicURL()}>
        <iframe
          class="w-full h-3/4"
          allow="cross-origin-isolated"
          src={magicURL()}
        />
        <div
          class="w-full h-full bg-black"
          ref={(el) => {
            terminal.open(el);
          }}
        ></div>
      </Show>
    </div>
  );
}

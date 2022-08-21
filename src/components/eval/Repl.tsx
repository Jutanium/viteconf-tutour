import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { debounce, throttle } from "@solid-primitives/scheduled";
import { createSignal, onCleanup, onMount } from "solid-js";
import "xterm/css/xterm.css";
import { FileState } from "../../state/state";
import { FileSystemTree, load } from "@webcontainer/api";
import { FileData } from "../../state/projectData";

// https://xtermjs.org/docs/api/vtfeatures/

interface Props {
  fileStates: FileState[];
}

const bootWebContainer = load().then((x) => x.boot());

function treeFromFiles(files: FileData[]): FileSystemTree {
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
      }
    }
    segment[pieces[pieces.length - 1]] = {
      file: { contents: file.doc },
    };
  }
  return tree;
}

export function Repl(props: Props) {
  const [magicURL, setMagicURL] = createSignal(
    'data:text/html,<p style="color:gray;font-family:sans-serif">Booting webcontainer</p>',
    { equals: false }
  );

  const terminal = new Terminal({ convertEol: true });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  const debouncedFit = debounce(() => fitAddon.fit(), 17);
  const observer = new ResizeObserver(() => debouncedFit());

  onCleanup(() => {
    observer.disconnect();
    fitAddon.dispose();
    terminal.dispose();
  });

  onMount(async () => {
    console.log("got here");
    const container = await bootWebContainer;

    const tree: FileSystemTree = {};

    await container.loadFiles(
      treeFromFiles(props.fileStates.map((s) => s.data))
    );

    let result = await container.run(
      {
        command: "ls",
        args: [],
      },
      {
        output: (data) => {
          terminal.write(data);
        },
      }
    );
    await result.onExit;

    result = await container.run(
      {
        command: "node",
        args: ["testScript.js"],
      },
      {
        output: (data) => {
          terminal.write(data);
        },
      }
    );
    await result.onExit;

    console.log(container);
  });

  terminal.onData((str, arg2) => {
    const charCode = str.charCodeAt(0);
    console.log(str, charCode, arg2);

    if (charCode === 127) {
      terminal.write("\x9B1D");
      terminal.write("\x9B1P");
      return;
    }

    if (charCode === 13) {
    }

    terminal.write(str);
  });

  return (
    <div
      class="w-full h-full bg-blue-500"
      ref={(el) => {
        terminal.open(el);
        fitAddon.fit();
        observer.observe(el);
      }}
    ></div>
  );
}

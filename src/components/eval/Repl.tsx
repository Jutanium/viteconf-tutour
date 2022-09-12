import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { debounce, throttle } from "@solid-primitives/scheduled";
import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import "xterm/css/xterm.css";
import { FileState, FileSystemState } from "@/state";
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
  const [magicURL, setMagicURL] = createSignal<string | false>(false, {
    equals: false,
  });

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

  let container: WebContainer;

  async function loadFiles() {
    if (container) {
      // await container.fs.rm("app", { force: true, recursive: true });
      await container.loadFiles({
        app: { directory: treeFromFiles(props.fileSystem.fileList) },
      });
    }
  }

  createEffect(
    on(
      () => props.fileSystem.saved,
      async () => {
        await loadFiles();

        let result = await container.run(
          {
            command: "ls",
            args: ["app", "-a"],
          },
          {
            output: (data) => {
              terminal.write(data);
            },
          }
        );
        // await result.onExit;
        if (magicURL()) return;

        if (container) {
          let result = await container.run(
            {
              command: "npm",
              args: ["install", "--prefix", "app"],
            },
            {
              output: (data) => {
                terminal.write(data);
              },
            }
          );
          await result.onExit;

          // result = await container.run(
          //   {
          //     command: "cat",
          //     args: ["app/src/index.css"],
          //   },
          //   {
          //     output: (data) => {
          //       terminal.write(data);
          //     },
          //   }
          // );
          // await result.onExit;

          result = await container.run(
            {
              command: "npm",
              args: ["run", "--prefix", "app", "dev"],
            },
            {
              output: (data) => {
                terminal.write(data);
              },
            }
          );
          await result.onExit;
        }
      }
    )
  );

  onMount(async () => {
    container = await bootWebContainer;

    container.on("server-ready", (_, url) => {
      console.log(url);
      setMagicURL(url);
    });

    const files = await loadFiles();
    // let result = await container.run(
    //   {
    //     command: "ls",
    //     args: ["app", "-a"],
    //   },
    //   {
    //     output: (data) => {
    //       terminal.write(data);
    //     },
    //   }
    // );
    // await result.onExit;

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
    <div class="h-full w-full">
      <Show when={magicURL()}>
        <iframe
          class="w-full h-3/4"
          allow="cross-origin-isolated"
          src={magicURL()}
        />
      </Show>
      <div
        class="w-full h-full bg-black"
        ref={(el) => {
          terminal.open(el);
          fitAddon.fit();
          observer.observe(el);
        }}
      ></div>
    </div>
  );
}

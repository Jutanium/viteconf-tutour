import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { debounce, throttle } from "@solid-primitives/scheduled";
import {
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
} from "solid-js";
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
  const [lastUpdated, setLastUpdated] = createSignal(0);
  const isPackage = createMemo(() =>
    props.fileSystem.fileList.some((f) => f.pathName === "package.json")
  );

  const terminal = new Terminal({ convertEol: true });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  const debouncedFit = debounce(() => fitAddon.fit(), 17);
  const resizeObserver = new ResizeObserver(() => debouncedFit());

  onCleanup(() => {
    resizeObserver.disconnect();
    fitAddon.dispose();
    terminal.dispose();
  });

  let container: WebContainer;

  async function loadFiles(files: FileState[]) {
    if (container) {
      // await container.fs.rm("app", { force: true, recursive: true });
      await container.loadFiles(treeFromFiles(files));
    }
  }

  async function removeFiles(pathNames: string[]) {
    if (container) {
      for (const pathName of pathNames) {
        try {
          await container.fs.rm(pathName);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  async function runCommand(commandString) {
    const [command, ...args] = commandString.split(" ");
    if (container) {
      const result = await container.run(
        {
          command,
          args,
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

  let currentFiles: { [path: string]: string } = {};
  function updateCurrentFiles() {
    currentFiles = Object.fromEntries(
      props.fileSystem.fileList.map((f) => [f.pathName, f.doc])
    );
  }

  const savedFiles = createMemo(() =>
    props.fileSystem.fileList.filter((file) => file.saved > lastUpdated())
  );

  createEffect(
    on([() => props.fileSystem, savedFiles], async () => {
      if (props.fileSystem.isEmpty) {
        return;
      }

      const filePaths = new Set(
        props.fileSystem.fileList.map((f) => f.pathName)
      );

      const toRemove = Object.keys(currentFiles).filter(
        (s) => !filePaths.has(s)
      );

      const toUpdate = props.fileSystem.fileList.filter(
        (file) =>
          !currentFiles[file.pathName] ||
          currentFiles[file.pathName] !== file.doc
      );

      updateCurrentFiles();
      setLastUpdated(Date.now());

      await removeFiles(toRemove);
      await loadFiles(toUpdate);

      if (toUpdate.some((file) => file.pathName === "package.json")) {
        await runCommand("npm install");
        await runCommand("npm run dev");
      }
    })
  );

  onMount(async () => {
    container = await bootWebContainer;
    console.log("wc booted");

    container.on("server-ready", (_, url) => {
      console.log(url);
      setMagicURL(url);
    });

    updateCurrentFiles();
    setLastUpdated(Date.now());
    await loadFiles(props.fileSystem.fileList);
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
    <Show when={isPackage()}>
      <div class="w-full h-1/2 lg:w-1/2 lg:h-full">
        <iframe
          class="h-3/4 w-full"
          allow="cross-origin-isolated"
          src={magicURL()}
        />
        <div
          class="h-1/4 w-full bg-black"
          ref={(el) => {
            terminal.open(el);
            fitAddon.fit();
            resizeObserver.observe(el);
          }}
        ></div>
      </div>
    </Show>
  );
}

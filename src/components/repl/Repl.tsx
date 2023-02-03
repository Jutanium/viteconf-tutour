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
import { FileState, FileSystemState } from "@/state";
import {
  DirectoryEntry,
  FileSystemTree,
  WebContainer,
  WebContainerProcess,
} from "@webcontainer/api";

// https://xtermjs.org/docs/api/vtfeatures/

interface Props {
  fileSystem: FileSystemState;
}

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
        segment = (segment[piece] as DirectoryEntry).directory;
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

  const [container, setContainer] = createSignal<WebContainer>();

  let running: WebContainerProcess;
  let currentFiles: { [path: string]: string } = {};

  async function loadFiles(files: FileState[]) {
    if (container()) {
      // await container.fs.rm("app", { force: true, recursive: true });
      await container().mount(treeFromFiles(files));
    }
  }

  async function removeFiles(pathNames: string[]) {
    if (container()) {
      for (const pathName of pathNames) {
        try {
          await container().fs.rm(pathName);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  async function runCommand(commandString) {
    const [command, ...args] = commandString.split(" ");
    if (container()) {
      const process = await container().spawn(command, args, {
        output: true,
      });

      const reader = process.output.getReader();
      reader.read().then(function processText({ done, value }) {
        if (done) {
          return;
        }
        terminal.write(value);
        return reader.read().then(processText);
      });

      return process;
    }
  }

  function updateCurrentFiles() {
    currentFiles = Object.fromEntries(
      props.fileSystem.fileList.map((f) => [f.pathName, f.doc])
    );
  }

  const savedFiles = createMemo(() =>
    props.fileSystem.fileList.filter((file) => file.saved > lastUpdated())
  );

  async function diffAndReload() {
    if (props.fileSystem.isEmpty || !isPackage() || !container()) {
      return;
    }

    const filePaths = new Set(props.fileSystem.fileList.map((f) => f.pathName));

    const toRemove = Object.keys(currentFiles).filter((s) => !filePaths.has(s));

    const toUpdate = props.fileSystem.fileList.filter(
      (file) =>
        !currentFiles[file.pathName] || currentFiles[file.pathName] !== file.doc
    );

    updateCurrentFiles();
    setLastUpdated(Date.now());

    await removeFiles(toRemove);
    await loadFiles(toUpdate);

    if (toUpdate.some((file) => file.pathName === "package.json")) {
      if (running) running.kill();
      const installing = await runCommand("npm install");
      await installing.exit;
      running = await runCommand("npm run dev");
    }
  }

  createEffect(
    on([() => props.fileSystem, savedFiles, container], diffAndReload)
  );

  onMount(async () => {
    setContainer(await WebContainer.boot());

    container().on("server-ready", (port, url) => {
      console.log(url);
      setMagicURL(url);
    });

    updateCurrentFiles();
    setLastUpdated(Date.now());
  });

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

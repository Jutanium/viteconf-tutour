export type FileType =
  | "html"
  | "js"
  | "jsx"
  | "tsx"
  | "ts"
  | "css"
  | "json"
  | "md";
export type FilePath = `${string}.${FileType}`;

export interface FileData {
  doc: string;
  pathName: FilePath;
  codeLinks: Record<string, CodeLink>;
}

export interface ContentData {
  markdown: string;
}

export interface CodeLink {
  from: number;
  to?: number;
  startLine?: number;
  endLine?: number;
  id: string;
  name: string;
}

export interface CodeLinkWithPath extends CodeLink {
  pathName: FilePath;
}

export interface SlideData {
  files: FileData[];
  content: ContentData;
}

export interface ProjectData {
  slides: SlideData[];
  config: {};
}

export function getFileType(path: FilePath): FileType {
  const parts = path.split(".");
  return parts[parts.length - 1] as FileType;
}

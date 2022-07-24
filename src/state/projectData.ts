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

export interface ContentData {}
// export interface LineRange {
//   fromLine: number;
//   toLine: number;
// }

export type CodeLink = {
  from: number;
  to?: number;
  id: string;
};

export interface SlideData {
  files: FileData[];
  content: ContentData[];
}

export interface ProjectData {
  slides: SlideData[];
  config: {};
}

export function getFileType(path: FilePath): FileType {
  const parts = path.split(".");
  return parts[parts.length - 1] as FileType;
}

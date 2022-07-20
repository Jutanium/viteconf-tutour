export type FileType = "html" | "js" | "jsx" | "tsx" | "ts" | "css" | "json";
export type FilePath = `${string}.${FileType}`;

export interface FileData {
  doc: string;
  pathName: FilePath;
  codeLinks: CodeLink[];
}

export interface ContentNodeData {}

export interface Range {
  from: number;
  to: number;
}

// export interface LineRange {
//   fromLine: number;
//   toLine: number;
// }

export interface CodeLink {
  selection: Range;
  id: string;
}

export interface SlideData {
  files: FileData[];
  content: ContentNodeData[];
}

export interface ProjectData {
  slides: SlideData[];
  config: {};
}

export function getFileType(path: FilePath): FileType {
  const parts = path.split(".");
  return parts[parts.length - 1] as FileType;
}

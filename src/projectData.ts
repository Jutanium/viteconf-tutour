export type FileType = "html" | "js" | "jsx" | "tsx" | "ts" | "css" | "json";
export type FilePath = `${string}.${FileType}`;

export interface FileData {
  doc: string;
  pathName: FilePath;
  codeLinks: CodeLink[];
}

export interface ContentNode {}

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

export interface Slide {
  files: FileData[];
  content: ContentNode[];
}

export interface ProjectData {
  slides: Slide[];
  config: {};
}

export function getFileType(path: FilePath): FileType {
  const parts = path.split(".");
  return parts[parts.length - 1] as FileType;
}

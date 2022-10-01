## What is this?

This is a proof-of-concept for an interactive tutorial creator using the experimental [WebContainer API](https://developer.stackblitz.com/docs/platform/webcontainer-api/).
This project is very much under construction and not ready to be used as a real app, but I hope this repository can serve as a reference for building your own tools with WebContainers!

It uses a slide system: write Markdown and tie it to a specific file system state. Each segment of markdown becomes a clickable "slide" in a Markdown document, restoring that state in the editor. A file system state also remembers which files were open in the editor and which one was currently selected.

You can use this to guide the reader through building a project, give a tour through a codebase, or present challenges and solutions.

It's built with [Solid](https://www.solidjs.com/) and uses Codemirror for editing. It has basic GitHub OAuth authentication through Supabase, which then allows you to import code from GitHub. For now, it uses the Supabase client SDK and a single supabase table to save and load projects.

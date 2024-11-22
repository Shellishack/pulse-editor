"use client";

import ReactCodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import ViewLayout from "./layout";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "next-themes";
import { Progress } from "@nextui-org/react";
import { DrawnLine, SelectionInformation, ViewDocument } from "@/lib/interface";
import CanvasEditor from "../canvas/canvas-editor";
import html2canvas from "html2canvas";

import React from "react";
import { createRoot } from "react-dom/client";

export default function CodeEditorView({
  viewId,
  width,
  height,
  url,
  isDrawingMode = false,
  isDownloadClip = false,
  isDrawHulls = false,
  setIsCanvasReady,
  onViewDocumentChange,
}: {
  viewId: string;
  width?: string;
  height?: string;
  url?: string;
  isDrawingMode?: boolean;
  isDownloadClip?: boolean;
  isDrawHulls?: boolean;
  setIsCanvasReady: (isReady: boolean) => void;
  onViewDocumentChange: (
    viewId: string,
    viewDocument: ViewDocument | undefined,
  ) => void;
}) {
  /* Set up theme */
  const [theme, setTheme] = useState(vscodeDark);
  const { resolvedTheme } = useTheme();
  const cmRef = useRef<ReactCodeMirrorRef>(null);

  /* Set editor content */
  const [viewDocument, setViewDocument] = useState<ViewDocument | undefined>(
    undefined,
  );

  useEffect(() => {
    if (url) {
      fetch(url)
        .then((res) => res.text())
        .then((text) => {
          const viewId = "1";

          // Init a new viewDocument
          const viewDocument: ViewDocument = {
            fileContent: text,
            filePath: url,
            selections: [],
          };
          setViewDocument(viewDocument);
        });
    }
  }, [url]);

  useEffect(() => {
    onViewDocumentChange(viewId, viewDocument);
  }, [onViewDocumentChange, viewDocument]);

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setTheme(vscodeDark);
    } else {
      setTheme(vscodeLight);
    }
  }, [resolvedTheme]);

  useEffect(() => {
    // reset drawing info when drawing mode is off
    if (!isDrawingMode) {
      setViewDocument((prev) => {
        // Return undefined if viewDocument is not set
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          selections: [],
        };
      });
      setIsCanvasReady(false);
      const canvasWidget = document.getElementById("canvas-widget");
      if (canvasWidget) {
        canvasWidget.remove();
      }

      return;
    }
    // Get editor canvas
    const scroller = cmRef.current?.view?.scrollDOM;
    if (!scroller) {
      throw new Error("Scroller not found");
    }
    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }

    const editor = document.getElementsByClassName("cm-editor")[0];
    if (!editor) {
      throw new Error("Editor not found");
    }

    // Get the background color of the editor
    const background = window.getComputedStyle(editor).backgroundColor;

    // Convert the editor content to a canvas using html2canvas
    html2canvas(editorContent, {
      windowWidth: editorContent.offsetWidth,
      windowHeight: editorContent.offsetHeight,
      backgroundColor: background,
    }).then((canvas) => {
      // Set the canvas to the state
      setIsCanvasReady(true);

      /* This finds cm-scroller and injects the canvas.
         This is doable because cm-scroller does not keep 
         track of its content (?). 
         
         It is known that injecting into cm-content will cause 
         CodeMirror to lose its internal states as the content
         is directly managed by CodeMirror internals.
         
         A better way to do this is to make a CodeMirror decoration
         instead of injecting into its DOM. */
      // Add the canvas to the editor content

      scroller.appendChild(
        getCanvasDOM(
          editorContent.getBoundingClientRect().left -
            scroller.getBoundingClientRect().left,
          canvas,
          resolvedTheme ?? "light",
        ),
      );
    });
  }, [isDrawingMode, resolvedTheme]);

  // When the cmRef component is mounted, get the bounding box of the editor
  // and set it to the state

  function getDrawingLocation(line: DrawnLine): {
    lineStart: number;
    lineEnd: number;
  } {
    const points = line.points;
    const pointsY = points
      .map((point) => point.y)
      .filter((point) => typeof point === "number");

    const minY = Math.min(...pointsY);
    const maxY = Math.max(...pointsY);

    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }

    // Go through each line and column to find the start and end
    const cmView = cmRef.current?.view;
    const cmState = cmRef.current?.state;

    const lineStartBlock = cmView?.lineBlockAtHeight(minY);
    const lineStart = lineStartBlock
      ? (cmState?.doc.lineAt(lineStartBlock.from).number ?? -1)
      : -1;

    const lineEndBlock = cmView?.lineBlockAtHeight(maxY);
    const lineEnd = lineEndBlock
      ? (cmState?.doc.lineAt(lineEndBlock.from).number ?? -1)
      : -1;

    return {
      lineStart: lineStart,
      lineEnd: lineEnd,
    };
  }

  function onContentChange(value: string) {
    setViewDocument((prev) => {
      // Return undefined if viewDocument is not set
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        fileContent: value,
      };
    });
  }

  const onTextExtracted = useCallback((line: DrawnLine, text: string) => {
    // Get location information
    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }
    const location = getDrawingLocation(line);

    const newInfo: SelectionInformation = {
      lineStart: location.lineStart,
      lineEnd: location.lineEnd,
      text,
    };

    setViewDocument((prev) => {
      // Return undefined if viewDocument is not set
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        selections: [...prev.selections, newInfo],
      };
    });
  }, []);

  function getCanvasDOM(
    offsetX: number,
    editorCanvas: HTMLCanvasElement,
    theme: string,
  ) {
    function getCanvas(editorCanvas: HTMLCanvasElement, theme: string) {
      return (
        <div
          className="absolute left-0 top-0"
          style={{
            height: cmRef.current?.view?.contentDOM.offsetHeight,
            width: cmRef.current?.view?.contentDOM.offsetWidth,
          }}
        >
          <CanvasEditor
            onTextExtracted={onTextExtracted}
            isDownloadClip={isDownloadClip ?? false}
            isDrawHulls={isDrawHulls ?? false}
            editorCanvas={editorCanvas}
            theme={theme}
          />
        </div>
      );
    }

    const container = document.createElement("div");
    container.id = "canvas-widget";
    container.style.position = "absolute";
    container.style.left = offsetX + "px";

    const root = createRoot(container);
    const canvas = getCanvas(editorCanvas, theme);
    root.render(canvas);

    return container;
  }

  return (
    <ViewLayout width={width} height={height}>
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-content2">
        {viewDocument?.fileContent ? (
          <ReactCodeMirror
            ref={cmRef}
            value={viewDocument?.fileContent}
            onChange={onContentChange}
            extensions={[javascript({ jsx: true })]}
            theme={theme}
            height="100%"
            style={{
              height: "100%",
            }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <Progress
              isIndeterminate={true}
              className="w-1/2"
              color="default"
              size="md"
              label="Loading..."
              classNames={{
                label: "w-full text-center",
              }}
            />
          </div>
        )}
      </div>
    </ViewLayout>
  );
}
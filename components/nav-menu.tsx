import { Button } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { useFileSystem } from "@/lib/hooks/use-file-system";
import { EditorContext } from "./providers/editor-context-provider";
import { useContext } from "react";
import { ViewTypeEnum } from "@/lib/views/available-views";
import { ViewDocument } from "@/lib/types";
import { View } from "@/lib/views/view";
import { ViewManager } from "@/lib/views/view-manager";
import toast from "react-hot-toast";

function MenuPanel({ children }: { children?: React.ReactNode }) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  return (
    <>
      {isDesktop ? (
        <motion.div
          className="z-30 hidden h-full w-[400px] flex-shrink-0 md:block"
          initial={{
            x: -400,
          }}
          animate={{
            x: 0,
          }}
          exit={{
            x: -400,
          }}
          transition={{
            type: "tween",
          }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          className="absolute z-30 h-full w-full md:hidden"
          initial={{
            y: "-100vh",
          }}
          animate={{
            y: 0,
          }}
          exit={{
            y: "-100vh",
          }}
          transition={{
            type: "tween",
          }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}

export default function NavMenu({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) {
  const {
    projectPath,
    showOpenFileDialog,
    showSaveFileDialog,
    openFile,
    writeFile,
  } = useFileSystem();

  const editorContext = useContext(EditorContext);

  function openDocumentInView(doc: ViewDocument) {
    const view = new View(ViewTypeEnum.Code, doc);
    // Notify state update
    editorContext?.setViewManager((prev) => {
      const newVM = ViewManager.copy(prev);
      newVM?.clearView();
      // Add view to view manager
      newVM?.addView(view);
      // Set the view as active
      newVM?.setActiveView(view);
      return newVM;
    });

    setIsMenuOpen(false);
  }

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <MenuPanel>
          <div className="h-full w-full bg-content2 p-2">
            <div className="flex h-full w-full flex-col items-center space-y-1">
              {!projectPath && (
                <div className="flex w-full flex-wrap justify-center gap-x-1 gap-y-1">
                  <Button className="w-40">New Project</Button>
                  <Button className="w-40" onPress={() => {}}>
                    Open Project
                  </Button>
                  <Button className="w-40">Save Project</Button>
                  <Button
                    className="w-40"
                    onPress={() => {
                      const viewDocument: ViewDocument = {
                        fileContent: "",
                        filePath: "Untitled",
                      };
                      openDocumentInView(viewDocument);
                    }}
                  >
                    New File
                  </Button>
                  <Button
                    className="w-40"
                    onPress={() => {
                      showOpenFileDialog().then((files) => {
                        console.log(files);
                        const firstFile = files[0];
                        firstFile?.text().then((text) => {
                          console.log("File content:\n" + text);
                          const viewDocument: ViewDocument = {
                            fileContent: text,
                            filePath: firstFile.name,
                          };
                          openDocumentInView(viewDocument);
                        });
                      });
                    }}
                  >
                    Open File
                  </Button>
                  <Button
                    className="w-40"
                    onPress={() => {
                      const viewDocument =
                        editorContext?.viewManager?.getActiveView()
                          ?.viewDocument;
                      if (viewDocument) {
                        showSaveFileDialog().then((filePath) => {
                          if (filePath) {
                            writeFile(
                              new File([viewDocument.fileContent], filePath),
                              filePath,
                            ).then(() => {
                              toast.success("File saved successfully");
                            });
                          }
                        });
                      }
                    }}
                  >
                    Save File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </MenuPanel>
      )}
    </AnimatePresence>
  );
}

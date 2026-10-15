import { BookmarkIcon, BookmarkPlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Menu, MenuItem, MenuPopup, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { toastManager } from "@/components/ui/toast";
import type { ThemeController } from "./theme";

export function SaveThemeMenu({
  active,
  saved,
  save,
  deleteSaved,
}: Pick<ThemeController, "active" | "saved" | "save" | "deleteSaved">) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const activeSaved = saved.find((item) => item.id === active?.id);

  const submit = () => {
    const label = name.trim();
    if (!label) return;
    save(label);
    setNaming(false);
    setName("");
    toastManager.add({
      description: "Find it under Saved in the Theme menu.",
      title: `Saved “${label}”`,
      type: "success",
    });
  };

  return (
    <>
      <Menu>
        <MenuTrigger render={<Button aria-label="Saved themes" size="icon-sm" variant="ghost" />}>
          <BookmarkIcon />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuItem onClick={() => setNaming(true)}>
            <BookmarkPlusIcon />
            Save current theme…
          </MenuItem>
          {activeSaved && (
            <>
              <MenuSeparator />
              <MenuItem onClick={() => deleteSaved(activeSaved.id)} variant="destructive">
                <Trash2Icon />
                Delete “{activeSaved.label}”
              </MenuItem>
            </>
          )}
        </MenuPopup>
      </Menu>

      <Dialog onOpenChange={setNaming} open={naming}>
        <DialogPopup className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save theme</DialogTitle>
            <DialogDescription>
              Saves your colours, type, corners, and motion in this browser.
            </DialogDescription>
          </DialogHeader>
          <Form
            className="contents"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <DialogPanel>
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  autoFocus
                  onChange={(event) => setName(event.target.value)}
                  placeholder="My app"
                  type="text"
                  value={name}
                />
              </Field>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <Button disabled={!name.trim()} type="submit">
                Save
              </Button>
            </DialogFooter>
          </Form>
        </DialogPopup>
      </Dialog>
    </>
  );
}

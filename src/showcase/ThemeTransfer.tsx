import { ChevronDownIcon, CopyIcon, UploadIcon } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import { type Theme, type ThemeController, themeOf } from "./theme";
import { exportTheme, importTheme } from "./theme-transfer";

export function ThemeTransfer({
  active,
  apply,
  save,
  settings,
}: Pick<ThemeController, "active" | "apply" | "save" | "settings">) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Theme>();
  const [name, setName] = useState("");
  const [reading, setReading] = useState(false);

  const copy = async (includePrompt: boolean) => {
    try {
      await navigator.clipboard.writeText(exportTheme(themeOf(settings), includePrompt));
      toastManager.add({
        title: includePrompt ? "Theme and prompt copied" : "Theme copied",
        type: "success",
      });
    } catch {
      toastManager.add({
        title: "Could not copy theme",
        description: "Check clipboard access and try again.",
        type: "error",
      });
    }
  };

  const finishImport = (theme: Theme) => {
    apply(theme);
    setOpen(false);
    toastManager.add({ title: "Theme imported", type: "success" });
  };

  const submit = () => {
    try {
      const theme = importTheme(source);
      if (!active) setPending(theme);
      else finishImport(theme);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not import theme.");
    }
  };

  return (
    <>
      <Dialog
        onOpenChange={(value) => {
          setOpen(value);
          if (value) {
            setSource("");
            setError("");
            setPending(undefined);
            setName("");
          }
        }}
        open={open}
      >
        <DialogTrigger render={<Button size="sm" variant="outline" />}>
          <UploadIcon />
          Import theme
        </DialogTrigger>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>{pending ? "Save your current theme?" : "Import theme"}</DialogTitle>
            <DialogDescription>
              {pending
                ? "Your current theme has unsaved changes. Save it before importing, or discard those changes."
                : "Paste a Project UI theme export or choose a file. Importing applies the theme immediately."}
            </DialogDescription>
          </DialogHeader>
          <Form
            className="contents"
            onSubmit={(event) => {
              event.preventDefault();
              if (pending) {
                if (!name.trim()) return;
                save(name.trim());
                finishImport(pending);
              } else submit();
            }}
          >
            <DialogPanel className="grid gap-4">
              {pending ? (
                <Field>
                  <FieldLabel>Current theme name</FieldLabel>
                  <Input
                    autoFocus
                    onChange={(event) => setName(event.target.value)}
                    placeholder="My app"
                    value={name}
                  />
                </Field>
              ) : (
                <>
                  <Field invalid={!!error}>
                    <FieldLabel>Theme export</FieldLabel>
                    <Textarea
                      className="max-h-64 overflow-y-auto"
                      onChange={(event) => {
                        setSource(event.target.value);
                        setError("");
                      }}
                      placeholder="Paste your exported theme here…"
                      value={source}
                    />
                    <FieldError match={!!error}>{error}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel>Or choose a file</FieldLabel>
                    <Input
                      accept=".css,.txt,.json"
                      disabled={reading}
                      type="file"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setReading(true);
                        setError("");
                        try {
                          setSource(await file.text());
                        } catch {
                          setError("Could not read this file. Choose another file or paste the export.");
                        } finally {
                          setReading(false);
                        }
                      }}
                    />
                  </Field>
                </>
              )}
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
              {pending ? (
                <>
                  <Button
                    onClick={() => finishImport(pending)}
                    type="button"
                    variant="destructive-outline"
                  >
                    Discard and import
                  </Button>
                  <Button disabled={!name.trim()} type="submit">Save and import</Button>
                </>
              ) : (
                <Button disabled={!source.trim() || reading} type="submit">Import theme</Button>
              )}
            </DialogFooter>
          </Form>
        </DialogPopup>
      </Dialog>
      <Menu>
        <MenuTrigger render={<Button size="sm" variant="outline" />}>
          <CopyIcon />
          Export
          <ChevronDownIcon />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuItem onClick={() => void copy(false)}>Export theme</MenuItem>
          <MenuItem onClick={() => void copy(true)}>Export theme and prompt</MenuItem>
        </MenuPopup>
      </Menu>
    </>
  );
}

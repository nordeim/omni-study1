"use client";

// ---------------------------------------------------------------------------
// StudyGroupsView (S8-H) — the two-pane group manager: a w-80 left pane with
// the in-pane h1 + 36px gradient New button + search + group rows, and a bare
// right pane holding the centered empty state or the group detail (members
// list + inline add-member form). Members persist through the studyGroup
// schema's members ARRAY (data.ts serializes the row to a JSON string).
// ---------------------------------------------------------------------------

import * as React from "react";
import { Pencil, Plus, Search, Trash2, UserPlus, Users, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { mutations, useDataStore, type StudyGroupRow } from "@/lib/data";
import { EmptyState, initialFor, Spinner, SubjectChip } from "@/components/views/shared";
import { cn } from "@/lib/utils";

// The measured swatch order: violet, blue, emerald, amber, red, pink (S7-B).
const GROUP_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

type Member = { name: string; email: string };

function parseMembers(json: string): Member[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const { name, email } = item as Record<string, unknown>;
      if (typeof name !== "string" || typeof email !== "string") return [];
      return [{ name, email }];
    });
  } catch {
    return [];
  }
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

// ---- create/edit dialog ----------------------------------------------------------

function GroupDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: StudyGroupRow | null;
}) {
  const { toast } = useToast();
  const subjects = useDataStore((s) => s.subjects);
  // State initializes from props per open session (parent key-remount).
  const [name, setName] = React.useState(group?.name ?? "");
  const [color, setColor] = React.useState(group?.color ?? GROUP_COLORS[0]);
  const [subjectId, setSubjectId] = React.useState(group?.subjectId ?? "none");
  const [saving, setSaving] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const members = group ? parseMembers(group.members) : [];
      const payload = {
        name: name.trim(),
        color,
        subjectId: subjectId === "none" ? "" : subjectId,
        members,
      };
      if (group) {
        await mutations.updateStudyGroup(group.id, payload);
        toast.success("Study group updated");
      } else {
        await mutations.createStudyGroup(payload);
        toast.success("Study group created");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the study group."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{group ? "Edit Study Group" : "New Study Group"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(e) => void submit(e)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Calculus cram crew"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="group-subject" aria-label="Subject">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No subject</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex gap-2" aria-label="Group color swatches">
              {GROUP_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Choose color ${hex}`}
                  aria-pressed={color === hex}
                  onClick={() => setColor(hex)}
                  className={cn(
                    "size-7 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                    color === hex && "ring-2 ring-slate-900 ring-offset-2 dark:ring-white",
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner className="size-4" /> : null}
              {group ? "Save changes" : "Create group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- the view ----------------------------------------------------------------------

export function StudyGroupsView() {
  const { toast } = useToast();
  const groups = useDataStore((s) => s.studyGroups);
  const subjects = useDataStore((s) => s.subjects);
  const loading = useDataStore((s) => s.loading);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StudyGroupRow | null>(null);
  const [deleting, setDeleting] = React.useState<StudyGroupRow | null>(null);
  const [memberName, setMemberName] = React.useState("");
  const [memberEmail, setMemberEmail] = React.useState("");
  const [savingMember, setSavingMember] = React.useState(false);

  const selected = groups.find((g) => g.id === selectedId) ?? null;

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const subjectFor = React.useCallback(
    (id: string | null) => {
      const subject = subjects.find((s) => s.id === id);
      return subject ? { name: subject.name, color: subject.color } : null;
    },
    [subjects],
  );

  const addMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    const name = memberName.trim();
    const email = memberEmail.trim();
    if (!name || !email || savingMember) return;
    setSavingMember(true);
    try {
      const members = [...parseMembers(selected.members), { name, email }];
      await mutations.updateStudyGroup(selected.id, { members });
      setMemberName("");
      setMemberEmail("");
      toast.success(`${name} added to ${selected.name}`);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not add the member."));
    } finally {
      setSavingMember(false);
    }
  };

  const removeMember = (member: Member) => {
    if (!selected) return;
    const members = parseMembers(selected.members).filter((m) => m.email !== member.email);
    mutations
      .updateStudyGroup(selected.id, { members })
      .then(() => toast.success(`${member.name} removed`))
      .catch((err: unknown) => toast.error(errorMessage(err, "Could not remove the member.")));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* ---- left pane: groups list ---- */}
      <aside
        aria-label="Study groups pane"
        className="flex w-80 shrink-0 flex-col border-r border-slate-100 pr-6 dark:border-slate-800"
      >
        <div className="flex items-center gap-2">
          <h1 className="flex flex-1 items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
            <Users className="size-6 shrink-0 text-sf-primary" strokeWidth={2} aria-hidden />
            Study Groups
          </h1>
          <button
            type="button"
            aria-label="Create study group"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="sf-gradient sf-gradient-shadow flex size-9 shrink-0 items-center justify-center rounded-xl text-white"
          >
            <Plus className="size-5" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups…"
            aria-label="Search study groups"
            className="pl-9"
          />
        </div>

        <div className="sf-scroll mt-4 flex-1 space-y-2 overflow-y-auto">
          {loading && groups.length === 0 ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-5 text-sf-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm text-slate-500">
              {groups.length === 0 ? "No study groups yet." : "No groups match your search."}
            </p>
          ) : (
            filtered.map((group) => {
              const memberCount = parseMembers(group.members).length;
              const subject = subjectFor(group.subjectId);
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedId(group.id)}
                  aria-pressed={selectedId === group.id}
                  className={cn(
                    "w-full rounded-xl border-2 p-4 text-left transition-colors",
                    selectedId === group.id
                      ? "border-sf-primary/30 bg-slate-50 dark:bg-slate-800/60"
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40",
                  )}
                >
                  <h3 className="font-medium text-slate-800 dark:text-slate-100">{group.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">{memberCount} members</span>
                    <SubjectChip name={subject?.name} color={subject?.color} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ---- right pane: detail ---- */}
      <section className="flex min-w-0 flex-1 flex-col" aria-label="Study group detail pane">
        {!selected ? (
          groups.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={Users}
                title="No study groups"
                hint="Create a group to organize study partners by subject."
              />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-slate-400">
                Choose a study group from the sidebar or create a new one
              </p>
            </div>
          )
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selected.name}</h2>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(selected);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="size-4" strokeWidth={2} /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleting(selected)}>
                  <Trash2 className="size-4" strokeWidth={2} /> Delete
                </Button>
              </div>
            </div>

            <div className="sf-card flex-1 overflow-y-auto p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Members</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {parseMembers(selected.members).map((member) => (
                  <li
                    key={`${member.email}-${member.name}`}
                    className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                  >
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgb(var(--sf-primary-avatar-from)), rgb(var(--sf-primary-avatar-to)))",
                      }}
                    >
                      {initialFor(member.name, member.email)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{member.name}</p>
                      <p className="truncate text-xs text-slate-500">{member.email}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${member.name}`}
                      onClick={() => removeMember(member)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 dark:hover:bg-red-950 group-hover:opacity-100"
                    >
                      <X className="size-4" strokeWidth={2} />
                    </button>
                  </li>
                ))}
                {parseMembers(selected.members).length === 0 && (
                  <li className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800/60">
                    No members yet — add the first study partner below.
                  </li>
                )}
              </ul>

              <form
                className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"
                onSubmit={(e) => void addMember(e)}
              >
                <Label htmlFor="member-name">Add member</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="member-name"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Name"
                    className="flex-1"
                  />
                  <Input
                    id="member-email"
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1"
                    required
                  />
                  <Button type="submit" variant="outline" disabled={savingMember || !memberName.trim()}>
                    <UserPlus className="size-4" strokeWidth={2} /> Add
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      <GroupDialog
        key={dialogOpen ? `open-${editing?.id ?? "new"}` : "closed"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editing}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this study group?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} and its member list will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (!deleting) return;
                const target = deleting;
                setDeleting(null);
                if (selectedId === target.id) setSelectedId(null);
                mutations
                  .deleteStudyGroup(target.id)
                  .catch((err: unknown) =>
                    toast.error(errorMessage(err, "Could not delete the study group.")),
                  );
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

// ---------------------------------------------------------------------------
// SettingsView — the five reference tabs (Appearance / Profile / Subjects /
// Holidays / Notifications) plus the documented supersets on the Profile tab
// (S26 Email address → S24 Change password → S25 Danger zone, additive cards
// BELOW the pinned S17 surfaces). Every write rides /api/settings/preferences
// or the auth-rotation endpoints; the theme store applies + persists locally.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  Monitor,
  Moon,
  Pencil,
  Plus,
  Settings as SettingsIcon,
  Sun,
  Trash2,
} from "lucide-react";

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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { apiGet, apiSend } from "@/lib/api";
import { mutations, useDataStore, type HolidayRow, type SubjectRow } from "@/lib/data";
import { formatLongDate } from "@/lib/date";
import { ACCENTS, ACCENT_TOKENS, AVATAR_EMOJIS, type Accent, type ThemeMode } from "@/lib/theme";
import type { AppUser } from "@/lib/store";
import { useThemeStore } from "@/lib/store";
import { Spinner, ViewHeader } from "@/components/views/shared";
import { UserAvatar } from "@/components/layout/user-avatar";
import { cn } from "@/lib/utils";

const GRADE_LEVELS = [
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
  "College Freshman",
  "College Sophomore",
  "College Junior",
  "College Senior",
  "Graduate",
];

const SUBJECT_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
];

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function isEmailShape(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function patchPreferences(patch: Record<string, unknown>): Promise<void> {
  await apiSend("PATCH", "/api/settings/preferences", patch);
}

function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

function InlineStatus({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
      {message}
    </p>
  );
}

// ---- APPEARANCE -----------------------------------------------------------------

function ThemeCard() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const { toast } = useToast();

  const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const pick = (next: ThemeMode) => {
    setMode(next);
    patchPreferences({ themeMode: next }).catch((err: unknown) =>
      toast.error(errorMessage(err, "Could not save the theme preference.")),
    );
  };

  return (
    <section className="sf-card p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Theme</h3>
      <p className="mt-1 text-sm text-slate-500">Choose how StudyFlow looks on this device.</p>
      <div className="mt-4 flex gap-2">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => pick(value)}
            className={cn(
              "flex h-9 flex-1 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
              mode === value
                ? "sf-selected-tint text-white"
                : "border border-input bg-transparent text-foreground shadow-sm hover:bg-accent",
            )}
          >
            <Icon className="size-4" strokeWidth={2} aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function AccentCard() {
  const accent = useThemeStore((s) => s.accent);
  const setAccent = useThemeStore((s) => s.setAccent);
  const { toast } = useToast();

  const pick = (next: Accent) => {
    setAccent(next);
    patchPreferences({ accentColor: next }).catch((err: unknown) =>
      toast.error(errorMessage(err, "Could not save the accent color.")),
    );
  };

  return (
    <section className="sf-card p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Accent color</h3>
      <p className="mt-1 text-sm text-slate-500">One tap re-themes buttons, chips, and charts.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {ACCENTS.map((a) => (
          <button
            key={a}
            type="button"
            aria-label={`${a.charAt(0).toUpperCase()}${a.slice(1)} accent`}
            aria-pressed={accent === a}
            onClick={() => pick(a)}
            className={cn(
              "size-7 rounded-full transition-shadow",
              accent === a ? "ring-2 ring-sf-primary ring-offset-2 ring-offset-background" : "hover:scale-110",
            )}
            style={{ backgroundColor: `rgb(${ACCENT_TOKENS[a].primary})` }}
          />
        ))}
      </div>
    </section>
  );
}

function AvatarCard() {
  const avatar = useThemeStore((s) => s.avatar);
  const setAvatar = useThemeStore((s) => s.setAvatar);
  const { toast } = useToast();

  const pick = (emoji: string) => {
    setAvatar(emoji);
    patchPreferences({ avatarEmoji: emoji }).catch((err: unknown) =>
      toast.error(errorMessage(err, "Could not save the avatar.")),
    );
  };

  return (
    <section className="sf-card p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Avatar</h3>
      <p className="mt-1 text-sm text-slate-500">Pick an emoji — or keep your initial.</p>
      <div className="mt-4 grid grid-cols-8 gap-2">
        {AVATAR_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Choose avatar ${emoji}`}
            aria-pressed={avatar === emoji}
            onClick={() => pick(emoji)}
            className={cn(
              "flex h-10 items-center justify-center rounded-lg border text-xl transition-colors",
              avatar === emoji
                ? "border-sf-primary bg-sf-primary-soft dark:bg-sf-primary-soft-dark/40"
                : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={() => pick("")}>
          None
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Preview</span>
          <UserAvatar size="lg" />
        </div>
      </div>
    </section>
  );
}

// ---- PROFILE ----------------------------------------------------------------------

function DisplayNameCard({ user }: { user: AppUser | null }) {
  const { toast } = useToast();
  const userName = useThemeStore((s) => s.userName);
  const setUserName = useThemeStore((s) => s.setUserName);
  // State initializes from the hydrated user (parent key-remounts on user
  // arrival — no populate-on-hydrate effect).
  const [value, setValue] = React.useState(userName || user?.fullName || "");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setError(null);
    if (value.trim() === "") {
      setError("Your display name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const trimmed = value.trim();
      await patchPreferences({ displayName: trimmed });
      setUserName(trimmed);
      toast.success("Display name updated");
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not update the display name."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="sf-card p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Display name</h3>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="display-name">Name</Label>
          <Input
            id="display-name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <InlineError message={error} />
        <Button variant="gradient" className="sf-gradient-shadow self-start" onClick={() => void save()} disabled={saving}>
          {saving ? <Spinner className="size-4" /> : null} Save name
        </Button>
      </div>
    </section>
  );
}

function StudyProfileCard({ user, onRefreshed }: { user: AppUser | null; onRefreshed: (u: AppUser) => void }) {
  const { toast } = useToast();
  // State initializes from the hydrated user (parent key-remounts on user
  // arrival — no populate-on-hydrate effect).
  const [school, setSchool] = React.useState(user?.schoolName ?? "");
  const [grade, setGrade] = React.useState<string>(user?.gradeLevel || "none");
  const [goal, setGoal] = React.useState(user && user.studyGoalHours > 0 ? user.studyGoalHours : 4);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const response = await apiSend<{ ok: true; user: AppUser }>("PATCH", "/api/settings/preferences", {
        schoolName: school.trim(),
        gradeLevel: grade === "none" ? undefined : grade,
        studyGoalHours: goal,
      });
      onRefreshed(response.user);
      toast.success("Study profile saved");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the study profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="sf-card p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Study profile</h3>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="school-name">School name</Label>
          <Input
            id="school-name"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="e.g. Northgate High"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grade-level">Grade level</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger id="grade-level" aria-label="Grade level">
              <SelectValue placeholder="Choose a grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not set</SelectItem>
              {GRADE_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="study-goal">Daily study goal</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="study-goal"
              min={1}
              max={12}
              step={1}
              value={[goal]}
              onValueChange={(values) => setGoal(values[0] ?? goal)}
              className="flex-1"
              aria-label="Daily study goal in hours"
            />
            <span className="w-20 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
              {goal} {goal === 1 ? "hour" : "hours"}
            </span>
          </div>
        </div>
        <Button variant="gradient" className="sf-gradient-shadow self-start" onClick={() => void save()} disabled={saving || !user}>
          {saving ? <Spinner className="size-4" /> : null} Save profile
        </Button>
      </div>
    </section>
  );
}

function EmailCard({ user, onEmailChanged }: { user: AppUser | null; onEmailChanged: (u: AppUser) => void }) {
  const { toast } = useToast();
  const setEmail = useThemeStore((s) => s.setEmail);
  const [newEmail, setNewEmail] = React.useState("");
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!newEmail.trim() || !confirmEmail.trim() || !password) {
      setError("Fill in every field to change your email.");
      return;
    }
    if (!isEmailShape(newEmail.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (newEmail.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setError("The email addresses do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const response = await apiSend<{ ok: true; email: string; user: AppUser }>(
        "POST",
        "/api/auth/change-email",
        { password, newEmail: newEmail.trim(), confirmEmail: confirmEmail.trim() },
      );
      setSuccess("Email address updated.");
      setNewEmail("");
      setConfirmEmail("");
      setPassword("");
      setEmail(response.email);
      onEmailChanged(response.user);
      toast.success("Email address updated");
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not change the email address."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="sf-card p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Email address</h3>
      <p className="mt-1 text-sm text-slate-500">
        The address you sign in with. Currently{" "}
        <span className="font-medium text-slate-700 dark:text-slate-200">{user?.email ?? "…"}</span>.
      </p>
      <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => void submit(e)}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-email">New email</Label>
          <Input
            id="new-email"
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-email">Confirm new email</Label>
          <Input
            id="confirm-email"
            type="email"
            autoComplete="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email-password">Current password</Label>
          <Input
            id="email-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <InlineError message={error} />
        <InlineStatus message={success} />
        <Button type="submit" variant="gradient" className="sf-gradient-shadow self-start" disabled={busy}>
          {busy ? <Spinner className="size-4" /> : null} Update email
        </Button>
      </form>
    </section>
  );
}

function PasswordCard() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!current || !next || !confirm) {
      setError("Fill in every field to change your password.");
      return;
    }
    if (next.length < 8) {
      setError("The new password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("The new passwords do not match.");
      return;
    }
    if (next === current) {
      setError("The new password must be different from your current password.");
      return;
    }
    setBusy(true);
    try {
      await apiSend("POST", "/api/auth/change-password", { currentPassword: current, newPassword: next });
      setSuccess("Password updated — your session continues as usual.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not change the password."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="sf-card p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Change password</h3>
      <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => void submit(e)}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="next-password">New password</Label>
          <Input
            id="next-password"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <InlineError message={error} />
        <InlineStatus message={success} />
        <Button type="submit" variant="gradient" className="sf-gradient-shadow self-start" disabled={busy}>
          {busy ? <Spinner className="size-4" /> : null} Update password
        </Button>
      </form>
    </section>
  );
}

function DangerZoneCard() {
  const clearThemeCache = useThemeStore((s) => s.clearThemeCache);
  const [revealed, setRevealed] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (confirmation !== "DELETE") {
      setError("Type DELETE to confirm.");
      return;
    }
    setBusy(true);
    try {
      await apiSend("POST", "/api/auth/delete-account", { password, confirmation });
      // The redirect IS the feedback — no success note (S25).
      clearThemeCache();
      window.location.replace("/login");
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not delete the account."));
      setBusy(false);
    }
  };

  return (
    <section className="sf-card border-red-200 p-6 dark:border-red-900">
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger zone</h3>
      <p className="mt-1 text-sm text-slate-500">
        Permanently delete your account and every study record in it. Consider downloading a backup
        from the export page first.
      </p>
      {!revealed ? (
        <Button variant="destructive" className="mt-4 self-start" onClick={() => setRevealed(true)}>
          Delete account…
        </Button>
      ) : (
        <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => void submit(e)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-password">Password</Label>
            <Input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-confirmation">Type DELETE to confirm</Label>
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Type DELETE"
            />
          </div>
          <InlineError message={error} />
          <div className="flex items-center gap-2">
            <Button type="submit" variant="destructive" disabled={busy}>
              {busy ? <Spinner className="size-4" /> : null} Permanently delete my account
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRevealed(false);
                setPassword("");
                setConfirmation("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

// ---- SUBJECTS -----------------------------------------------------------------------

function SubjectDialog({
  open,
  onOpenChange,
  subject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: SubjectRow | null;
}) {
  const { toast } = useToast();
  // State initializes from props per open session (parent key-remount).
  const [name, setName] = React.useState(subject?.name ?? "");
  const [color, setColor] = React.useState(subject?.color ?? SUBJECT_COLORS[0]);
  const [saving, setSaving] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      if (subject) {
        await mutations.updateSubject(subject.id, { name: name.trim(), color });
        toast.success("Subject updated");
      } else {
        await mutations.createSubject({ name: name.trim(), color });
        toast.success("Subject created");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the subject."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subject ? "Edit Subject" : "Add Subject"}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(e) => void submit(e)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject-name">Name</Label>
            <Input
              id="subject-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Biology"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap items-center gap-2">
              {SUBJECT_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Color ${hex}`}
                  aria-pressed={color === hex}
                  onClick={() => setColor(hex)}
                  className={cn(
                    "size-7 rounded-full",
                    color === hex ? "ring-2 ring-sf-primary ring-offset-2 ring-offset-background" : "",
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
              <label className="flex items-center gap-2 text-sm text-slate-500">
                Custom
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="Custom subject color"
                  className="h-7 w-9 cursor-pointer rounded border border-input bg-transparent"
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner className="size-4" /> : null}
              {subject ? "Save changes" : "Add Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubjectsTab() {
  const { toast } = useToast();
  const subjects = useDataStore((s) => s.subjects);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SubjectRow | null>(null);
  const [deleting, setDeleting] = React.useState<SubjectRow | null>(null);

  return (
    <section className="sf-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Subjects</h3>
        <Button
          variant="gradient"
          size="sm"
          className="sf-gradient-shadow"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" strokeWidth={2} /> Add Subject
        </Button>
      </div>
      {subjects.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No subjects yet — add one to color-code your schedule.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {subjects.map((subject) => (
            <li
              key={subject.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
            >
              <span aria-hidden className="size-3 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{subject.name}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Edit ${subject.name}`}
                  onClick={() => {
                    setEditing(subject);
                    setDialogOpen(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-sf-primary dark:hover:bg-slate-800"
                >
                  <Pencil className="size-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${subject.name}`}
                  onClick={() => setDeleting(subject)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <Trash2 className="size-4" strokeWidth={2} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SubjectDialog
        key={dialogOpen ? `open-${editing?.id ?? "new"}` : "closed"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={editing}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this subject?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} will be removed and every task, exam, and note in it becomes
              unassigned. This cannot be undone.
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
                mutations
                  .deleteSubject(target.id)
                  .catch((err: unknown) => toast.error(errorMessage(err, "Could not delete the subject.")));
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

// ---- HOLIDAYS -------------------------------------------------------------------------

function HolidayDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Plain initializers — the parent key-remounts per open session, so the
  // form always starts empty without a reset-on-close effect.

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !date || saving) return;
    setSaving(true);
    try {
      await mutations.createHoliday({ name: name.trim(), date: new Date(`${date}T12:00:00`).toISOString() });
      toast.success("Holiday added");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not add the holiday."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Holiday</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={(e) => void submit(e)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="holiday-name">Name</Label>
            <Input
              id="holiday-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spring break"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="holiday-date">Date</Label>
            <Input
              id="holiday-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner className="size-4" /> : null} Add Holiday
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function HolidaysTab() {
  const { toast } = useToast();
  const holidays = useDataStore((s) => s.holidays);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const sorted = [...holidays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const remove = (holiday: HolidayRow) => {
    mutations
      .deleteHoliday(holiday.id)
      .then(() => toast.success("Holiday removed"))
      .catch((err: unknown) => toast.error(errorMessage(err, "Could not delete the holiday.")));
  };

  return (
    <section className="sf-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Holidays</h3>
        <Button variant="gradient" size="sm" className="sf-gradient-shadow" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" strokeWidth={2} /> Add Holiday
        </Button>
      </div>
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No holidays yet — add breaks so your plan stays realistic.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {sorted.map((holiday) => (
            <li
              key={holiday.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
            >
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">{holiday.name}</p>
                <p className="text-xs text-slate-500">{formatLongDate(new Date(holiday.date))}</p>
              </div>
              <button
                type="button"
                aria-label={`Delete ${holiday.name}`}
                onClick={() => remove(holiday)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <Trash2 className="size-4" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <HolidayDialog
        key={dialogOpen ? "open" : "closed"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}

// ---- NOTIFICATIONS ---------------------------------------------------------------------

function NotificationsTab({ user, onRefreshed }: { user: AppUser | null; onRefreshed: (u: AppUser) => void }) {
  const { toast } = useToast();
  const enabled = user?.notificationsEnabled ?? false;

  const toggle = (checked: boolean) => {
    apiSend<{ ok: true; user: AppUser }>("PATCH", "/api/settings/preferences", { notificationsEnabled: checked })
      .then((response) => {
        onRefreshed(response.user);
        toast.success(checked ? "Notifications enabled" : "Notifications muted");
      })
      .catch((err: unknown) => toast.error(errorMessage(err, "Could not update notifications.")));
  };

  return (
    <section className="sf-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Enable notifications</h3>
          <p className="mt-1 text-sm text-slate-500">
            Reminders for tasks, exams, and study sessions.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={toggle} aria-label="Enable notifications" />
      </div>
      <p className="mt-6 text-sm text-slate-400 dark:text-slate-500">
        More notification settings arrive with the mobile companion.
      </p>
    </section>
  );
}

// ---- the view ----------------------------------------------------------------------

export function SettingsView() {
  const [user, setUser] = React.useState<AppUser | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    apiGet<{ user: AppUser }>("/api/auth/me")
      .then((response) => {
        if (!cancelled) setUser(response.user);
      })
      .catch(() => {
        // the shell's auth gate owns redirecting anonymous visitors
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader title="Settings" subtitle="Personalize your study companion" icon={SettingsIcon} />

      <Tabs defaultValue="appearance">
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" aria-label="Appearance" className="mt-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <ThemeCard />
            <AccentCard />
            <AvatarCard />
          </div>
        </TabsContent>

        <TabsContent value="profile" aria-label="Profile" className="mt-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <section className="sf-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Account</h3>
              <p className="mt-2 text-sm text-slate-500">
                {user ? (
                  <>
                    {user.email} · Member since {formatLongDate(new Date(user.createdAt))}
                  </>
                ) : (
                  "Loading your account…"
                )}
              </p>
            </section>
            <DisplayNameCard key={user ? `dn-${user.id}` : "dn-loading"} user={user} />
            <StudyProfileCard key={user ? `sp-${user.id}` : "sp-loading"} user={user} onRefreshed={setUser} />
            <EmailCard user={user} onEmailChanged={setUser} />
            <PasswordCard />
            <DangerZoneCard />
          </div>
        </TabsContent>

        <TabsContent value="subjects" aria-label="Subjects" className="mt-6">
          <div className="mx-auto max-w-2xl">
            <SubjectsTab />
          </div>
        </TabsContent>

        <TabsContent value="holidays" aria-label="Holidays" className="mt-6">
          <div className="mx-auto max-w-2xl">
            <HolidaysTab />
          </div>
        </TabsContent>

        <TabsContent value="notifications" aria-label="Notifications" className="mt-6">
          <div className="mx-auto max-w-2xl">
            <NotificationsTab user={user} onRefreshed={setUser} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

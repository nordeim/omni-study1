"use client";

// ---------------------------------------------------------------------------
// Flashcards (S7-A + S77/AD + S79/AF1): TWO-PANEL — a w-80 deck sidebar
// (colored 40px icon blocks, inline search) and a detail pane (AI Generate
// outline, Add Card + Study gradients, lg:grid-cols-3 card grid with
// difficulty pills). Session-79 Batch AF (measured): the study mode is a
// FULL VIEW REPLACEMENT — when `studying && studyCard && studyDeckId ===
// effectiveDeckId` the study pane replaces the WHOLE layout (the ref's
// measured shape at both viewports: the black Exit Study button, the
// "N / M" counter, the max-w-2xl card (24px/500 front, 20px/400 slate-700
// back), the "Click card to flip" hint, and the Wrong/Correct rating
// mechanic — the rating IS the navigation; the 3D flip animation is a kept
// superset flourish). Below md the deck rows carry an in-row Study
// affordance (one tap to study at 390). S80/AG9: the wrapper is a labeled
// region (role="region" — the aria-label is valid on it and the study
// surface is a navigable landmark).
// DECK_COLORS: red BEFORE pink.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  Ellipsis,
  GraduationCap,
  Layers,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EmptyState, Spinner } from "@/components/views/shared";
import {
  mutations,
  useDataStore,
  type FlashcardDeckRow,
  type FlashcardInput,
  type FlashcardRow,
} from "@/lib/data";
import { apiSend, ApiError, isTimeoutError } from "@/lib/api";
import { cn } from "@/lib/utils";

const DECK_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

type DeckDialog = { open: boolean; editing: FlashcardDeckRow | null };
type CardDialog = { open: boolean; editing: FlashcardRow | null };

export function FlashcardsView() {
  const decks = useDataStore((s) => s.flashcardDecks);
  const flashcards = useDataStore((s) => s.flashcards);
  const subjects = useDataStore((s) => s.subjects);
  const createFlashcardDeck = mutations.createFlashcardDeck;
  const updateFlashcardDeck = mutations.updateFlashcardDeck;
  const deleteFlashcardDeck = mutations.deleteFlashcardDeck;
  const createFlashcard = mutations.createFlashcard;
  const updateFlashcard = mutations.updateFlashcard;
  const deleteFlashcard = mutations.deleteFlashcard;
  const { toast } = useToast();

  const [selectedDeckId, setSelectedDeckId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [deckDialog, setDeckDialog] = React.useState<DeckDialog>({ open: false, editing: null });
  const [deckForm, setDeckForm] = React.useState({ name: "", description: "", color: DECK_COLORS[0], subjectId: "" });
  const [cardDialog, setCardDialog] = React.useState<CardDialog>({ open: false, editing: null });
  const [cardForm, setCardForm] = React.useState({ front: "", back: "", difficulty: "medium" });
  const [studying, setStudying] = React.useState(false);
  const [studyDeckId, setStudyDeckId] = React.useState<string | null>(null);
  const [studyIndex, setStudyIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const filteredDecks = React.useMemo(
    () =>
      decks.filter((d) => !query.trim() || d.name.toLowerCase().includes(query.toLowerCase())),
    [decks, query],
  );

  // Render-derived selection: a missing/stale id falls back to the first
  // deck — no auto-select effect (the set-state-in-effect lint contract).
  const effectiveDeckId =
    selectedDeckId && decks.some((d) => d.id === selectedDeckId)
      ? selectedDeckId
      : (decks[0]?.id ?? null);
  const selectedDeck = decks.find((d) => d.id === effectiveDeckId) ?? null;
  const deckCards = React.useMemo(
    () => flashcards.filter((c) => c.deckId === effectiveDeckId),
    [flashcards, effectiveDeckId],
  );

  // S79/AF1 (measured on the reference at BOTH viewports): entering study
  // REPLACES the whole two-pane layout — the ref's innerText during study
  // is exactly "Exit Study N / M [card] Click card to flip" (no h1, no deck
  // list, no search), so a deck click can never happen mid-study on the
  // ref's UI. The s78 switchDeck reset survives as the selectDeck contract
  // (every deck selection lands in deck-detail from card 1), and the
  // studyDeckId guard exits the study render when the deck under study no
  // longer matches the effective selection (e.g. it was deleted externally
  // — the s78 audit's F3 latch, killed structurally).
  const selectDeck = (id: string) => {
    setSelectedDeckId(id);
    setStudying(false);
    setStudyDeckId(null);
    setStudyIndex(0);
    setFlipped(false);
  };

  const openDeckDialog = (editing: FlashcardDeckRow | null) => {
    setDeckForm(
      editing
        ? { name: editing.name, description: editing.description, color: editing.color, subjectId: editing.subjectId ?? "" }
        : { name: "", description: "", color: DECK_COLORS[0], subjectId: "" },
    );
    setError("");
    setDeckDialog({ open: true, editing });
  };

  const openCardDialog = (editing: FlashcardRow | null) => {
    setCardForm(
      editing
        ? { front: editing.front, back: editing.back, difficulty: editing.difficulty }
        : { front: "", back: "", difficulty: "medium" },
    );
    setError("");
    setCardDialog({ open: true, editing });
  };

  const submitDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (deckDialog.editing) {
        await updateFlashcardDeck(deckDialog.editing.id, deckForm);
        toast.success("Deck updated.");
      } else {
        await createFlashcardDeck(deckForm);
        toast.success("Deck created.");
      }
      setDeckDialog({ open: false, editing: null });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const submitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !selectedDeckId) return;
    setBusy(true);
    setError("");
    const payload = {
      front: cardForm.front,
      back: cardForm.back,
      difficulty: cardForm.difficulty as FlashcardInput["difficulty"],
    };
    try {
      if (cardDialog.editing) {
        await updateFlashcard(cardDialog.editing.id, payload);
        toast.success("Card updated.");
      } else {
        await createFlashcard(selectedDeckId, payload);
        toast.success("Card added.");
      }
      setCardDialog({ open: false, editing: null });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const removeDeck = async (deck: FlashcardDeckRow) => {
    try {
      await deleteFlashcardDeck(deck.id);
      toast.success("Deck deleted — its cards went with it.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  const removeCard = async (id: string) => {
    try {
      await deleteFlashcard(id);
      toast.success("Card deleted.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  const generateCards = async () => {
    if (!selectedDeckId || generating) return;
    setGenerating(true);
    try {
      await apiSend(
        "POST",
        "/api/ai/generate-cards",
        { deckId: selectedDeckId, topic: selectedDeck?.name },
        { timeoutMs: 120_000 },
      );
      await useDataStore.getState().loadCollections(["flashcards"]);
      toast.success("AI drafted new cards for this deck.");
    } catch (err: unknown) {
      toast.error(
        isTimeoutError(err)
          ? "The assistant took too long to respond. Please try again."
          : err instanceof ApiError
            ? err.message
            : "Generation failed.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const startStudy = (deckId?: string) => {
    // S79/AF1: the study session binds to the deck it started from — the
    // render guard (below) exits the study layout when that deck is no
    // longer the effective selection. The optional id serves the mobile
    // in-row affordance (the deck row's Study button selects + studies
    // in one tap — effectiveDeckId is still the OLD deck in this tick).
    const id = deckId ?? effectiveDeckId;
    setStudyDeckId(id);
    setStudyIndex(0);
    setFlipped(false);
    setStudying(true);
  };

  // S77/AD11 (measured): the rating IS the navigation — Correct marks the
  // card mastered (the existing column) and advances; Wrong advances
  // without mastering; the last card STAYS displayed (the ref has no
  // completion screen — measured headings:[] on its final state).
  const rate = (correct: boolean) => {
    if (!studyCard) return;
    if (correct) {
      updateFlashcard(studyCard.id, { mastered: true }).catch(() => {});
    }
    setFlipped(false);
    setStudyIndex((i) => Math.min(i + 1, Math.max(0, deckCards.length - 1)));
  };

  const studyCard = deckCards[studyIndex];

  // S88/AO4 — the study-zombie structural kill (the s80 audit's deferred
  // L1, closed WITHOUT the forbidden effect): the React-documented
  // render-phase state adjustment — setState during render of THIS
  // component, guarded to terminate (the next render's `studying` is false,
  // so the condition never re-fires; an inline ESLint probe verified the
  // repo's gate accepts the pattern). When the deck under study is no
  // longer the effective selection (external deck deletion — the s78 F3
  // latch) or its cards are ALL gone (external emptying — the s80 zombie:
  // the render guard below falls through silently but `studying` stayed
  // latched, and a later refill auto-resurrected study mode the user never
  // re-entered), the session is OVER: unlatch it NOW, at render, so no
  // future refresh can resurrect it. The two-pane render itself is
  // byte-identical pre/post-fix — the guard already fell through.
  if (studying && studyDeckId !== null && (studyDeckId !== effectiveDeckId || deckCards.length === 0)) {
    setStudying(false);
    setStudyDeckId(null);
    setStudyIndex(0);
    setFlipped(false);
  }

  // ---------------------------------------------------------------------
  // S79/AF1 (measured on the reference at BOTH viewports): the study mode
  // is a FULL VIEW REPLACEMENT — entering study swaps out the ENTIRE
  // two-pane layout (the ref's desktop innerText during study is exactly
  // "Exit Study N / M [card] Click card to flip": no h1, no deck list, no
  // search; the study column `w-full max-w-2xl` centers in the content
  // area with Exit at x=434 @1280; the Exit button + counter share one
  // `flex items-center justify-between` row, counter right-aligned). At
  // 390×844 the study pane renders FULL WIDTH (Exit x=16, scrollWidth
  // 390) — mobile study is clean and usable on the reference. The s77
  // in-right-pane layout squeezed the study chrome into a ~46px pane at
  // mobile (the Study entry button itself clipped at x=360..432 — a tap
  // silently missed) and kept the deck list beside the pane at ≥md.
  // The studyDeckId guard also exits this render when the deck under
  // study no longer matches the effective selection (external deletion —
  // the s78 audit's F3 latch, killed structurally).
  // ---------------------------------------------------------------------
  if (studying && studyCard && studyDeckId === effectiveDeckId) {
    return (
      <div
        role="region"
        aria-label="Study mode"
        className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4"
      >
        <div className="flex w-full max-w-2xl flex-col items-center gap-6">
          {/* S79/AF1 (measured): the Exit button + counter share ONE
              justify-between row — Exit anchors the column's left edge,
              the counter rides the right (the ref measured Exit x=434,
              counter x=1070 on 1280; y-aligned). */}
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => setStudying(false)}
              className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-neutral-50 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none dark:bg-neutral-800"
            >
              Exit Study
            </button>
            <p className="text-base font-normal text-slate-500 dark:text-slate-400">
              {studyIndex + 1} / {deckCards.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Show question" : "Reveal answer"}
            className="h-80 w-full max-w-2xl [perspective:1000px] outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40"
          >
            <div
              data-flip-card
              className="relative size-full [transform-style:preserve-3d] transition-transform duration-500"
              style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              <div
                data-flip-front
                className="sf-print-exact absolute inset-0 flex items-center justify-center rounded-2xl p-8 [backface-visibility:hidden]"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
                }}
              >
                {/* S77/AD10 (measured): 24px/500 white front text. */}
                <p className="text-center text-2xl font-medium text-white">
                  {studyCard.front}
                </p>
              </div>
              <div
                data-flip-back
                className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-violet-200 bg-white p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-violet-800 dark:bg-slate-900"
              >
                {/* S77/AD10 (measured): 20px/400 slate-700 back text. */}
                <p className="text-center text-xl font-normal text-slate-700 dark:text-slate-100">
                  {studyCard.back}
                </p>
              </div>
            </div>
          </button>
          {/* S77/AD9 (measured): the hint, 16px slate-400. */}
          <p className="text-base font-normal text-slate-400 dark:text-slate-500">
            Click card to flip
          </p>
          {/* S77/AD11 (measured): the rating pair appears only after the
              flip — Wrong (neutral-950 + red-600 text) and Correct
              (green-500). Correct text stays WHITE (the ref's yellow
              quirk); both advance. */}
          {flipped && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => rate(false)}
                className="h-10 rounded-md bg-neutral-950 px-8 text-sm font-medium text-red-600 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none dark:bg-neutral-800 dark:text-red-400"
              >
                Wrong
              </button>
              <button
                type="button"
                onClick={() => rate(true)}
                className="h-10 rounded-md bg-green-500 px-8 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-green-600/40 focus-visible:outline-none"
              >
                Correct
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Deck sidebar — S78/AE6: visible at ALL widths (measured on the ref
          at 390×844: the deck list renders beside a squeezed detail pane);
          the aria-label matches the Notes pane convention. shrink-0 (the
          s78 shape): the w-80 list stays fixed-width — the ref's own
          shrunk-aside state is inseparable from its 451/836px overflow bug,
          so the clone keeps the contained squeeze + solves the mobile study
          ENTRY with the in-row affordance instead. */}
      <aside
        aria-label="Deck list pane"
        className="flex w-80 shrink-0 flex-col border-r border-slate-100 pr-6 dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <h1 className="flex flex-1 items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
            <Layers className="size-6 text-sf-primary" strokeWidth={2} />
            Flashcards
          </h1>
          <button
            type="button"
            aria-label="New Deck"
            onClick={() => openDeckDialog(null)}
            className="sf-gradient sf-gradient-shadow flex size-9 items-center justify-center rounded-xl text-white outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40"
          >
            <Plus className="size-4" strokeWidth={2} />
          </button>
        </div>
        <div className="relative mt-4">
          <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <Input
            aria-label="Search decks"
            placeholder="Search decks…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="sf-scroll mt-3 flex-1 space-y-2 overflow-y-auto" aria-label="Deck rows">
          {filteredDecks.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              {decks.length === 0 ? "No decks yet." : "No decks match."}
            </p>
          ) : (
            filteredDecks.map((deck) => {
              const count = flashcards.filter((c) => c.deckId === deck.id).length;
              return (
                <div
                  key={deck.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectDeck(deck.id)}
                  onKeyDown={(e) => {
                    // S81/AH6 (the departed-settlement cycle): the row's
                    // keyboard path must never speak for its INNER
                    // controls — Enter/Space on the options trigger (the
                    // dropdown) bubbled here and selected the deck while
                    // the menu opened. Only keydowns that ORIGINATE on the
                    // row itself (e.target === e.currentTarget) select.
                    if (e.target !== e.currentTarget) return;
                    if (e.key === "Enter" || e.key === " ") selectDeck(deck.id);
                  }}
                  className={cn(
                    "group flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                    selectedDeckId === deck.id
                      ? "border-sf-primary/30 bg-slate-50 dark:bg-slate-800"
                      : "border-transparent bg-slate-50 hover:border-slate-200 dark:bg-slate-800/50 dark:hover:border-slate-700",
                  )}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: deck.color, printColorAdjust: "exact" }}
                  >
                    <Layers className="size-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {deck.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {count} {count === 1 ? "card" : "cards"}
                    </p>
                  </span>
                  {/* S79/AF1 (the mobile study entry): below md the squeezed
                      detail pane (~46px — the s78/AE6 contained shape, the
                      ref's own mobile detail overflows to 451/836 and is
                      reachable only by panning) puts the deck-detail
                      toolbar's Study button outside the viewport. The
                      in-row affordance keeps the study entry ONE TAP away
                      at 390 — and study itself renders full-width (the
                      ref's measured mobile study shape). Desktop never
                      sees it (md:hidden) — byte-identical. */}
                  {count > 0 && (
                    <button
                      type="button"
                      aria-label={`Study ${deck.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectDeck(deck.id);
                        startStudy(deck.id);
                      }}
                      // S80/AG8 (the s80 audit, L5): Enter/Space on this
                      // button fires keydown BEFORE the click activation,
                      // and the bubbled keydown reached the row's own
                      // onKeyDown (selectDeck) — the double-activation is
                      // currently benign (same deck, idempotent order), but
                      // the structural fix keeps the row's keyboard path
                      // from ever speaking for its inner controls.
                      onKeyDown={(e) => e.stopPropagation()}
                      className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-neutral-950 px-3 text-xs font-medium text-neutral-50 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sf-primary/40 focus-visible:outline-none md:hidden dark:bg-neutral-800"
                    >
                      <GraduationCap className="size-4" strokeWidth={2} />
                      Study
                    </button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Deck options for ${deck.name}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 outline-none transition-opacity hover:bg-slate-100 hover:text-slate-600 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sf-primary/40 group-hover:opacity-100 dark:hover:bg-slate-700"
                      >
                        <Ellipsis className="size-4" strokeWidth={2} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeckDialog(deck);
                        }}
                      >
                        <Pencil className="size-4" strokeWidth={2} /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 dark:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDeck(deck);
                        }}
                      >
                        <Trash2 className="size-4" strokeWidth={2} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Detail pane */}
      {/* Detail pane — min-w-0 (S79/AF7, the s78/AE6 contract restored):
          the ref's own mobile Flashcards deck-detail overflows massively at
          390 (its aside floor 299px + its right pane 112px → scrollWidth
          451 empty / 836 with a card — its own bug family, the panning
          state), so the clone keeps the squeezed-but-contained shape
          (aside w-80 + this pane at the leftover ~46px, scrollWidth ≤ 390)
          — the SAME documented parity decision the Notes view made in
          s78. The mobile STUDY ENTRY is solved by the in-row affordance
          (below): the deck-detail toolbar itself is desktop-first, like
          the Notes editor chrome. */}
      <div className="sf-scroll flex min-w-0 flex-1 flex-col overflow-y-auto" aria-label="Deck detail">
        {decks.length === 0 ? (
          <div className="sf-card flex flex-1 flex-col justify-center">
            <EmptyState
              icon={Layers}
              title="No decks yet"
              hint="Create your first flashcard deck"
              cta={
                <Button type="button" variant="gradient" className="sf-gradient-shadow-lg" onClick={() => openDeckDialog(null)}>
                  <Plus className="size-4" strokeWidth={2} />
                  New Deck
                </Button>
              }
            />
          </div>
        ) : !selectedDeck ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-400">Select a deck.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {selectedDeck.name}
                </h2>
                {selectedDeck.description && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {selectedDeck.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" className="h-9" onClick={generateCards} disabled={generating}>
                  {generating ? <Spinner className="size-4" /> : <Sparkles className="size-4" strokeWidth={2} />}
                  AI Generate
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  className="sf-gradient-shadow h-9"
                  onClick={() => openCardDialog(null)}
                >
                  <Plus className="size-4" strokeWidth={2} />
                  Add Card
                </Button>
                {deckCards.length > 0 && (
                  <Button type="button" variant="gradient" className="sf-gradient-shadow h-9" onClick={() => startStudy()}>
                    Study
                  </Button>
                )}
                <DropdownDeleteDeck onDelete={() => removeDeck(selectedDeck)} onEdit={() => openDeckDialog(selectedDeck)} />
              </div>
            </div>

            {deckCards.length === 0 ? (
              <div className="sf-card mt-4 flex flex-1 flex-col justify-center">
                <EmptyState
                  icon={Layers}
                  title="No cards in this deck"
                  hint="Add cards manually or let the AI draft them for you."
                  cta={
                    <Button type="button" variant="gradient" className="sf-gradient-shadow-lg" onClick={() => openCardDialog(null)}>
                      <Plus className="size-4" strokeWidth={2} />
                      Add Card
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Card grid">
                {deckCards.map((card) => (
                  <article
                    key={card.id}
                    className="group rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-card"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium capitalize text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                        {card.difficulty}
                      </span>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        <button
                          type="button"
                          aria-label="Edit card"
                          onClick={() => openCardDialog(card)}
                          className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        >
                          <Pencil className="size-3.5" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete card"
                          onClick={() => removeCard(card.id)}
                          className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                        >
                          <Trash2 className="size-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-3 font-medium text-slate-800 dark:text-slate-100">
                      {card.front}
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                      {card.back}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Deck dialog */}
      <Dialog open={deckDialog.open} onOpenChange={(open) => !open && setDeckDialog({ open: false, editing: null })}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{deckDialog.editing ? "Edit Deck" : "New Deck"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitDeck} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deck-name">Deck Name</Label>
              <Input
                id="deck-name"
                value={deckForm.name}
                onChange={(e) => setDeckForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Biology Chapter 5"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deck-description">Description (optional)</Label>
              <Input
                id="deck-description"
                value={deckForm.description}
                onChange={(e) => setDeckForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Cell energy and enzymes"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Color</Label>
              <div className="flex gap-2" aria-label="Deck color swatches">
                {DECK_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    aria-label={`Choose color ${hex}`}
                    aria-pressed={deckForm.color === hex}
                    onClick={() => setDeckForm((f) => ({ ...f, color: hex }))}
                    className={cn(
                      "size-7 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40",
                      deckForm.color === hex && "ring-2 ring-slate-900 ring-offset-2 dark:ring-white",
                    )}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deck-subject">Subject (optional)</Label>
              <Select
                value={deckForm.subjectId || "none"}
                onValueChange={(v) => setDeckForm((f) => ({ ...f, subjectId: v === "none" ? "" : v }))}
              >
                <SelectTrigger id="deck-subject" className="h-9">
                  <SelectValue placeholder="No subject" />
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
            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button type="submit" variant="gradient" className="sf-gradient-shadow" disabled={busy}>
                {deckDialog.editing ? "Save changes" : "Create deck"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Card dialog */}
      <Dialog open={cardDialog.open} onOpenChange={(open) => !open && setCardDialog({ open: false, editing: null })}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{cardDialog.editing ? "Edit Card" : "Add Card"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCard} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-front">Front (question)</Label>
              <textarea
                id="card-front"
                value={cardForm.front}
                onChange={(e) => setCardForm((f) => ({ ...f, front: e.target.value }))}
                placeholder="What does ATP stand for?"
                required
                className="min-h-20 rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:border-slate-700"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-back">Back (answer)</Label>
              <textarea
                id="card-back"
                value={cardForm.back}
                onChange={(e) => setCardForm((f) => ({ ...f, back: e.target.value }))}
                placeholder="Adenosine triphosphate"
                required
                className="min-h-20 rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:border-slate-700"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="card-difficulty">Difficulty</Label>
              <Select
                value={cardForm.difficulty}
                onValueChange={(v) => setCardForm((f) => ({ ...f, difficulty: v }))}
              >
                <SelectTrigger id="card-difficulty" className="h-9 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button type="submit" variant="gradient" className="sf-gradient-shadow" disabled={busy}>
                {cardDialog.editing ? "Save changes" : "Add card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DropdownDeleteDeck({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <span className="flex gap-1">
      <button
        type="button"
        aria-label="Edit deck"
        onClick={onEdit}
        className="flex size-9 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:hover:bg-slate-800"
      >
        <Pencil className="size-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Delete deck"
        onClick={onDelete}
        className="flex size-9 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-red-50 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-sf-primary/40 dark:hover:bg-red-950"
      >
        <Trash2 className="size-4" strokeWidth={2} />
      </button>
    </span>
  );
}

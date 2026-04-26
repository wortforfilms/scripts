"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { createScriptProofAction } from "../../app/admin/scripts/proof/actions";

const initialState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-55"
    >
      <Save className="h-4 w-4" aria-hidden="true" />
      {pending ? "Saving..." : "Save draft proof"}
    </button>
  );
}

export function ScriptProofForm() {
  const [state, formAction] = useActionState(createScriptProofAction, initialState);
  const inputClass = "rounded border border-white/15 bg-black/25 px-3 py-2 text-sm text-white outline-none";

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-white/10 bg-white/5 p-5">
      <div>
        <h2 className="text-xl font-semibold">Add script proof draft</h2>
        <p className="mt-1 text-sm text-white/60">Drafts stay internal. VERIFIED status is not available from this form.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm text-white/70">
          Script name
          <input name="name" required className={inputClass} placeholder="Example: New Research Script" />
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Slug
          <input name="slug" required className={inputClass} placeholder="new-research-script" pattern="[a-z0-9-]+" />
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Native name
          <input name="nativeName" required className={inputClass} placeholder="Use verified text or descriptive name" />
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Fallback glyph asset
          <input name="fallbackGlyphAsset" required className={inputClass} placeholder="/glyph-placeholders/verification-required.svg" />
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Direction
          <select name="direction" className={inputClass} defaultValue="LTR">
            <option value="LTR">LTR</option>
            <option value="RTL">RTL</option>
            <option value="TTB">TTB</option>
            <option value="BTT">BTT</option>
            <option value="MIXED">MIXED</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          System type
          <select name="systemType" className={inputClass} defaultValue="UNICODE_SCRIPT">
            <option value="UNICODE_SCRIPT">UNICODE_SCRIPT</option>
            <option value="SPECIAL">SPECIAL</option>
            <option value="MANUSCRIPT_CHAIN">MANUSCRIPT_CHAIN</option>
            <option value="TRANSMISSION">TRANSMISSION</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Verification status
          <select name="verificationStatus" className={inputClass} defaultValue="UNVERIFIED">
            <option value="UNVERIFIED">UNVERIFIED</option>
            <option value="PARTIAL">PARTIAL</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm text-white/70">
          Proof URL
          <input name="proofUrl" className={inputClass} placeholder="https://archive.example/source" />
        </label>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75">
        <input type="checkbox" name="unicodeSupported" className="h-4 w-4 accent-amber-300" />
        Unicode supported
      </label>

      <label className="grid gap-1 text-sm text-white/70">
        Unicode ranges
        <textarea name="unicodeRanges" className={`${inputClass} min-h-20`} placeholder="U+10A00-U+10A5F" />
      </label>
      <label className="grid gap-1 text-sm text-white/70">
        Sources
        <textarea name="sources" required className={`${inputClass} min-h-24`} placeholder="One source per line. Required." />
      </label>
      <label className="grid gap-1 text-sm text-white/70">
        Evidence note
        <textarea name="evidenceNote" required className={`${inputClass} min-h-24`} placeholder="What is known, what is uncertain, and what needs verification?" />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton />
        {state.message ? <p className={state.ok ? "text-sm text-emerald-200" : "text-sm text-amber-200"}>{state.message}</p> : null}
      </div>
    </form>
  );
}

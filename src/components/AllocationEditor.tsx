'use client';

import { useState } from 'react';
import type { CaseInput } from '../domain/model';
import { copy, type Locale } from '../i18n/copy';

export function AllocationEditor({ locale, caseId, caseData }: { locale: Locale; caseId: string; caseData: CaseInput }) {
  const t = copy[locale];
  const [owners, setOwners] = useState<number[]>(Array(caseData.items.length).fill(-1));
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const assigned = owners.filter((owner) => owner >= 0).length;
  const complete = assigned === owners.length;

  async function submit() {
    if (!complete || pending) return;
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/cases/${caseId}/allocations`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ owners }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      window.location.href = `/${locale}/allocations/${data.id}`;
    } catch {
      setError(t.networkError);
      setPending(false);
    }
  }

  return (
    <section className="panel allocation-editor" aria-labelledby="allocation-editor-title" aria-busy={pending}>
      <div className="panel-heading allocation-heading">
        <div>
          <p className="flow-step">01</p>
          <h2 id="allocation-editor-title">{t.allocationEditorTitle}</h2>
        </div>
        <div className="assignment-count" aria-live="polite"><strong>{assigned}</strong><span>/ {caseData.items.length}</span></div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="assignment-grid">
        {caseData.items.map((item, i) => {
          const inputId = `owner-${i}`;
          return (
            <div className="assignment-row" key={item}>
              <label htmlFor={inputId}>{locale === 'zh-TW' ? `${item} 的歸屬` : `${item} owner`}</label>
              <select
                id={inputId}
                value={owners[i]}
                disabled={pending}
                onChange={(event) => setOwners(owners.map((owner, index) => index === i ? Number(event.target.value) : owner))}
              >
                <option value={-1}>{t.selectOwner}</option>
                {caseData.agents.map((agent, j) => <option key={agent} value={j}>{agent}</option>)}
              </select>
            </div>
          );
        })}
      </div>
      <div className="editor-action-row">
        <p className={complete ? 'completion-note completion-note--ready' : 'completion-note'}>
          <span aria-hidden="true">{complete ? '✓' : '○'}</span> {complete ? t.assignmentComplete : t.assignmentIncomplete}
        </p>
        <button className="button button-primary" type="button" disabled={!complete || pending} onClick={submit}>
          {pending ? t.submitting : t.submitAllocation}
        </button>
      </div>
    </section>
  );
}

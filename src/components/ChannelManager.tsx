import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import type { AgeId, CustomChannel } from '../types';
import { AGE_GROUPS, ageGroup } from '../data/catalog';
import { allCategoryNames } from '../data/effective';
import type { ResolvedChannel } from '../lib/youtube';
import { useJourney } from '../state/journey-context';
import './ChannelManager.css';

interface Props {
  titleId: string;   // labels the dialog while this view is showing
  onBack: () => void;
}

const OTHER = '__other__';

// First sentence of a channel description, to prefill the "why it's good" note
function firstSentence(text: string, max = 140) {
  const s = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s/)[0] ?? '';
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

type Lookup =
  | { state: 'idle' }
  | { state: 'busy' }
  | { state: 'error'; error: string; restorable?: string }
  | { state: 'found'; channel: ResolvedChannel; needsName: boolean };

interface Row { channelId: string; name: string; category: string; custom?: CustomChannel }

function Avatar({ name, thumb }: { name: string; thumb?: string }) {
  return thumb
    ? <img className="cm__avatar" src={thumb} alt="" loading="lazy" referrerPolicy="no-referrer" />
    : <span className="cm__avatar" aria-hidden="true">{name.charAt(0)}</span>;
}

export default function ChannelManager({ titleId, onBack }: Props) {
  const j = useJourney();
  const { ageCategories, customChannels, hiddenChannels, channelInfo } = j;
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const foundRef = useRef<HTMLParagraphElement>(null);
  const listHeadingRef = useRef<HTMLHeadingElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  // --- add form
  const [url, setUrl] = useState('');
  const [lookup, setLookup] = useState<Lookup>({ state: 'idle' });
  const lookupSeq = useRef(0);
  const [ageIds, setAgeIds] = useState<AgeId[]>(() => (j.viewingAge ? [j.viewingAge] : []));
  const [category, setCategory] = useState<string>(
    () => j.categories[0]?.category ?? allCategoryNames(j.customChannels)[0] ?? OTHER);
  const [otherCategory, setOtherCategory] = useState('');
  const [why, setWhy] = useState('');
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [status, setStatus] = useState('');

  // --- list
  const [listAge, setListAge] = useState<AgeId>(j.viewingAge ?? AGE_GROUPS[0].id);
  const [confirming, setConfirming] = useState<string | null>(null);

  const categoryNames = useMemo(() => allCategoryNames(customChannels), [customChannels]);

  const rows = useMemo(() => {
    const seen = new Set<string>();
    const out: Row[] = [];
    ageCategories(listAge).forEach(cat => cat.channels.forEach(ch => {
      if (seen.has(ch.channelId)) return;
      seen.add(ch.channelId);
      out.push({
        channelId: ch.channelId, name: ch.name, category: cat.category,
        custom: customChannels.find(c => c.channelId === ch.channelId),
      });
    }));
    return out;
  }, [ageCategories, listAge, customChannels]);

  const hiddenRows = useMemo(
    () => hiddenChannels.map(id => ({ id, name: channelInfo(id)?.name ?? id })),
    [hiddenChannels, channelInfo],
  );

  // Focus: heading on open, the found channel after a lookup, the confirm button when asking
  useEffect(() => { headingRef.current?.focus(); }, []);
  useEffect(() => { if (lookup.state === 'found') foundRef.current?.focus(); }, [lookup.state]);
  useEffect(() => { if (confirming) confirmRef.current?.focus(); }, [confirming]);

  const removeBtnId = (channelId: string) => `${uid}-rm-${channelId}`;

  // ------------------------------------------------------------- add
  const find = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(''); setAddError('');
    if (!url.trim()) {
      setLookup({ state: 'error', error: 'Paste a YouTube channel or video link first.' });
      urlRef.current?.focus();
      return;
    }
    setLookup({ state: 'busy' });
    const seq = ++lookupSeq.current;
    const r = await j.lookupChannel(url);
    if (seq !== lookupSeq.current) return; // link was edited while looking up — drop the stale result
    if (!r.ok) {
      setLookup({ state: 'error', error: r.error, restorable: r.restorable });
      urlRef.current?.focus();
      return;
    }
    setLookup({ state: 'found', channel: r.channel, needsName: r.needsName });
    setWhy(firstSentence(r.channel.description));
    setName('');
  };

  const changeUrl = (value: string) => {
    setUrl(value);
    lookupSeq.current++;
    if (lookup.state !== 'idle') setLookup({ state: 'idle' });
    setAddError('');
  };

  const toggleAge = (id: AgeId) =>
    setAgeIds(prev => (prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]));

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (lookup.state !== 'found' || adding) return;
    setAdding(true); setAddError('');
    const r = await j.addChannel({
      url,
      ageIds,
      category: category === OTHER ? otherCategory : category,
      why,
      name: lookup.needsName ? name : undefined,
      resolved: lookup.channel,
    });
    setAdding(false);
    if (!r.ok) { setAddError(r.error); return; }

    const videos = r.videos > 0
      ? `${r.videos} ${r.videos === 1 ? 'video is' : 'videos are'} ready in the feed.`
      : j.hasApiKey
        ? "We couldn't get any videos from it yet."
        : 'Its videos will show once a YouTube API key is set up.';
    setStatus(`Added ${r.name}. ${videos}`);
    if (!ageIds.includes(listAge)) setListAge(AGE_GROUPS.find(g => ageIds.includes(g.id))!.id);
    setUrl(''); setLookup({ state: 'idle' }); setWhy(''); setName(''); setOtherCategory('');
    if (category === OTHER) {
      // Select the category just created (addChannel may have matched an existing one's casing)
      const typed = otherCategory.trim().toLowerCase();
      setCategory(categoryNames.find(c => c.toLowerCase() === typed) ?? otherCategory.trim());
    }
    urlRef.current?.focus();
  };

  const restore = (id: string, focusAfter?: () => void) => {
    const n = channelInfo(id)?.name ?? 'The channel';
    j.restoreChannel(id);
    setStatus(`${n} is back on the hub.`);
    focusAfter?.();
  };

  // ------------------------------------------------------------- remove
  const confirmRemove = (row: Row) => {
    j.removeChannel(row.channelId);
    setConfirming(null);
    setStatus(row.custom
      ? `${row.name} removed.`
      : `${row.name} hidden. You can bring it back from Hidden channels.`);
    listHeadingRef.current?.focus();
  };

  const cancelRemove = (channelId: string) => {
    setConfirming(null);
    // The Remove/Hide button re-renders in place of the confirm row
    requestAnimationFrame(() => document.getElementById(removeBtnId(channelId))?.focus());
  };

  // ------------------------------------------------------------- render
  const busy = lookup.state === 'busy';
  const found = lookup.state === 'found' ? lookup : null;
  const hintId = `${uid}-hint`;

  return (
    <div className="cm">
      <header className="cm__head">
        <button type="button" className="btn btn--ghost cm__back" onClick={onBack}>
          <span aria-hidden="true">←</span> Settings
        </button>
        <h2 className="pgate__title" id={titleId} ref={headingRef} tabIndex={-1}>Channels</h2>
        <p className="pgate__lede">Choose which YouTube channels show on this device.</p>
      </header>

      <p className="cm__status" role="status">{status}</p>

      {/* ---------------------------------------------------- add */}
      <section className="pgate__section" aria-labelledby={`${uid}-add`}>
        <h3 className="pgate__h3" id={`${uid}-add`}>Add a channel</h3>

        <form className="cm__find" onSubmit={find} noValidate>
          <label className="cm__label" htmlFor={`${uid}-url`}>Channel or video link</label>
          <div className="cm__find-row">
            <input
              ref={urlRef}
              id={`${uid}-url`}
              className="cm__input"
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Paste a YouTube channel or video link"
              value={url}
              onChange={e => changeUrl(e.target.value)}
              aria-describedby={hintId}
              aria-invalid={lookup.state === 'error' || undefined}
            />
            <button type="submit" className="btn cm__find-btn" disabled={busy} aria-busy={busy || undefined}>
              {busy ? 'Finding…' : 'Find channel'}
            </button>
          </div>
          <p className="pgate__fine" id={hintId}>
            {j.hasApiKey
              ? 'Works with @handle, /channel/, /user/ and video links. Old /c/ links use a search, which uses more of your daily YouTube quota.'
              : 'No YouTube API key is set up, so only links with a channel ID work (youtube.com/channel/UC…), and the channel won’t have videos until a key is added.'}
          </p>
        </form>

        {lookup.state === 'error' && (
          <div className="cm__error" role="alert">
            <p>{lookup.error}</p>
            {lookup.restorable && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  restore(lookup.restorable!);
                  setUrl(''); setLookup({ state: 'idle' });
                  urlRef.current?.focus();
                }}
              >
                Restore {channelInfo(lookup.restorable)?.name ?? 'channel'}
              </button>
            )}
          </div>
        )}

        {found && (
          <form className="cm__confirm" onSubmit={add} noValidate>
            <div className="cm__found">
              <Avatar name={found.channel.name || '?'} thumb={found.channel.thumb} />
              <div className="cm__found-text">
                <p className="cm__found-name" ref={foundRef} tabIndex={-1}>
                  {found.channel.name || 'Channel found'}
                </p>
                <p className="pgate__fine cm__found-id">{found.channel.channelId}</p>
              </div>
            </div>

            {found.needsName && (
              <div className="cm__field">
                <label className="cm__label" htmlFor={`${uid}-name`}>Channel name</label>
                <input
                  id={`${uid}-name`}
                  className="cm__input"
                  type="text"
                  autoComplete="off"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  aria-describedby={`${uid}-name-help`}
                />
                <p className="pgate__fine" id={`${uid}-name-help`}>
                  We can't look the name up without an API key, so type it as it appears on YouTube.
                </p>
              </div>
            )}

            <fieldset className="cm__field cm__fieldset">
              <legend className="cm__label">Show it to</legend>
              <div className="cm__ages">
                {AGE_GROUPS.map(g => (
                  <label key={g.id} className="cm__check">
                    <input
                      type="checkbox"
                      checked={ageIds.includes(g.id)}
                      onChange={() => toggleAge(g.id)}
                    />
                    <span>{g.range}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="cm__field">
              <label className="cm__label" htmlFor={`${uid}-cat`}>Category</label>
              <select
                id={`${uid}-cat`}
                className="cm__input"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
                <option value={OTHER}>Other…</option>
              </select>
              {category === OTHER && (
                <>
                  <label className="visually-hidden" htmlFor={`${uid}-cat-other`}>New category name</label>
                  <input
                    id={`${uid}-cat-other`}
                    className="cm__input"
                    type="text"
                    autoComplete="off"
                    placeholder="New category name"
                    value={otherCategory}
                    onChange={e => setOtherCategory(e.target.value)}
                  />
                </>
              )}
            </div>

            <div className="cm__field">
              <label className="cm__label" htmlFor={`${uid}-why`}>
                Why it's good <span className="cm__optional">(optional)</span>
              </label>
              <textarea
                id={`${uid}-why`}
                className="cm__input cm__textarea"
                rows={2}
                maxLength={200}
                placeholder="Added by a grown-up"
                value={why}
                onChange={e => setWhy(e.target.value)}
              />
            </div>

            {addError && <p className="cm__error" role="alert">{addError}</p>}

            <div className="cm__actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={adding}
                aria-busy={adding || undefined}
              >
                {adding ? 'Adding…' : 'Add channel'}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => { setLookup({ state: 'idle' }); urlRef.current?.focus(); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ---------------------------------------------------- list */}
      <section className="pgate__section" aria-labelledby={`${uid}-list`}>
        <h3 className="pgate__h3" id={`${uid}-list`} ref={listHeadingRef} tabIndex={-1}>
          Channels on the hub
        </h3>
        <div className="cm__tabs" role="group" aria-label="Show channels for">
          {AGE_GROUPS.map(g => (
            <button
              key={g.id}
              type="button"
              className="chip cm__tab"
              aria-pressed={listAge === g.id}
              onClick={() => { setListAge(g.id); setConfirming(null); }}
            >
              {g.range}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="pgate__help">No channels for {ageGroup(listAge).range.toLowerCase()} yet.</p>
        ) : (
          <ul className="cm__list" aria-label={`Channels for ${ageGroup(listAge).range.toLowerCase()}`}>
            {rows.map(row => (
              <li key={row.channelId} className="cm__row">
                {confirming === row.channelId ? (
                  <div className="cm__ask">
                    <p className="cm__ask-text">
                      {row.custom
                        ? `Remove ${row.name} from all age groups?`
                        : `Hide ${row.name} from all age groups?`}
                    </p>
                    <div className="cm__ask-btns">
                      <button ref={confirmRef} type="button" className="btn cm__danger" onClick={() => confirmRemove(row)}>
                        {row.custom ? 'Remove' : 'Hide'}
                      </button>
                      <button type="button" className="btn btn--ghost" onClick={() => cancelRemove(row.channelId)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Avatar name={row.name} thumb={row.custom?.thumb} />
                    <div className="cm__row-text">
                      <span className="cm__row-name">{row.name}</span>
                      <span className="cm__row-meta">
                        {row.category}
                        {row.custom && <span className="cm__tag">Added by you</span>}
                      </span>
                    </div>
                    <button
                      id={removeBtnId(row.channelId)}
                      type="button"
                      className="btn cm__row-btn"
                      onClick={() => setConfirming(row.channelId)}
                      aria-label={`${row.custom ? 'Remove' : 'Hide'} ${row.name}`}
                    >
                      {row.custom ? 'Remove' : 'Hide'}
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {hiddenRows.length > 0 && (
          <details className="cm__hidden">
            <summary className="cm__summary">Hidden channels ({hiddenRows.length})</summary>
            <ul className="cm__list">
              {hiddenRows.map(h => (
                <li key={h.id} className="cm__row">
                  <Avatar name={h.name} />
                  <div className="cm__row-text">
                    <span className="cm__row-name">{h.name}</span>
                    <span className="cm__row-meta">Hidden in every age group</span>
                  </div>
                  <button
                    type="button"
                    className="btn cm__row-btn"
                    onClick={() => restore(h.id, () => listHeadingRef.current?.focus())}
                    aria-label={`Restore ${h.name}`}
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <div className="pgate__foot">
        <button type="button" className="btn btn--primary btn--lg" onClick={onBack}>
          Back to settings
        </button>
      </div>
    </div>
  );
}

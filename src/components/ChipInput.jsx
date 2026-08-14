import { useRef, useState } from 'react'
import { Icon } from './Icon'
import close from '../assets/icons/close.svg'
import add from '../assets/icons/add.svg'
import chevron from '../assets/icons/chevron.svg'
import './ChipInput.css'

/**
 * Freeform multi-value field (AI Design Language forms pattern):
 * open vocabulary — typed values become chips alongside optional suggestions.
 * Enter / comma / Tab commits; Backspace on empty draft removes the last chip.
 */
export function ChipInput({
  id,
  label,
  values = [],
  onChange,
  placeholder = 'Add an option',
  suggestions = [],
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const commit = (raw) => {
    const next = raw.trim().replace(/^,+|,+$/g, '')
    if (!next) return
    const exists = values.some((v) => v.toLowerCase() === next.toLowerCase())
    setDraft('')
    if (exists) return
    onChange?.([...values, next])
  }

  const remove = (value) => {
    onChange?.(values.filter((v) => v !== value))
    inputRef.current?.focus()
  }

  const addSuggestion = (value) => {
    if (values.some((v) => v.toLowerCase() === value.toLowerCase())) return
    onChange?.([...values, value])
    inputRef.current?.focus()
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      event.stopPropagation()
      commit(draft)
      return
    }
    if (event.key === 'Tab' && draft.trim()) {
      event.preventDefault()
      event.stopPropagation()
      commit(draft)
      return
    }
    if (event.key === 'Backspace' && !draft && values.length) {
      event.preventDefault()
      onChange?.(values.slice(0, -1))
    }
  }

  const remainingSuggestions = suggestions.filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
  )

  return (
    <div className="chip-input field-block">
      {label ? (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <div
        className="typeahead"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="typeahead__chips">
          {values.map((value) => (
            <span key={value} className="chip chip--selected">
              <span>{value}</span>
              <button
                type="button"
                className="chip__remove"
                onClick={(e) => {
                  e.stopPropagation()
                  remove(value)
                }}
                aria-label={`Remove ${value}`}
              >
                <Icon src={close} size={16} />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={id}
            className="typeahead__input"
            value={draft}
            placeholder={values.length ? '' : placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => {
              if (draft.trim()) commit(draft)
            }}
            autoComplete="off"
            aria-label={label || placeholder}
          />
        </div>
        <Icon src={chevron} size={24} />
      </div>

      {remainingSuggestions.length ? (
        <div className="suggest-row">
          <p className="suggest-label-text">Suggested</p>
          <div className="suggest-chips">
            {remainingSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="chip chip--suggest"
                onClick={() => addSuggestion(s)}
              >
                <Icon src={add} size={12} />
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

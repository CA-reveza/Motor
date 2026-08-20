import { useEffect, useRef, useState } from 'react'
import { suggestAddresses } from '../lib/mappls.js'

// Debounced text input backed by Mappls Autosuggest. Calls onSelect with
// { address, lat, lng } once the person picks a suggestion — typing alone
// doesn't produce coordinates, same contract as the old Google version.
export default function AddressInput({ placeholder, value, onChange, onSelect, near }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)

  function handleChange(text) {
    onChange(text)
    setOpen(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await suggestAddresses(text, near)
        setSuggestions(results)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err.message)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  function pick(s) {
    onChange(s.address)
    onSelect?.(s)
    setSuggestions([])
    setOpen(false)
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value && setOpen(true)}
        autoComplete="off"
        required
      />
      {open && (loading || suggestions.length > 0) && (
        <div className="absolute z-10 mt-1 w-full card max-h-64 overflow-y-auto">
          {loading && <p className="dash px-4 py-3">Searching…</p>}
          {!loading &&
            suggestions.map((s, i) => (
              <button
                type="button"
                key={s.eLoc || i}
                onClick={() => pick(s)}
                className="block w-full text-left px-4 py-3 hover:bg-asphalt-800 border-b border-asphalt-800 last:border-b-0"
              >
                <p className="text-asphalt-200 text-sm truncate">{s.address}</p>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

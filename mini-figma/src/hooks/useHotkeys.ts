import { useEffect } from 'react'

export function useHotkeys(_handler?: (key: string, e: KeyboardEvent) => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        return
      }
      if (_handler) _handler(e.key.toLowerCase(), e)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [_handler])
}

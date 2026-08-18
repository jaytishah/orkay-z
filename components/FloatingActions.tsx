'use client';

import { useEffect, useState } from 'react';
import { contact } from '@/content/site';

/* WhatsApp + chat toggle, bottom-right above the fold on every screen.
   The chat button drives the LeadConnector widget when it is configured;
   with no widget id it degrades to the inquiry form rather than
   rendering a button that does nothing. */
export default function FloatingActions() {
  const [chatReady, setChatReady] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GHL_CHAT_WIDGET_ID) return;
    // the loader injects <chat-widget> asynchronously; poll briefly for it
    const started = Date.now();
    const t = setInterval(() => {
      if (document.querySelector('chat-widget')) {
        setChatReady(true);
        clearInterval(t);
      } else if (Date.now() - started > 15000) {
        clearInterval(t);
      }
    }, 500);
    return () => clearInterval(t);
  }, []);

  const openChat = () => {
    const widget = document.querySelector('chat-widget') as
      | (HTMLElement & { openWidget?: () => void })
      | null;
    if (widget?.openWidget) widget.openWidget();
    else widget?.shadowRoot?.querySelector<HTMLElement>('button')?.click();
  };

  return (
    <div className="floaters">
      <a
        className="floater floater--wa"
        href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
          'Hello ORKAY — I would like the export catalogue and pricing.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with ORKAY on WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 .01 16.48Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.55-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.73 2.64 4.19 3.7.59.26 1.04.41 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z"
          />
        </svg>
      </a>

      {chatReady ? (
        <button className="floater floater--chat" onClick={openChat} aria-label="Open the ORKAY chat">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M12 3C6.9 3 2.8 6.5 2.8 10.9c0 2.4 1.2 4.5 3.2 6L5 21l4.4-1.9c.8.2 1.7.3 2.6.3 5.1 0 9.2-3.5 9.2-7.9S17.1 3 12 3Zm-4 9.2a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z"
            />
          </svg>
        </button>
      ) : (
        /* #partner is not rendered on any page — the fallback was a dead
           button. #contact is the footer's phone/email block. */
        <a className="floater floater--chat" href="#contact" aria-label="Contact the ORKAY export team">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M12 3C6.9 3 2.8 6.5 2.8 10.9c0 2.4 1.2 4.5 3.2 6L5 21l4.4-1.9c.8.2 1.7.3 2.6.3 5.1 0 9.2-3.5 9.2-7.9S17.1 3 12 3Zm-4 9.2a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z"
            />
          </svg>
        </a>
      )}
    </div>
  );
}

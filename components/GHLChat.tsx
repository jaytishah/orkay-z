'use client';

import Script from 'next/script';

/* LeadConnector (GoHighLevel) chat widget — the AI chatbot that answers
   catalogue, MOQ and export questions across time zones.
   Renders nothing until the client's widget id is configured. */
export default function GHLChat() {
  const widgetId = process.env.NEXT_PUBLIC_GHL_CHAT_WIDGET_ID;
  if (!widgetId) return null;

  return (
    <Script
      src="https://widgets.leadconnectorhq.com/loader.js"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id={widgetId}
      strategy="lazyOnload"
    />
  );
}

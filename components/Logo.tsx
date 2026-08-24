/* The brand lockup as shipped by the client (LOGO.cdr → previews/thumbnail.png,
   white background cut out). Two colourways: the dark ink original and a white
   clone with the red bullseye and swoosh kept, so the fixed header mark can
   still run its zebra clip-path inversion over light sections.
   Plain <img> for the same reason as the rest of the site — next/image adds
   nothing to a fixed-size vector-ish PNG served from /public. */
export default function Logo({ variant = 'dark' }: { variant?: 'dark' | 'white' }) {
  return (
    <img
      src={`/img/logo_orkay${variant === 'white' ? '_white' : ''}.png`}
      alt="ORKAY Tiles"
      className="brandmark"
      width={703}
      height={256}
    />
  );
}

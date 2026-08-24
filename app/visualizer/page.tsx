import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/SiteChrome';
import PageChrome from '@/components/PageChrome';
import CollectionReveal from '@/components/CollectionReveal';
import RoomVisualizer from '@/components/RoomVisualizer';
import { vizPage, vizRooms, vizTiles } from '@/content/pages';
import { site } from '@/content/site';
import '../pages.css';

export const metadata: Metadata = {
  title: 'Digital Visualisation — ORKAY Tiles',
  description:
    'Drop an ORKAY surface into a real room and judge the shade at room scale. Interactive tile visualiser across lobby, living room, kitchen, bathroom and terrace scenes.',
  openGraph: {
    title: 'ORKAY Digital Visualisation',
    description: 'See the floor before the container sails.',
    images: ['/img/gal_lobby.jpg'],
  },
};

export default function VisualizerPage() {
  return (
    <>
      <span id="top" />
      <CollectionReveal />
      <PageChrome polarity="dark" />

      <main className="pg-main">
        <section className="section pg-hero ui-dark" data-polarity="dark">
          <p className="text-small pg-hero__kicker">{vizPage.kicker}</p>
          <h1 className="h-display pg-hero__title reveal-lines">
            See the floor<br />before the<br />container sails
          </h1>
          <p className="pg-hero__lede reveal-lines">{vizPage.lede}</p>
        </section>

        <section className="section pg--tight ui-dark" data-polarity="dark" id="tool">
          <RoomVisualizer rooms={vizRooms} tiles={vizTiles} />
        </section>

        <section className="section pg ui-light" data-polarity="light" id="how">
          <p className="text-small pg__label">How it works</p>
          <h2 className="h-mid pg__title reveal-lines">Perspective,<br />not a flat overlay</h2>
          <div className="pg-grid pg-grid--3">
            <div className="pg-item">
              <p className="text-small">Mapped in true perspective</p>
              <p className="text-small pg-item__desc">
                The surface is warped onto the floor plane with a projective transform, so tiles
                shrink as they recede exactly as they would in the room. A flat overlay cannot do
                this — it reads as a sticker.
              </p>
            </div>
            <div className="pg-item">
              <p className="text-small">Lit by the room</p>
              <p className="text-small pg-item__desc">
                On <em>Keep room light</em> the tile is blended with the photograph, so the room&apos;s
                own shadows, reflections and falloff carry through. Switch to <em>True colour</em> to
                judge the shade on its own.
              </p>
            </div>
            <div className="pg-item">
              <p className="text-small">Scaled to a real format</p>
              <p className="text-small pg-item__desc">
                The slider sets how many tiles span the front of the room, which is how a
                600×1200 reads differently from an 800×800 in the same space.
              </p>
            </div>
          </div>
        </section>

        <section className="section pg ui-dark" data-polarity="dark" id="limits">
          <p className="text-small pg__label">What it is and is not</p>
          <h2 className="h-mid pg__title reveal-lines">A judgement aid,<br />not a proof</h2>
          <p className="text-small pg__lede">
            Screens differ, room photography is lit for effect, and a rendered surface is not a
            fired one. Use this to narrow a shortlist, then ask for physical samples before you
            commit a container. Shade, calibre and finish are approved off the sample, never off
            a screen.
          </p>
          <div className="pg-table text-small">
            <div>
              <span>Good for</span>
              <span>Comparing shades at room scale, testing format size, shortlisting for a project</span>
            </div>
            <div>
              <span>Not a substitute for</span>
              <span>Physical samples, shade cards, or an approved production sample</span>
            </div>
            <div>
              <span>Room scenes</span>
              <span>Stock ORKAY photography — floor areas are mapped by hand per scene</span>
            </div>
          </div>
        </section>

        <section className="section pg-cta ui-dark" data-polarity="dark">
          <a href={`mailto:${site.email}?subject=Sample request from the visualiser`} className="btn btn--underline btn--red">
            <span className="btn__mask">
              <span className="btn__text">Request Physical Samples</span>
              <span className="btn__text btn__text--clone">Request Physical Samples</span>
            </span>
          </a>
          <Link href="/products" className="btn btn--underline">
            <span className="btn__mask">
              <span className="btn__text">See the Full Ranges</span>
              <span className="btn__text btn__text--clone">See the Full Ranges</span>
            </span>
          </Link>
        </section>

        <Footer />
      </main>
    </>
  );
}

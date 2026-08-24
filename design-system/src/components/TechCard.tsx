import { cx } from './cx';

export interface TechCardProps {
  /** Service name. */
  name: string;
  /** One-line description. */
  desc: string;
  className?: string;
}

/**
 * A service card from the technologies stack. Deliberately plain — a rule, a
 * name and a description, no border box, no icon, no hover lift. The cards
 * brighten in sequence as the section scrolls; that sequencing is the host app's
 * job, and the card renders at full brightness without it.
 */
export function TechCard({ name, desc, className }: TechCardProps) {
  return (
    <article className={cx('tech__card', className)}>
      <p className="text-small tech__label">{name}</p>
      <p className="text-small tech__desc">{desc}</p>
    </article>
  );
}

import {COPY} from '../config/copy';
import {LATEST_POSTS, type MediaItem} from '../config/media';
import {PROFILE} from '../config/profile';
import {useRegistration} from '../context/registration';
import {track} from '../lib/analytics';
import {AffiliateLink} from './AffiliateLink';
import {GalleryGrid} from './GalleryGrid';

export function LatestPosts() {
  const openRegistration = useRegistration();
  const total = PROFILE.stats.photos + PROFILE.stats.videos;

  const select = (item: MediaItem) => {
    track('locked_content_click', {section: 'posts', media_type: item.kind, item_id: item.id});
    openRegistration(item.kind);
  };

  return (
    <section aria-labelledby="posts-title">
      <div className="section-head">
        <div>
          <h2 id="posts-title" className="section-title">
            Latest posts
          </h2>
          <p className="section-sub">
            {LATEST_POSTS.length} of {total} posts. Tap any post to unlock it{COPY.forFree}.
          </p>
        </div>
        <AffiliateLink placement="posts_see_all" intent="join" className="text-link">
          See all
        </AffiliateLink>
      </div>
      <GalleryGrid items={LATEST_POSTS} onSelect={select} />
    </section>
  );
}

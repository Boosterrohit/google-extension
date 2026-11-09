import { CSSProperties, useEffect, useState } from 'react';
import animeVideo from '../assets/anime.mp4';
import mountainVideo from '../assets/mountain.mp4';
import windowVideo from '../assets/window.mp4';
import moonlightVideo from '../assets/moonlight.mp4';
import oceanSunsetVideo from '../assets/Ocean_sunset.mp4';
import elegantVideo from '../assets/elegent.mp4';
import gamingVideo from '../assets/gaming.mp4';
import Productivity from "../assets/productive.mp4";
import { Appearance } from '../types';
import { loadBackgroundAsset, loadBackgroundVideo } from '../backgrounds';

const VIDEOS: Record<string, string> = {
  'anime-sunset': animeVideo,
  'mountain-view': mountainVideo,
  'windows-style': windowVideo,
  moonlight: moonlightVideo,
  'ocean-sunset': oceanSunsetVideo,
  'elegant-dark': elegantVideo,
  'gaming-zone': gamingVideo,
  'productivity-pro': Productivity,
};

interface Props {
  templateId: string;
  bgMode: Appearance['bgMode'];
  background: string;
  className?: string;
  style?: CSSProperties;
}

export default function TemplateBackground({ templateId, bgMode, background, className = 'absolute inset-0', style }: Props) {
  const [customMedia, setCustomMedia] = useState<{ url: string; type: string }>();
  useEffect(() => {
    const assetKey = bgMode === 'video'
      ? 'custom-background-video'
      : bgMode === 'template' && templateId.startsWith('user-template-')
        ? templateId
        : undefined;
    if (!assetKey) {
      setCustomMedia(undefined);
      return;
    }

    let active = true;
    let objectUrl: string | undefined;
    setCustomMedia(undefined);
    const load = bgMode === 'video' ? loadBackgroundVideo() : loadBackgroundAsset(assetKey);
    void load.then(blob => {
      if (!blob) throw new Error('No saved custom background was found.');
      objectUrl = URL.createObjectURL(blob);
      if (active) setCustomMedia({ url: objectUrl, type: blob.type });
      else URL.revokeObjectURL(objectUrl);
    }).catch(error => {
      if (active) console.error('Could not load the custom background.', error);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [bgMode, templateId]);

  if (customMedia?.type.startsWith('video/')) {
    return (
      <div className={className} style={style} aria-hidden="true">
        <video className="absolute inset-0 h-full w-full object-cover" src={customMedia.url} autoPlay muted loop playsInline tabIndex={-1} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(7, 10, 20, .52) 0%, rgba(7, 10, 20, .2) 45%, rgba(7, 10, 20, .58) 100%)' }} />
      </div>
    );
  }

  if (customMedia?.type.startsWith('image/')) {
    return <div className={className} style={{ backgroundImage: `url("${customMedia.url}")`, backgroundSize: 'cover', backgroundPosition: 'center', ...style }} aria-hidden="true" />;
  }

  const video = bgMode === 'template' ? VIDEOS[templateId] : undefined;
  if (video) {
    return (
      <div className={className} style={style} aria-hidden="true">
        <video className="absolute inset-0 h-full w-full object-cover" src={video} autoPlay muted loop playsInline tabIndex={-1} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(7, 10, 20, .52) 0%, rgba(7, 10, 20, .2) 45%, rgba(7, 10, 20, .58) 100%)' }} />
      </div>
    );
  }

  return <div className={className} style={{ backgroundImage: background, backgroundSize: 'cover', backgroundPosition: 'center', ...style }} aria-hidden="true" />;
}

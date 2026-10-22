import { VideoGeneratorWorkspace } from '@/components/VideoGeneratorWorkspace';

export const metadata = {
  title: 'AI Video Generator | Slipe AI Enterprise',
  description: 'Broadcast-quality 1080p 24 FPS Full HD AI video generation powered by LTX-Video on Google Cloud GPU infrastructure.',
};

export default function VideoGeneratorPage() {
  return <VideoGeneratorWorkspace />;
}

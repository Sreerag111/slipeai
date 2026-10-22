'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { getFeatureById } from '@/lib/features';
import { BatchWorkspace } from '@/components/BatchWorkspace';
import { AdGeneratorWorkspace } from '@/components/AdGeneratorWorkspace';
import { VideoGeneratorWorkspace } from '@/components/VideoGeneratorWorkspace';

export default function WorkspaceFeaturePage() {
  const params = useParams();
  const featureId = params.featureId as string;

  if (featureId === 'ad-generator') {
    return <AdGeneratorWorkspace />;
  }

  if (featureId === 'video-generator') {
    return <VideoGeneratorWorkspace />;
  }

  const feature = getFeatureById(featureId);
  if (!feature) {
    // If not matching exact ID, fallback to upscale or return notFound
    const fallback = getFeatureById('upscale');
    if (!fallback) return notFound();
    return <BatchWorkspace feature={fallback} />;
  }

  return <BatchWorkspace feature={feature} />;
}

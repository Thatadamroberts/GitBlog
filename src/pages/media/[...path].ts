import type { APIRoute, GetStaticPaths } from 'astro';
import { getProjects } from '../../lib/github';
import { mediaEntries } from '../../lib/media';

// Writes each image downloaded during the build (see src/lib/media.ts) into the site as a file.
export const getStaticPaths: GetStaticPaths = async () => {
  await getProjects();
  return mediaEntries().map(([path, bytes]) => ({ params: { path }, props: { bytes } }));
};

export const GET: APIRoute = ({ props }) => new Response(props.bytes as Uint8Array);

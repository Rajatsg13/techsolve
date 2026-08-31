import { toolMetadata } from '../lib/toolMeta';

export const metadata = toolMetadata('/contact/', {
  title: 'Contact',
  description: 'Get in touch with the Tools by Decyfy team. Questions, feedback and bug reports are always welcome.',
  openGraph: {
    title: 'Contact Tools by Decyfy',
    description: 'Questions, feedback or bug reports? Reach the Tools by Decyfy team.',
  },
});

export default function Layout({ children }) {
  return children;
}

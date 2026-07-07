import { toolMetadata } from '../lib/toolMeta';

export const metadata = toolMetadata('/contact/', {
  title: 'Contact — TechSolve44',
  description: 'Get in touch with the TechSolve44 team. Questions, feedback and bug reports are always welcome.',
  openGraph: {
    title: 'Contact TechSolve44',
    description: 'Questions, feedback or bug reports? Reach the TechSolve44 team.',
  },
});

export default function Layout({ children }) {
  return children;
}

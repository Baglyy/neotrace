import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/home')({
  beforeLoad: () => {
    return {
      title: "Home",
      breadcrumb: "Home",
    };
  },
});
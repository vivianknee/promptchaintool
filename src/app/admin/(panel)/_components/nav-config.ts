export type NavGroup = {
  label: string;
  items: { href: string; label: string }[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Flavors",
    items: [
      { href: "/admin/humor-flavors", label: "Humor Flavors" },
    ],
  },
  {
    label: "Testing",
    items: [
      { href: "/admin/test", label: "Test Flavor" },
      { href: "/admin/results", label: "Results" },
    ],
  },
];

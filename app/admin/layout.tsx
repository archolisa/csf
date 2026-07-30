export const metadata = {
  title: "Cyril & Susanna Foundation Admin - Scholarship Management",
  description: "Admin dashboard for managing scholarship applications and documents",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="font-montserrat">{children}</div>;
}

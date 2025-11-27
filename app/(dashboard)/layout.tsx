import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="p-4 flex items-center gap-2 border-b">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Workspace</h1>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}

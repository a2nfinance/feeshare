"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname, useRouter } from 'next/navigation';
import { AppSidebar } from "./sidebar/app-sidebar";
export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter()

  const segments = pathname
    .split('/')
    .filter((segment) => segment !== '');

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = decodeURIComponent(segment)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize

    return { label, href };
  });
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, i) => {
                  return <span key={`breadcrum-wrapper-${i}`} className="flex items-center">
                    <BreadcrumbItem key={crumb.href} className="hidden md:block">
                      <BreadcrumbLink key={`link-${i}`} onClick={() => router.push(i < breadcrumbs.length - 1 ? `/${crumb.label.toLowerCase()}` : "#")} className="hover:cursor-pointer">
                        {crumb.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {i < breadcrumbs.length - 1 && <BreadcrumbSeparator key={`seperator-${i}`} className="hidden md:block mt-1 ml-2" />}

                  </span>
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="px-4">
            <ConnectButton />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

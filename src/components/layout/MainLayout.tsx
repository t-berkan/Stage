import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      <Sidebar />
      <MobileNav />
      <div className="md:pl-40 transition-all duration-300 ease-in-out h-screen pt-0 pb-20 px-2 pr-2 md:px-0 md:pb-12 md:pr-12 flex flex-col">
        <Header />
        <div className="bg-white rounded-[20px] md:rounded-[30px] shadow-[0_0_15px_-3px_rgba(0,0,0,0.05)] flex-1 border border-gray-100/50 overflow-hidden flex flex-col">
          <main className="px-3 md:px-5 pt-4 md:pt-8 pb-4 flex-1 overflow-hidden flex flex-col min-h-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
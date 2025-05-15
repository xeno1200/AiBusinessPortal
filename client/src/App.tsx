import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import ContentList from "@/pages/admin/ContentList";
import ContentForm from "@/pages/admin/ContentForm";
import ServerTest from "@/pages/ServerTest";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/login" component={Login} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/content" component={ContentList} />
      <Route path="/admin/content/new" component={ContentForm} />
      <Route path="/admin/content/edit/:id" component={ContentForm} />
      <Route path="/server-test" component={ServerTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { i18n } = useTranslation();

  // Check if current path is admin route
  const isAdmin = window.location.pathname.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <TooltipProvider>
          <div className={`${i18n.language}`}>
            {!isAdmin && <Header />}
            <main>
              <Router />
            </main>
            {!isAdmin && <Footer />}
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

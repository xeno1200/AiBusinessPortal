import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
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
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
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

  // Only hide header/footer for admin routes and dashboard (not for login/register)
  const isAdmin = window.location.pathname.startsWith('/admin');
  const isDashboard = window.location.pathname === '/dashboard';
  const hideHeaderFooter = isAdmin || isDashboard;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <TooltipProvider>
          <div className={`${i18n.language}`}>
            {!hideHeaderFooter && <Header />}
            <main>
              <Router />
            </main>
            {!hideHeaderFooter && <Footer />}
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

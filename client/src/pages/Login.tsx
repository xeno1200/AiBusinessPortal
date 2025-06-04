import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { LogIn, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required."
  }),
  password: z.string().min(1, {
    message: "Password is required."
  })
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => {
      return apiRequest("/api/auth/login", { 
        method: "POST", 
        body: JSON.stringify(data)
      });
    },
    onSuccess: async () => {
      // Invalidate and refetch user data to ensure authentication state is updated
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      // Small delay to ensure cache is updated before navigation
      setTimeout(() => {
        setLocation("/dashboard");
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - AI Business Portal</title>
        <meta name="description" content="Sign in to your AI Business Portal account and manage your intelligent phone agents." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full"
        >
          <Card className="shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="text-primary-600 mb-4">
                <LogIn className="w-12 h-12 mx-auto" />
              </div>
              <CardTitle className="font-heading text-2xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username or Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username or email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer">
                    Create one here
                  </Link>
                </p>
              </div>
              
              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
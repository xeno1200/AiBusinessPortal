import { useTranslation } from "react-i18next";
import { useState } from "react";
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
import { UserPlus, ArrowLeft, CheckCircle } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters."
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters."
  }).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters."
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: Omit<RegisterFormValues, "confirmPassword">) => {
      return apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (_, variables) => {
      // Auto-login after successful registration
      loginMutation.mutate({
        username: variables.username,
        password: variables.password
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive"
      });
    }
  });

  // Auto-login mutation after successful registration
  const loginMutation = useMutation({
    mutationFn: (credentials: { username: string; password: string }) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
    },
    onSuccess: async () => {
      // Invalidate and refetch user data to ensure authentication state is updated
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      
      toast({
        title: "Welcome to AI Business Portal!",
        description: "You have been logged in successfully.",
      });
      
      // Small delay to ensure cache is updated before navigation
      setTimeout(() => {
        setLocation("/dashboard");
      }, 100);
    },
    onError: (error: any) => {
      // If auto-login fails, still show success and redirect to login
      setIsSuccess(true);
      toast({
        title: "Registration successful!",
        description: "Please log in with your new account.",
      });
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (isSuccess) {
    return (
      <>
        <Helmet>
          <title>Registration Successful - AI Business Portal</title>
        </Helmet>
        
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md w-full"
          >
            <Card className="shadow-xl">
              <CardContent className="pt-8 text-center">
                <div className="text-primary-600 mb-6">
                  <CheckCircle className="w-16 h-16 mx-auto" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                  Welcome to AI Business Portal!
                </h2>
                <p className="text-gray-600 mb-8">
                  Your account has been successfully created. You can now log in and start exploring our platform.
                </p>
                <div className="space-y-4">
                  <Button asChild className="w-full">
                    <Link href="/login">
                      Sign In to Your Account
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Account - AI Business Portal</title>
        <meta name="description" content="Join AI Business Portal and transform your customer interactions with intelligent phone agents." />
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
                <UserPlus className="w-12 h-12 mx-auto" />
              </div>
              <CardTitle className="font-heading text-2xl font-bold text-gray-900">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Join thousands of businesses using AI to enhance customer service
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
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
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer">
                    Sign in here
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

export default Register;
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export default function ServerCheck() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      setStatus('loading');
      setMessage('Checking server connection...');
      
      // Try a simple API call
      const response = await fetch('/api/cms/settings');
      
      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setMessage(`Server is working! Received ${data.length} settings.`);
      } else {
        setStatus('error');
        setMessage(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Server connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="mt-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Server Connection</h2>
      
      <Alert className={
        status === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-800' :
        status === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-800' :
        'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-800'
      }>
        {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
        {status === 'error' && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
        <AlertTitle className={
          status === 'success' ? 'text-green-800 dark:text-green-300' : 
          status === 'error' ? 'text-red-800 dark:text-red-300' :
          'text-blue-800 dark:text-blue-300'
        }>
          {status === 'loading' ? 'Checking Server Connection...' : 
           status === 'success' ? 'Server Connected!' : 
           'Server Connection Failed'}
        </AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
      </Alert>
      
      <Button 
        className="mt-4" 
        variant={status === 'error' ? 'destructive' : 'default'}
        onClick={checkServer}>
        Check Again
      </Button>
    </div>
  );
}
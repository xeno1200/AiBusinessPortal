import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ServerCheck from "@/components/ServerCheck";

export default function ServerTest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">IOBIC Server Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Server Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ServerCheck />
        </CardContent>
      </Card>
    </div>
  );
}
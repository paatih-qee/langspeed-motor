import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import Dashboard from "./Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Authenticated>
        <Dashboard />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md mx-auto p-8">
            <img className="mb-[10px]" src="assets\img\logo langspeed.png" alt="" />
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Langspeed Motor</h1>
              <p className="text-gray-600">Sistem Manajemen Servis dan Suku Cadang</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      <Toaster />
    </div>
  );
}
